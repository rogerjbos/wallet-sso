# Wallet SSO Examples

This folder contains examples demonstrating how to use the Wallet SSO library.

## Files

- `simple-frontend.html` - Standalone HTML/JavaScript example for browser-based authentication
- `client.ts` - TypeScript client example (programmatic usage)
- `server.ts` - TypeScript server example (backend setup)

## Simple Frontend Example

### What it demonstrates

The `simple-frontend.html` file is a **complete, standalone example** that shows:

1. ✅ **Wallet Selection** - Choose between MetaMask or Polkadot wallet
2. ✅ **Wallet Connection** - Connect to the selected wallet
3. ✅ **3-Step Authentication Flow**:
   - Get authentication challenge from server
   - Sign message with wallet
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

**Option 1: Open directly in browser**

Simply open `simple-frontend.html` in your browser:

```bash
# On macOS
open examples/simple-frontend.html

# On Linux
xdg-open examples/simple-frontend.html

# On Windows
start examples/simple-frontend.html
```

**Option 2: Serve with a local server**

If you need to serve it over HTTP (e.g., for CORS testing):

```bash
# Using Python 3
python3 -m http.server 8080

# Using Node.js
npx http-server -p 8080

# Then open http://localhost:8080/examples/simple-frontend.html
```

#### Configuration

1. Make sure your API server is running (default: `http://localhost:4000/api`)
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
    const { access_token } = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, signature, address, walletType })
    }).then(r => r.json());

    localStorage.setItem('accessToken', access_token);
    setAccessToken(access_token);
  };

  return { accessToken, authenticate };
}
```

### Backend (Express Example)

```typescript
import { WalletSSOServer } from '@rogerbos/wallet-sso';

const server = new WalletSSOServer({
  jwtSecret: process.env.JWT_SECRET,
  jwtIssuer: 'https://your-app.com',
  jwtAudience: 'your-app',
  accessTokenExpiry: 3600,
  refreshTokenExpiry: 86400,
  sessionSecret: process.env.SESSION_SECRET,
  port: 4000
});

server.start();
```

## Support

For issues or questions:
- Check the main [README.md](../README.md)
- Review the [source code](../src/)
- Open an issue on GitHub
