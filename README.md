# Wallet SSO Library

A comprehensive Single Sign-On (SSO) library that supports MetaMask and Polkadot wallet authentication with OpenID Connect compliance.

## Features

- 🔐 **Multi-Wallet Support**: MetaMask (Ethereum) and Polkadot/Substrate wallets
- 🏗️ **OpenID Connect Compliant**: Full OIDC implementation for SSO
- 🔄 **JWT Tokens**: Access tokens, refresh tokens, and ID tokens
- 🛡️ **Secure Authentication**: Challenge-response authentication with signature verification
- 🌐 **RESTful API**: Complete HTTP API for authentication flows
- 📦 **NPM Package**: Easy to install and integrate into existing projects

## Installation

```bash
npm install @rogerbos/wallet-sso
```

## Quick Start

### Basic Usage

```typescript
import { WalletSSO, WalletSSOServer } from '@rogerbos/wallet-sso';

const config = {
  jwtSecret: 'your-super-secret-key',
  jwtIssuer: 'https://your-app.com',
  jwtAudience: 'your-app-client',
  accessTokenExpiry: 3600, // 1 hour
  refreshTokenExpiry: 86400, // 24 hours
  sessionSecret: 'your-session-secret',
  polkadotEndpoints: [
    'wss://archive-ws.paseo.network',
    'wss://paseo-rpc.dwellir.com'
  ],
};

// Create SSO instance
const sso = new WalletSSO(config);

// Or create a full server
const server = new WalletSSOServer(config);
server.start(3001);
```

### Authentication Flow

#### 1. Generate Challenge

```typescript
// POST /auth/challenge
const response = await fetch('http://localhost:3001/auth/challenge', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '0x1234...abcd',
    walletType: 'metamask'
  })
});

const { message } = await response.json();
```

#### 2. Sign Challenge (Client-side)

```typescript
// In browser with MetaMask
const signature = await ethereum.request({
  method: 'personal_sign',
  params: [message, address]
});

// For Polkadot (using polkadot-js/extension)
const { web3FromAddress } = await import('@polkadot/extension-dapp');
const injector = await web3FromAddress(address);
const signRaw = injector?.signer?.signRaw;

if (signRaw) {
  const { signature } = await signRaw({
    address,
    data: stringToHex(message),
    type: 'bytes'
  });
}
```

#### 3. Authenticate

```typescript
// POST /auth/login
const authResponse = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message,
    signature,
    address: '0x1234...abcd',
    walletType: 'metamask',
    chainId: 1
  })
});

const { accessToken, refreshToken, idToken } = await authResponse.json();
```

#### 4. Use Tokens

```typescript
// Verify token
const userInfo = await fetch('http://localhost:3001/auth/verify', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Get user profile
const profile = await fetch('http://localhost:3001/user/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

## Configuration

```typescript
interface SSOConfig {
  jwtSecret: string;              // Secret key for JWT signing
  jwtIssuer: string;              // OIDC issuer URL
  jwtAudience: string;            // OIDC audience
  accessTokenExpiry: number;      // Access token expiry in seconds
  refreshTokenExpiry: number;     // Refresh token expiry in seconds
  sessionSecret: string;          // Session secret for Express
  port?: number;                  // Server port (default: 3001)
  corsOrigins?: string[];         // Allowed CORS origins
  polkadotEndpoints?: string[];   // Polkadot WebSocket endpoints (defaults to Paseo testnet)
}
```

## API Endpoints

### Authentication
- `POST /auth/challenge` - Generate authentication challenge
- `POST /auth/login` - Authenticate with signature
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/verify` - Verify access token

### User Management
- `GET /user/profile` - Get user profile information

### OpenID Connect
- `GET /.well-known/openid-configuration` - OIDC discovery
- `GET /.well-known/jwks.json` - JSON Web Key Set

### Health Check
- `GET /health` - Service health status

## Wallet Support

### MetaMask (Ethereum)
- Signature verification using `ethers.js`
- ENS name resolution
- Balance fetching
- Multi-chain support
- Uses public Cloudflare RPC (no paid services required)

### Polkadot
- Sr25519 signature verification
- Identity pallet support
- Balance queries
- Multi-endpoint fallback
- Defaults to Paseo testnet endpoints

## Integration Examples

### Express.js Middleware

```typescript
import { WalletSSO } from '@rogerbos/wallet-sso';

const sso = new WalletSSO(config);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  const user = sso.verifyToken(token);
  if (!user) return res.sendStatus(403);

  req.user = user;
  next();
};

// Protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});
```

### React Integration

```typescript
import { useState, useEffect } from 'react';

function WalletAuth() {
  const [address, setAddress] = useState('');
  const [walletType, setWalletType] = useState('metamask');
  const [tokens, setTokens] = useState(null);

  const authenticate = async () => {
    // 1. Get challenge
    const challengeRes = await fetch('/auth/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, walletType })
    });
    const { message } = await challengeRes.json();

    // 2. Sign message
    let signature;
    if (walletType === 'metamask') {
      signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });
    }

    // 3. Authenticate
    const authRes = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, signature, address, walletType })
    });
    const authTokens = await authRes.json();
    setTokens(authTokens);
  };

  return (
    <div>
      <select value={walletType} onChange={e => setWalletType(e.target.value)}>
        <option value="metamask">MetaMask</option>
        <option value="polkadot">Polkadot</option>
      </select>
      <input
        value={address}
        onChange={e => setAddress(e.target.value)}
        placeholder="Wallet address"
      />
      <button onClick={authenticate}>Authenticate</button>
      {tokens && <pre>{JSON.stringify(tokens, null, 2)}</pre>}
    </div>
  );
}
```

## Typink Integration

For React applications, you can integrate with [Typink](https://github.com/dedotdev/typink) for enhanced Polkadot/Substrate contract interactions:

```bash
npm install typink
```

```typescript
import { useWallet, useTypink } from 'typink';

// In your React component
function PolkadotAuth() {
  const { accounts, connect, disconnect, isConnected } = useWallet();
  const { api, network } = useTypink();

  const authenticate = async () => {
    if (!isConnected) await connect();
    
    // Use wallet-sso for authentication
    // ... authentication logic ...
    
    // Then use typink for contract interactions
    // ... contract calls ...
  };

  return (
    <div>
      <button onClick={authenticate}>
        {isConnected ? 'Authenticate' : 'Connect Wallet'}
      </button>
    </div>
  );
}
```

Typink provides React hooks for wallet management and contract interactions, complementing wallet-sso's authentication capabilities.

- **Challenge Expiration**: Authentication challenges expire after 5 minutes
- **Signature Verification**: All signatures are cryptographically verified
- **Token Security**: JWT tokens are properly signed and can include expiration
- **Session Management**: Secure session handling with httpOnly cookies
- **CORS Protection**: Configurable origin restrictions

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.