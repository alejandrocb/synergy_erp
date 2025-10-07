const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function getCrypto() {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto?.subtle) {
    return globalThis.crypto;
  }
  throw new Error('Web Crypto API is not available in this environment');
}

const cryptoApi = getCrypto();
const subtle = cryptoApi.subtle;

function base64UrlEncode(bytes) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(normalized, 'base64'));
  }
  const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getRandomBytes(length) {
  const array = new Uint8Array(length);
  cryptoApi.getRandomValues(array);
  return array;
}

async function deriveKey(password, salt, iterations = 310000, length = 32) {
  const keyMaterial = await subtle.importKey(
    'raw',
    textEncoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );

  const derivedBits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    keyMaterial,
    length * 8,
  );

  return new Uint8Array(derivedBits);
}

export async function hashPassword(password, options = {}) {
  if (!password) {
    throw new Error('PASSWORD_REQUIRED');
  }

  const iterations = options.iterations ?? 310000;
  const salt = options.salt ?? getRandomBytes(16);
  const derived = await deriveKey(password, salt, iterations);

  return `pbkdf2$sha256$${iterations}$${base64UrlEncode(salt)}$${base64UrlEncode(derived)}`;
}

export async function verifyPassword(password, storedHash) {
  if (!storedHash) {
    return false;
  }
  const parts = storedHash.split('$');
  if (parts.length !== 5) {
    return false;
  }

  const iterations = Number(parts[2]);
  const salt = base64UrlDecode(parts[3]);
  const expectedHash = base64UrlDecode(parts[4]);

  const candidate = await deriveKey(password, salt, iterations, expectedHash.length);

  if (candidate.length !== expectedHash.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < candidate.length; i += 1) {
    diff |= candidate[i] ^ expectedHash[i];
  }
  return diff === 0;
}

async function createHmac(data, secret) {
  const key = await subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await subtle.sign('HMAC', key, textEncoder.encode(data));
  return new Uint8Array(signature);
}

export async function signJwt(payload, secret, expiresInSeconds = 60 * 60 * 8) {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const body = {
    iat: now,
    exp: now + expiresInSeconds,
    ...payload,
  };

  const encodedHeader = base64UrlEncode(textEncoder.encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(textEncoder.encode(JSON.stringify(body)));
  const signature = await createHmac(`${encodedHeader}.${encodedPayload}`, secret);

  return `${encodedHeader}.${encodedPayload}.${base64UrlEncode(signature)}`;
}

export async function verifyJwt(token, secret) {
  if (!token) {
    throw new Error('TOKEN_REQUIRED');
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('TOKEN_MALFORMED');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const signature = base64UrlDecode(encodedSignature);
  const expectedSignature = await createHmac(`${encodedHeader}.${encodedPayload}`, secret);

  if (signature.length !== expectedSignature.length) {
    throw new Error('TOKEN_INVALID');
  }

  let diff = 0;
  for (let i = 0; i < signature.length; i += 1) {
    diff |= signature[i] ^ expectedSignature[i];
  }

  if (diff !== 0) {
    throw new Error('TOKEN_INVALID');
  }

  const payloadBytes = base64UrlDecode(encodedPayload);
  const payload = JSON.parse(textDecoder.decode(payloadBytes));

  if (payload.exp && Math.floor(Date.now() / 1000) >= payload.exp) {
    throw new Error('TOKEN_EXPIRED');
  }

  return payload;
}
