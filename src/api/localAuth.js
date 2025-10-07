import { hashPassword, verifyPassword, signJwt, verifyJwt } from './security.js';
import { loadDatabase, persistDatabase, getDefaultDatabase } from './localDb.js';

const TOKEN_STORAGE_KEY = 'synergy_erp_auth_token';
const RESET_STORAGE_KEY = 'synergy_erp_password_resets';
const RESET_EXPIRY_MINUTES = 30;

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }

  if (!globalThis.__SYNERGY_AUTH_MEMORY__) {
    globalThis.__SYNERGY_AUTH_MEMORY__ = new Map();
  }

  const store = globalThis.__SYNERGY_AUTH_MEMORY__;

  return {
    getItem(key) {
      return store.get(key) ?? null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

function getJwtSecret() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_JWT_SECRET) {
    return import.meta.env.VITE_APP_JWT_SECRET;
  }
  return 'synergy-erp-local-secret';
}

function now() {
  return new Date();
}

function serialiseUser(user) {
  if (!user) {
    return null;
  }
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

function loadResetTokens() {
  const storage = getStorage();
  const raw = storage.getItem(RESET_STORAGE_KEY);
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch (error) {
    console.error('Failed to parse stored reset tokens', error);
    return {};
  }
}

function persistResetTokens(tokens) {
  const storage = getStorage();
  storage.setItem(RESET_STORAGE_KEY, JSON.stringify(tokens));
}

export const authService = {
  async register({ email, password, full_name, username }) {
    if (!email) {
      throw new Error('EMAIL_REQUIRED');
    }
    if (!password) {
      throw new Error('PASSWORD_REQUIRED');
    }

    const db = loadDatabase();
    const normalisedEmail = email.trim().toLowerCase();
    const existingUser = db.users.find((user) => user.email.toLowerCase() === normalisedEmail);
    if (existingUser) {
      throw new Error('USER_ALREADY_EXISTS');
    }

    const passwordHash = await hashPassword(password);

    const newUser = {
      id: typeof globalThis.crypto?.randomUUID === 'function'
        ? globalThis.crypto.randomUUID()
        : `user-${Math.random().toString(16).slice(2)}-${Date.now()}`,
      email: normalisedEmail,
      username: username?.trim() || normalisedEmail.split('@')[0],
      full_name: full_name?.trim() || '',
      role: 'user',
      password_hash: passwordHash,
      created_date: now().toISOString(),
      last_login_at: null,
    };

    db.users.push(newUser);
    persistDatabase(db);

    return serialiseUser(newUser);
  },

  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const db = loadDatabase();
    const normalisedEmail = email.trim().toLowerCase();
    const user = db.users.find((candidate) => candidate.email.toLowerCase() === normalisedEmail);

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    user.last_login_at = now().toISOString();
    persistDatabase(db);

    const token = await signJwt({
      sub: user.id,
      email: user.email,
      role: user.role,
    }, getJwtSecret());

    const storage = getStorage();
    storage.setItem(TOKEN_STORAGE_KEY, token);

    return {
      token,
      user: serialiseUser(user),
    };
  },

  async logout() {
    const storage = getStorage();
    storage.removeItem(TOKEN_STORAGE_KEY);
    return { success: true };
  },

  async getCurrentUser() {
    const storage = getStorage();
    const token = storage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      throw new Error('NOT_AUTHENTICATED');
    }

    try {
      const decoded = await verifyJwt(token, getJwtSecret());
      const db = loadDatabase();
      const user = db.users.find((candidate) => candidate.id === decoded.sub);
      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }
      return serialiseUser(user);
    } catch (error) {
      storage.removeItem(TOKEN_STORAGE_KEY);
      throw new Error('NOT_AUTHENTICATED');
    }
  },

  async listUsers() {
    const db = loadDatabase();
    return db.users.map(serialiseUser);
  },

  async updateUser(id, updates) {
    const db = loadDatabase();
    const index = db.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new Error('USER_NOT_FOUND');
    }

    const user = db.users[index];
    const nextUser = {
      ...user,
      ...updates,
    };
    if (updates.password) {
      nextUser.password_hash = await hashPassword(updates.password);
    }

    db.users[index] = nextUser;
    persistDatabase(db);

    return serialiseUser(nextUser);
  },

  async deleteUser(id) {
    const db = loadDatabase();
    db.users = db.users.filter((user) => user.id !== id);
    persistDatabase(db);
    return { success: true };
  },

  async requestPasswordReset(email) {
    if (!email) {
      throw new Error('EMAIL_REQUIRED');
    }

    const db = loadDatabase();
    const normalisedEmail = email.trim().toLowerCase();
    const user = db.users.find((candidate) => candidate.email.toLowerCase() === normalisedEmail);

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const token = typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `reset-${Math.random().toString(16).slice(2)}-${Date.now()}`;

    const expiresAt = new Date(now().getTime() + RESET_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const tokens = loadResetTokens();
    tokens[token] = { userId: user.id, expiresAt };
    persistResetTokens(tokens);

    return { token, expiresAt };
  },

  async resetPassword(token, newPassword) {
    if (!token || !newPassword) {
      throw new Error('RESET_TOKEN_REQUIRED');
    }

    const tokens = loadResetTokens();
    const data = tokens[token];
    if (!data) {
      throw new Error('RESET_TOKEN_INVALID');
    }

    if (new Date(data.expiresAt) < now()) {
      delete tokens[token];
      persistResetTokens(tokens);
      throw new Error('RESET_TOKEN_EXPIRED');
    }

    const db = loadDatabase();
    const user = db.users.find((candidate) => candidate.id === data.userId);
    if (!user) {
      delete tokens[token];
      persistResetTokens(tokens);
      throw new Error('USER_NOT_FOUND');
    }

    user.password_hash = await hashPassword(newPassword);
    persistDatabase(db);

    delete tokens[token];
    persistResetTokens(tokens);

    return serialiseUser(user);
  },

  async bootstrapDefaults() {
    const db = loadDatabase();
    if (!db.users || db.users.length === 0) {
      const defaults = getDefaultDatabase();
      db.users = defaults.users;
      persistDatabase(db);
    }
  },
};
