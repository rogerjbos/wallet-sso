# Wallet SSO Examples

This folder contains organized examples demonstrating how to use the Wallet SSO library.

## Example Categories

### 📁 [Simple Example](./simple_example/)
**Basic wallet authentication with full wallet support**

- ✅ Multi-wallet support (MetaMask + Polkadot)
- ✅ Complete authentication flow
- ✅ Beautiful, responsive UI
- ✅ Token management
- ✅ Error handling

**Quick Start:**
```bash
cd simple_example
open simple-frontend.html
```

### 🔒 [MetaMask Restricted](./metamask_restricted/)
**Wallet restrictions and access control**

- ✅ MetaMask-only authentication
- ✅ Frontend UI restrictions
- ✅ Backend middleware validation
- ✅ Security best practices
- ✅ Configuration examples

**Quick Start:**
```bash
cd metamask_restricted
open metamask-only-frontend.html
```

### 🛡️ [Polkadot Address Restricted](./polkadot_restricted/)
**Address-based access control for Polkadot wallets**

- ✅ Polkadot-only authentication
- ✅ Address whitelist validation
- ✅ Frontend and backend restrictions
- ✅ Granular access control
- ✅ Admin whitelist management

**Quick Start:**
```bash
cd polkadot_restricted
open polkadot-address-restricted-frontend.html
```

## Getting Started

Each example folder contains:

- **Individual README** - Detailed setup and usage instructions
- **Working Code** - Ready-to-run examples
- **Configuration Options** - Easy customization
- **Troubleshooting Guide** - Common issues and solutions

## Prerequisites

