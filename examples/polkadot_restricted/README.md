# Polkadot Address Restricted Example

This example demonstrates how to implement **address-based access restrictions** for Polkadot wallets using the wallet-sso library. Only specific whitelisted Polkadot addresses can authenticate with this service.

## Features

- 🔐 **Address-based restrictions**: Only whitelisted Polkadot addresses can authenticate
- 🏗️ **Express.js server**: Backend with address validation middleware
- 🌐 **Frontend demo**: HTML page showing address restriction UI
- 📋 **Whitelist management**: Configurable list of authorized addresses
- 🔍 **Detailed logging**: Comprehensive authentication flow logging

## Prerequisites

- Node.js 16+
- Polkadot.js browser extension
- A Polkadot wallet with an address in the whitelist

## Setup

1. **Install dependencies** (from the wallet-sso root directory):
   ```bash
   npm install
   ```

2. **Configure whitelisted addresses**:
   Edit `polkadot-address-restricted-server.ts` and update the `WHITELISTED_ADDRESSES` array with real Polkadot addresses:

   ```typescript
   const WHITELISTED_ADDRESSES: string[] = [
     '1ABC...', // Replace with actual Polkadot addresses
     '5FJQ...',
     // Add your authorized addresses here
   ];
   ```

3. **Start the restricted server**:
   ```bash
   npx ts-node polkadot-address-restricted-server.ts
   ```

   The server will start on `http://localhost:3003` with address restrictions enabled.

4. **Open the frontend demo**:
   Open `polkadot-address-restricted-frontend.html` in your browser (or serve it on a local server).

## How It Works

### Address Validation Flow

1. **Frontend**: User selects Polkadot wallet and attempts to authenticate
2. **Address Check**: Frontend validates the selected address against a local whitelist
3. **Server Challenge**: If address is whitelisted, server generates authentication challenge
4. **Signature**: User signs the challenge with their Polkadot wallet
5. **Server Verification**: Server verifies signature and checks address against whitelist again
6. **Authentication**: If both signature and address are valid, user receives JWT tokens

### Security Features

- **Double validation**: Address checked both on frontend and backend
- **Wallet type restriction**: Only Polkadot wallets allowed
- **JWT tokens**: Secure token-based authentication
- **CORS protection**: Configured for local development
- **Session management**: Express session handling

## Configuration

### Server Configuration

The server can be configured via the `config` object:

```typescript
const config = {
  jwtSecret: 'your-super-secret-key-change-in-production',
  jwtIssuer: 'http://localhost:3003',
  jwtAudience: 'wallet-sso-polkadot-restricted-demo',
  accessTokenExpiry: 3600, // 1 hour
  refreshTokenExpiry: 86400, // 24 hours
  sessionSecret: 'your-session-secret-change-in-production',
  port: 3003,
  corsOrigins: ['http://localhost:8080', 'http://localhost:8081'],
};
```

### Address Whitelist

Update the `WHITELISTED_ADDRESSES` array with your authorized Polkadot addresses:

```typescript
const WHITELISTED_ADDRESSES: string[] = [
  '1ABC...', // Polkadot address format
  '5FJQ...', // Another authorized address
];
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check with whitelist information |
| GET | `/admin/whitelist` | View current whitelisted addresses |
| POST | `/auth/challenge` | Generate authentication challenge (address restricted) |
| POST | `/auth/login` | Authenticate user (address restricted) |
| POST | `/auth/refresh` | Refresh JWT token |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/verify` | Verify JWT token |
| GET | `/user/profile` | Get authenticated user profile |

## Testing

### Health Check
```bash
curl http://localhost:3003/health
```

### View Whitelist
```bash
curl http://localhost:3003/admin/whitelist
```

### Test Authentication
1. Open the frontend demo in your browser
2. Try connecting with a whitelisted Polkadot address - should work
3. Try connecting with a non-whitelisted address - should be rejected

## Troubleshooting

### Address Not Authorized Error
- Check that your Polkadot address is in the `WHITELISTED_ADDRESSES` array
- Ensure the address format is correct (Polkadot addresses start with 1, 5, or other valid prefixes)
- Verify the address case sensitivity (addresses are compared case-insensitively)

### Wallet Type Not Allowed Error
- This service only accepts Polkadot wallets
- Make sure you're using the Polkadot.js extension, not MetaMask

### CORS Errors
- The server is configured for local development
- Add your frontend URL to the `corsOrigins` array if needed

### Authentication Hanging
- Check browser console for JavaScript errors
- Ensure Polkadot.js extension is installed and unlocked
- Verify the server is running on the correct port

## Production Considerations

- **Environment variables**: Move secrets to environment variables
- **Database storage**: Store whitelisted addresses in a database
- **HTTPS**: Enable HTTPS in production
- **Rate limiting**: Add rate limiting to prevent abuse
- **Logging**: Implement proper logging and monitoring
- **Admin interface**: Create an admin interface for managing the whitelist

## Comparison with Other Examples

| Feature | Simple Example | MetaMask Restricted | Polkadot Address Restricted |
|---------|----------------|-------------------|----------------------------|
| Wallet Types | All supported | MetaMask only | Polkadot only |
| Address Restrictions | None | None | Whitelist required |
| Frontend Complexity | Basic | Medium | High |
| Security Level | Basic | Medium | High |
| Use Case | General demo | MetaMask-only service | Exclusive Polkadot access |

## Next Steps

- Explore the [simple_example](../simple_example/) for basic wallet authentication
- Check the [metamask_restricted](../metamask_restricted/) for wallet-type restrictions
- Review the main [README](../../README.md) for library documentation