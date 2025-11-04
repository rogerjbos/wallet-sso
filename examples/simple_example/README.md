# Wallet SSO - Simple Example

A complete, standalone example demonstrating basic wallet authentication with both MetaMask and Polkadot wallets.

## What it demonstrates

This example shows:

1. ✅ **Multi-Wallet Support** - Connect with MetaMask (Ethereum) or Polkadot wallets
2. ✅ **Complete Auth Flow** - Challenge-response authentication with signature verification
3. ✅ **Beautiful UI** - Modern, responsive design with real-time status updates
4. ✅ **Token Management** - JWT access tokens with localStorage persistence
5. ✅ **Error Handling** - Comprehensive error handling and user feedback

## Files

- `simple-frontend.html` - Standalone HTML/JavaScript frontend
- `client.ts` - TypeScript client example for programmatic usage
- `server.ts` - TypeScript server example for backend setup

## Quick Start

### Prerequisites

1. Install a Web3 wallet:
   - **MetaMask**: [metamask.io](https://metamask.io)
   - **Polkadot.js**: [polkadot.js.org/extension](https://polkadot.js.org/extension/)

2. Start the backend server (see server setup below)

### Running the Example

#### Option 1: Open Directly in Browser (Easiest)

```bash
# macOS
open simple-frontend.html

# Linux
xdg-open simple-frontend.html

# Windows
start simple-frontend.html
```

#### Option 2: Serve with HTTP Server

```bash
# From the examples directory
cd /Users/rogerbos/node_home/wallet-sso/examples

# Start server
python3 -m http.server 8080

# Open in browser: http://localhost:8080/simple_example/simple-frontend.html
```

#### Option 3: VS Code Live Server

1. Open `simple-frontend.html` in VS Code
2. Right-click → "Open with Live Server"
3. Access at: `http://localhost:5500/simple-frontend.html`

## Backend Setup

### Using the Example Server

```bash
# Build the library
cd /Users/rogerbos/node_home/wallet-sso
npm run build

# Start the example server
npx ts-node examples/simple_example/server.ts
```

The server runs on `http://localhost:3001`

### Using Your Own Server

Update the **API Server URL** field in the frontend to point to your server.

## How to Use

1. **Select Wallet**: Click either "🦊 MetaMask" or "🔴 Polkadot"
2. **Connect**: Click "Connect [Wallet]" to connect your wallet
3. **Authenticate**: Click "🔑 Authenticate" to sign and verify
4. **View Tokens**: See your JWT access token in the interface

## Authentication Flow

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

## Code Features

### Frontend (`simple-frontend.html`)

- **Vanilla JavaScript** - No frameworks, pure browser APIs
- **Direct Extension APIs** - Uses `window.ethereum` and `window.injectedWeb3`
- **Real-time Logging** - Detailed console output for debugging
- **Responsive Design** - Works on desktop and mobile
- **Token Storage** - Persists tokens in localStorage

### Backend (`server.ts`)

- **Express Server** - RESTful API with proper middleware
- **CORS Support** - Configurable cross-origin requests
- **JWT Tokens** - Secure token generation and verification
- **Session Management** - Proper session handling
- **Error Handling** - Comprehensive error responses

## API Endpoints

- `GET /health` - Server health check
- `POST /auth/challenge` - Generate authentication challenge
- `POST /auth/login` - Authenticate with signature
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/verify` - Verify access token
- `GET /user/profile` - Get user profile

## Using Tokens

Once authenticated, include the access token in API requests:

```javascript
const response = await fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

## Troubleshooting

### MetaMask Issues
- Ensure MetaMask extension is installed and unlocked
- Check browser console for detailed errors
- Try refreshing the page

### Polkadot Issues
- Install Polkadot.js extension from official website
- Grant permission when prompted
- Ensure you have accounts created

### Server Issues
- Verify server is running: `curl http://localhost:3001/health`
- Check CORS configuration includes your frontend origin
- Ensure JWT secrets match between frontend and backend

### CORS Errors
- Serve frontend over HTTP instead of `file://`
- Update server CORS origins to include your serving domain
- Try disabling browser security features temporarily

## Next Steps

After this example works:

1. **Customize UI** - Adapt the styling and layout for your app
2. **Add User Profile** - Call `/user/profile` endpoint after authentication
3. **Implement Refresh** - Handle token expiration with refresh tokens
4. **Add Logout** - Clear tokens and reset application state
5. **Check Restrictions** - See the `metamask_restricted` example for wallet limitations

## Related Examples

- **Wallet Restrictions**: See `../metamask_restricted/` for examples of limiting allowed wallets
- **Programmatic Usage**: Check `client.ts` for TypeScript integration examples