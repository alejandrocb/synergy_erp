import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68dfd15bdb69c41a0a3e58c3", 
  requiresAuth: true // Ensure authentication is required for all operations
});
