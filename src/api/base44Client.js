const isTestEnv = process?.env?.NODE_ENV === 'test';

function buildFallbackClient() {
  return {
    entities: {},
    integrations: { Core: {} },
    auth: {},
  };
}

let sdkFactory = () => buildFallbackClient();

export function createBase44Client(factory = sdkFactory) {
  return factory({
    appId: "68dfd15bdb69c41a0a3e58c3",
    requiresAuth: true,
  });
}

export const base44 = await (async () => {
  if (isTestEnv) {
    const fallback = buildFallbackClient();
    sdkFactory = () => fallback;
    return fallback;
  }

  const sdkModule = await import('@base44/sdk');
  const candidateFactory = sdkModule.createClient ?? sdkModule.default;

  if (typeof candidateFactory !== 'function') {
    throw new Error('Base44 SDK client factory is not available.');
  }

  sdkFactory = candidateFactory;
  return createBase44Client(candidateFactory);
})();
