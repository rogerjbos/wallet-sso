# Wallet SSO - MetaMask Restricted Example

A demonstration of wallet restrictions, showing how to limit authentication to specific wallet types (MetaMask only).

## What it demonstrates

This example shows:

1. ✅ **Wallet Restrictions** - Only MetaMask wallets are allowed to authenticate
2. ✅ **Frontend Enforcement** - UI prevents selection of restricted wallets
3. ✅ **Backend Validation** - Server middleware blocks unauthorized wallet types
4. ✅ **Clear User Feedback** - Visual indicators and error messages for restrictions
5. ✅ **Same Auth Flow** - Uses identical authentication logic with access controls

## Files

- `metamask-only-frontend.html` - Frontend with MetaMask-only restrictions
- `restricted-server.ts` - Backend server with wallet type validation

## Quick Start

### Prerequisites

1. Install MetaMask: [metamask.io](https://metamask.io)
2. Ensure no other wallet extensions are interfering

### Running the Example

#### Frontend Only (UI Restrictions)

```bash
# Open directly in browser
open metamask-only-frontend.html

# Or serve with HTTP server
cd /Users/rogerbos/node_home/wallet-sso/examples
python3 -m http.server 8080
# Open: http://localhost:8080/metamask_restricted/metamask-only-frontend.html
```

This connects to the standard server on port 3001.

#### Full Stack (Frontend + Backend Restrictions)

```bash
# Build the library
cd /Users/rogerbos/node_home/wallet-sso
npm run build

# Start the restricted server (port 3002)
npx ts-node examples/metamask_restricted/restricted-server.ts
```

Then open the frontend and update the **API Server URL** to `http://localhost:3002`

## How It Works

### Frontend Restrictions

The frontend prevents users from selecting restricted wallets:

```javascript
const ALLOWED_WALLETS = ['metamask'];

function isWalletAllowed(walletType) {
  return ALLOWED_WALLETS.includes(walletType);
}

// Polkadot button is visually disabled
// Attempting to use Polkadot shows error message
```

### Backend Restrictions

The server uses middleware to block unauthorized wallet types:

```typescript
function restrictWallets(req, res, next) {
  const { walletType } = req.body;

  if (!ALLOWED_WALLETS.includes(walletType)) {
    return res.status(403).json({
      error: `Wallet type "${walletType}" is not allowed`,
      allowedWallets: ALLOWED_WALLETS
    });
  }

  next();
}
```

## Testing Restrictions

### Test Allowed Wallet (MetaMask)

```bash
# Should work normally
curl -X POST http://localhost:3002/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"address":"0x123456789...","walletType":"metamask"}'
```

### Test Blocked Wallet (Polkadot)

```bash
# Should return 403 Forbidden
curl -X POST http://localhost:3002/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"address":"1ABC...","walletType":"polkadot"}'

# Response:
{
  "error": "Wallet type \"polkadot\" is not allowed on this service",
  "allowedWallets": ["metamask"],
  "message": "This service only accepts authentication from specific wallet types"
}
```

## Implementation Approaches

### Frontend-Only Restrictions

**Pros**: Better user experience, immediate feedback
**Cons**: Can be bypassed by modifying client code

```javascript
// Disable/enable UI elements based on allowed wallets
const polkadotBtn = document.getElementById('polkadotBtn');
polkadotBtn.classList.add('disabled');
polkadotBtn.onclick = () => showError('Polkadot not allowed');
```

### Backend-Only Restrictions

**Pros**: Security enforcement, cannot be bypassed
**Cons**: Users get errors after attempting to authenticate

```typescript
// Server middleware
app.use('/auth/*', restrictWallets);
```

### Combined Approach (Recommended)

**Pros**: Best of both worlds - good UX and security
**Cons**: Slightly more complex implementation

```javascript
// Frontend: Hide/disable restricted options
// Backend: Enforce restrictions with middleware
```

## Configuration

### Changing Allowed Wallets

#### Frontend Configuration

```javascript
// In metamask-only-frontend.html
const ALLOWED_WALLETS = ['metamask']; // Change this array
```

#### Backend Configuration

```typescript
// In restricted-server.ts
const ALLOWED_WALLETS: WalletType[] = ['metamask']; // Change this array
```

### Environment-Based Configuration

For production, use environment variables:

```typescript
const ALLOWED_WALLETS = process.env.ALLOWED_WALLETS
  ? process.env.ALLOWED_WALLETS.split(',')
  : ['metamask'];
```

## Use Cases

### Enterprise Applications
- Restrict to company-approved wallets only
- Compliance with regulatory requirements
- Brand-specific wallet integrations

### Gaming Platforms
- Allow only specific NFT wallets
- Restrict to gaming-focused wallet extensions
- Prevent unauthorized asset transfers

### DeFi Protocols
- Limit to audited wallet extensions
- Require hardware wallet support
- Enforce security standards

## Security Considerations

### Defense in Depth
- **Frontend**: Provide good UX by hiding unavailable options
- **Backend**: Enforce security by rejecting unauthorized requests
- **API**: Validate all inputs and use proper authentication

### Rate Limiting
Consider adding rate limiting to prevent abuse:

```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

app.use('/auth/challenge', authLimiter);
```

### Audit Logging
Log all authentication attempts for security monitoring:

```typescript
app.post('/auth/challenge', restrictWallets, (req, res) => {
  const { address, walletType } = req.body;

  // Log the attempt
  console.log(`Auth attempt: ${walletType} - ${address} - ${req.ip}`);

  // Generate challenge...
});
```

## Troubleshooting

### Frontend Issues
- Ensure MetaMask is installed and unlocked
- Check browser console for JavaScript errors
- Verify the API server URL is correct

### Backend Issues
- Confirm server is running on correct port
- Check server logs for error messages
- Verify CORS configuration

### Restriction Issues
- Check `ALLOWED_WALLETS` array configuration
- Ensure middleware is applied to correct routes
- Verify client and server configurations match

## API Reference

### Health Check with Restrictions

```bash
GET /health
```

Response includes restriction information:
```json
{
  "status": "ok",
  "timestamp": "2025-11-04T17:45:15.427Z",
  "restrictions": {
    "allowedWallets": ["metamask"],
    "description": "This server only accepts MetaMask authentication"
  }
}
```

### Authentication Endpoints

All auth endpoints are restricted by the `restrictWallets` middleware:

- `POST /auth/challenge` - Generate challenge (restricted)
- `POST /auth/login` - Authenticate (restricted)
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `GET /auth/verify` - Verify token
- `GET /user/profile` - Get profile

## Next Steps

After understanding restrictions:

1. **Customize Restrictions** - Modify `ALLOWED_WALLETS` for your use case
2. **Add More Wallets** - Support additional wallet types as needed
3. **Implement Dynamic Config** - Load restrictions from database/API
4. **Add User Roles** - Different restrictions based on user permissions
5. **Check Simple Example** - See `../simple_example/` for unrestricted authentication

## Related Examples

- **Unrestricted Auth**: See `../simple_example/` for basic wallet authentication
- **Multiple Wallets**: The simple example supports both MetaMask and Polkadot