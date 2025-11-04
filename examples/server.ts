import { WalletSSOServer } from '../src/WalletSSOServer';

// Example configuration
const config = {
  jwtSecret: 'your-super-secret-jwt-key-change-in-production',
  jwtIssuer: 'http://localhost:3001',
  jwtAudience: 'wallet-sso-demo',
  accessTokenExpiry: 3600, // 1 hour
  refreshTokenExpiry: 86400, // 24 hours
  sessionSecret: 'your-session-secret-change-in-production',
  port: 3001,
  corsOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080', 'http://192.168.86.56:8080'],
  // polkadotEndpoints: [
  //   'wss://archive-ws.paseo.network',
  //   'wss://paseo-rpc.dwellir.com'
  // ],
};

// Create and start the SSO server
const server = new WalletSSOServer(config);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await server.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await server.cleanup();
  process.exit(0);
});

// Start the server
server.start();

console.log(`
🚀 Wallet SSO Server started!

Endpoints:
- Health: http://localhost:3001/health
- Auth Challenge: POST http://localhost:3001/auth/challenge
- Auth Login: POST http://localhost:3001/auth/login
- Token Refresh: POST http://localhost:3001/auth/refresh
- Token Verify: GET http://localhost:3001/auth/verify
- User Profile: GET http://localhost:3001/user/profile
- OIDC Discovery: GET http://localhost:3001/.well-known/openid-configuration

Example usage:
curl -X POST http://localhost:3001/auth/challenge \\
  -H "Content-Type: application/json" \\
  -d '{"address": "0x1234...abcd", "walletType": "metamask"}'
`);