1. **Web3 Wallets**:
   - [MetaMask](https://metamask.io) - Ethereum wallet
   - [Polkadot.js](https://polkadot.js.org/extension) - Polkadot wallet

2. **Node.js** (for server examples):
   ```bash
   cd /Users/rogerbos/node_home/wallet-sso
   npm run build
   ```

## Quick Test

```bash
# Test simple example
cd simple_example
open simple-frontend.html

# Test restricted examples
cd ../metamask_restricted
open metamask-only-frontend.html

# Test address-restricted example
cd ../polkadot_restricted
open polkadot-address-restricted-frontend.html
```

## Example Comparison

| Feature | Simple Example | MetaMask Restricted | Polkadot Address Restricted |
|---------|----------------|-------------------|----------------------------|
| MetaMask Support | ✅ | ✅ | ❌ (restricted) |
| Polkadot Support | ✅ | ❌ (restricted) | ✅ |
| Address Restrictions | ❌ | ❌ | ✅ (whitelist) |
| UI Restrictions | ❌ | ✅ | ✅ |
| Backend Validation | ❌ | ✅ | ✅ |
| Multiple Servers | ❌ | ✅ (port 3002) | ✅ (port 3003) |
| Middleware | ❌ | ✅ | ✅ |
| Security Level | Basic | Medium | High |
| Configuration | Basic | Advanced | Advanced |

## Development Workflow

1. **Start with Simple** - Get basic auth working
2. **Add Wallet Restrictions** - Implement wallet-type controls (MetaMask-only)
3. **Add Address Restrictions** - Implement granular access control (Polkadot whitelist)
4. **Customize UI** - Adapt for your application
5. **Configure Backend** - Set up production server
6. **Add Security** - Implement rate limiting, logging

## Integration Guide

### Frontend Integration

```javascript
// Basic authentication
const response = await fetch('/auth/challenge', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address, walletType })
});

// With restrictions
if (!ALLOWED_WALLETS.includes(walletType)) {
  throw new Error('Wallet not allowed');
}
```

### Backend Integration

```typescript
import { WalletSSO } from '@rogerbos/wallet-sso';

// Basic server
const sso = new WalletSSO(config);

// Restricted server
function restrictWallets(req, res, next) {
  if (!ALLOWED_WALLETS.includes(req.body.walletType)) {
    return res.status(403).json({ error: 'Wallet not allowed' });
  }
  next();
}
```

## Support

- **Documentation**: Check individual example READMEs
- **Source Code**: Review `/src` folder
- **Issues**: Open GitHub issues for bugs
- **Contributing**: PRs welcome!

## License

See main project LICENSE file.

## Simple Frontend Example

### What it demonstrates

The `simple-frontend.html` file is a **complete, standalone example** that shows:

1. ✅ **Wallet Selection** - Choose between MetaMask or Polkadot wallet
2. ✅ **Wallet Connection** - Connect to the selected wallet
3. ✅ **3-Step Authentication Flow**:
   - Get authentication challenge from server
   - Sign message with wallet (direct extension APIs, no external libraries)
   - Send signature to server for verification
4. ✅ **Token Management** - Display and store access tokens
5. ✅ **Beautiful UI** - Modern, responsive design

### How to use it

#### Prerequisites

1. Install a Web3 wallet:
   - **MetaMask**: Install from [metamask.io](https://metamask.io)
   - **Polkadot.js**: Install from [polkadot.js.org/extension](https://polkadot.js.org/extension/)

2. Have your backend API server running (the one that uses this wallet-sso library)

#### Running the example

**Option 1: Open directly in browser (Recommended)**

Simply open `simple-frontend.html` in your browser:

```bash
# On macOS
open examples/simple-frontend.html

# On Linux
xdg-open examples/simple-frontend.html

# On Windows
start examples/simple-frontend.html
```

**Option 2: Serve with a local server (For CORS testing)**

If you need to serve it over HTTP (e.g., for CORS testing or if direct file opening doesn't work):

```bash
# Navigate to the wallet-sso directory first
cd /Users/rogerbos/node_home/wallet-sso

# Using Python 3 (recommended)
python3 -m http.server 8080

# Then open: http://localhost:8080/examples/simple-frontend.html
```

**Option 3: Use VS Code Live Server extension**

If you have the Live Server extension installed in VS Code:
1. Open `examples/simple-frontend.html` in VS Code
2. Right-click and select "Open with Live Server"
3. The page will open at `http://localhost:5500/examples/simple-frontend.html`

#### Configuration

1. Make sure your API server is running (default: `http://localhost:3001`)
2. Update the **API Server URL** field in the demo if needed
3. Click on a wallet type (MetaMask or Polkadot)
4. Click "Connect" to connect your wallet
5. Click "Authenticate" to complete the authentication flow
6. View your access token and use it in API calls

### Authentication Flow Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │         │  Wallet SSO  │         │   Wallet    │
│  (Frontend) │         │   (Backend)  │         │ (MetaMask)  │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │ 1. POST /auth/challenge                       │
       ├──────────────────────>│                        │
       │    {address, wallet}  │                        │
       │                       │                        │
       │ 2. {message}          │                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │ 3. Sign message       │                        │
       ├───────────────────────────────────────────────>│
       │                       │                        │
       │ 4. {signature}        │                        │
       │<───────────────────────────────────────────────┤
       │                       │                        │
       │ 5. POST /auth/login   │                        │
       ├──────────────────────>│                        │
       │    {msg, sig, addr}   │                        │
       │                       │                        │
       │                       │ 6. Verify signature    │
       │                       │    & generate tokens   │
       │                       │                        │
       │ 7. {access_token,     │                        │
       │     refresh_token,    │                        │
       │     id_token}         │                        │
       │<──────────────────────┤                        │
       │                       │                        │
```

### Code Structure

The example is intentionally kept in a single HTML file for simplicity. It includes:

- **HTML**: Basic structure with wallet selection and status display
- **CSS**: Modern, responsive styling with gradients and animations
- **JavaScript**: Complete authentication logic with:
  - Wallet detection and connection
  - Challenge request
  - Message signing
  - Token verification
  - Error handling

### Key Features

🎨 **Beautiful UI**
- Modern gradient design
- Smooth animations
- Responsive layout
- Clear status messages

🔧 **Developer Friendly**
- Console logging for debugging
- Clear error messages
- Token display for testing
- Configurable API endpoint

🔒 **Production Ready**
- Proper error handling
- Token storage in localStorage
- Signature verification
- Connection state management

### MetaMask Only Example

The `metamask-only-frontend.html` file demonstrates **frontend-side wallet restrictions**:

1. ✅ **Wallet Restrictions** - Only MetaMask is allowed, Polkadot is disabled in UI
2. ✅ **Visual Feedback** - Clear indication of which wallets are allowed/blocked
3. ✅ **Error Handling** - Proper error messages for restricted wallets
4. ✅ **Same Auth Flow** - Uses the same authentication logic as the simple example

#### Running the restricted frontend

```bash
# Open directly in browser
open examples/metamask-only-frontend.html

# Or serve with HTTP server
cd /Users/rogerbos/node_home/wallet-sso
python3 -m http.server 8080
# Then visit: http://localhost:8080/examples/metamask-only-frontend.html
```

**Note:** This example connects to the standard server on port 3001. For backend restrictions, see the restricted server example below.

### Restricted Server Example

The `restricted-server.ts` file shows **backend-side wallet restrictions** using middleware:

1. ✅ **Middleware Restrictions** - Server-level wallet type validation
2. ✅ **HTTP 403 Responses** - Proper error codes for restricted wallets
3. ✅ **Configurable Allowlist** - Easy to modify allowed wallet types
4. ✅ **Same API Interface** - Compatible with existing frontend code

#### Running the restricted server

```bash
# Build the library first
npm run build

# Run the restricted server (runs on port 3002)
npx ts-node examples/restricted-server.ts
```

#### Testing wallet restrictions

```bash
# This will work (MetaMask allowed)
curl -X POST http://localhost:3002/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"address":"0x123...","walletType":"metamask"}'

# This will fail (Polkadot blocked)
curl -X POST http://localhost:3002/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"address":"1ABC...","walletType":"polkadot"}'
```

### Address Restricted Server Example

The `polkadot-address-restricted-server.ts` file demonstrates **address-based access control** for Polkadot wallets:

1. ✅ **Address Whitelist** - Only specific Polkadot addresses can authenticate
2. ✅ **Double Validation** - Address checked on both frontend and backend
3. ✅ **Polkadot-Only** - Only Polkadot wallets are allowed
4. ✅ **Admin Endpoints** - View and manage whitelisted addresses
5. ✅ **Detailed Logging** - Comprehensive authentication flow tracking

#### Running the address-restricted server

```bash
# Build the library first
npm run build

# Run the address-restricted server (runs on port 3003)
npx ts-node examples/polkadot_restricted/polkadot-address-restricted-server.ts
```

#### Testing address restrictions

```bash
# Check whitelist
curl http://localhost:3003/admin/whitelist

# This will work (whitelisted Polkadot address)
curl -X POST http://localhost:3003/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"address":"1ABC...","walletType":"polkadot"}'

# This will fail (non-whitelisted address)
curl -X POST http://localhost:3003/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"address":"5XYZ...","walletType":"polkadot"}'

# This will fail (wrong wallet type)
curl -X POST http://localhost:3003/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"address":"0x123...","walletType":"metamask"}'
```

### Implementing Wallet Restrictions

#### Frontend-Only Restrictions

```javascript
// Define allowed wallets
const ALLOWED_WALLETS = ['metamask'];

// Check before connecting
function isWalletAllowed(walletType) {
  return ALLOWED_WALLETS.includes(walletType);
}

// Use in your connection logic
if (!isWalletAllowed(selectedWallet)) {
  showError(`Wallet type "${selectedWallet}" is not allowed`);
  return;
}
```

#### Address-Based Restrictions

```javascript
// Define whitelisted addresses
const WHITELISTED_ADDRESSES = [
  '1ABC...', // Polkadot addresses
  '5FJQ...',
];

// Check address before authentication
function isAddressWhitelisted(address) {
  return WHITELISTED_ADDRESSES.some(whitelisted =>
    whitelisted.toLowerCase() === address.toLowerCase()
  );
}

// Use in your authentication logic
if (!isAddressWhitelisted(selectedAddress)) {
  showError('Your address is not authorized for this service');
  return;
}
```

#### Backend-Only Restrictions

```typescript
import express from 'express';
import { WalletSSO } from '@rogerbos/wallet-sso';

const ALLOWED_WALLETS = ['metamask'];
const sso = new WalletSSO(config);

// Middleware to restrict wallets
function restrictWallets(req: express.Request, res: express.Response, next: express.NextFunction) {
  const { walletType } = req.body;

  if (walletType && !ALLOWED_WALLETS.includes(walletType)) {
    return res.status(403).json({
      error: `Wallet type "${walletType}" is not allowed`,
      allowedWallets: ALLOWED_WALLETS
    });
  }

  next();
}

// Apply to auth routes
app.post('/auth/challenge', restrictWallets, (req, res) => {
  // Handle challenge generation
});

app.post('/auth/login', restrictWallets, async (req, res) => {
  // Handle authentication
});
```

#### Backend Address Restrictions

```typescript
const WHITELISTED_ADDRESSES: string[] = [
  '1ABC...', // Polkadot addresses
  '5FJQ...',
];

function isAddressWhitelisted(address: string): boolean {
  return WHITELISTED_ADDRESSES.some(whitelisted =>
    whitelisted.toLowerCase() === address.toLowerCase()
  );
}

// Middleware to restrict addresses
function restrictToWhitelistedAddresses(req: express.Request, res: express.Response, next: express.NextFunction) {
  const { address, walletType } = req.body;

  // Only allow Polkadot wallets
  if (walletType !== 'polkadot') {
    return res.status(403).json({
      error: `Wallet type "${walletType}" is not allowed`,
      allowedWalletTypes: ['polkadot']
    });
  }

  // Check address whitelist
  if (!address || !isAddressWhitelisted(address)) {
    return res.status(403).json({
      error: 'Address not authorized',
      message: 'Your Polkadot address is not authorized for this service'
    });
  }

  next();
}
```

#### Combined Frontend + Backend Restrictions

For production applications, implement restrictions on both frontend and backend:

- **Frontend**: Provide better UX by hiding/disabling restricted options
- **Backend**: Enforce security by rejecting unauthorized wallet types/addresses
- **Configuration**: Use environment variables or config files to manage allowed wallets/addresses

### Using Tokens in API Calls

Once authenticated, use the access token in your API requests:

```javascript
const response = await fetch('http://localhost:4000/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Troubleshooting

**MetaMask not connecting**
- Ensure MetaMask extension is installed and unlocked
- Check browser console for errors
- Try refreshing the page

**Polkadot not connecting**
- Install Polkadot.js extension from the official website
- Grant permission when prompted
- Make sure you have at least one account created

**CORS errors**
- Ensure your backend has CORS properly configured
- Check that the API URL is correct
- Try serving the HTML file over HTTP instead of `file://`

**Authentication fails**
- Check browser console for detailed error messages
- Verify your backend server is running
- Ensure the JWT secret matches between frontend and backend config

**Browser extension blocking**
- Some security extensions may block local API calls
- Try disabling browser extensions temporarily or use incognito mode
- Serve the frontend from `localhost` instead of IP addresses
- Check the server CORS configuration includes your serving origin

**Server not responding**
- Ensure the server is running: `curl http://localhost:3001/health`
- Check that CORS origins in `server.ts` include your frontend URL
- Verify the API URL in the demo matches your server configuration

### Next Steps

After trying the simple frontend example:

1. **Integrate into your app**: Use the code patterns from this example in your React/Vue/Angular app
2. **Add user profile**: Call `/user/profile` endpoint after authentication
3. **Implement refresh token flow**: Use the refresh token before access token expires
4. **Add logout**: Call `/auth/logout` and clear local storage

## TypeScript Examples

The `client.ts` and `server.ts` files show how to use the library programmatically in TypeScript/Node.js applications.

### Running TypeScript examples

```bash
# Build the library first
npm run build

# Run server example
npx ts-node examples/server.ts

# Run client example (in another terminal)
npx ts-node examples/client.ts
```

## Integration with Your App

To integrate Wallet SSO into your existing application:

### Frontend (React Example)

```typescript
import { useState } from 'react';

export function useWalletAuth() {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('accessToken')
  );

  const authenticate = async (walletType: 'metamask' | 'polkadot') => {
    // 1. Get wallet address
    const address = await getWalletAddress(walletType);

    // 2. Get challenge
    const { message } = await fetch('/api/auth/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, walletType })
    }).then(r => r.json());

    // 3. Sign message
    const signature = await signMessage(message, address, walletType);

    // 4. Authenticate
    const { accessToken } = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, signature, address, walletType })
    }).then(r => r.json());

    localStorage.setItem('accessToken', accessToken);
    setAccessToken(accessToken);
  };

  return { accessToken, authenticate };
}
```

### Backend (Express Example)

```typescript
import { WalletSSOServer } from '@rogerbos/wallet-sso';

const server = new WalletSSOServer({
  jwtSecret: process.env.JWT_SECRET,
  jwtIssuer: 'http://localhost:3001',
  jwtAudience: 'wallet-sso-demo',
  accessTokenExpiry: 3600,
  refreshTokenExpiry: 86400,
  sessionSecret: process.env.SESSION_SECRET,
  port: 3001,
  corsOrigins: ['http://localhost:3000', 'http://localhost:8080']
});

server.start();
```

## Support

For issues or questions:
- Check the main [README.md](../README.md)
- Review the [source code](../src/)
- Open an issue on GitHub
