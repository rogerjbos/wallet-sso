import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { WalletSSO } from '../src/WalletSSO';
import { WalletType } from '../src/types';

// Configuration for restricted wallet server
const config = {
  jwtSecret: 'your-super-secret-key-change-in-production',
  jwtIssuer: 'http://localhost:3002',
  jwtAudience: 'wallet-sso-restricted-demo',
  accessTokenExpiry: 3600, // 1 hour
  refreshTokenExpiry: 86400, // 24 hours
  sessionSecret: 'your-session-secret-change-in-production',
  port: 3002, // Different port to run alongside the regular server
  corsOrigins: [
    'http://localhost:8080',
    'http://localhost:8081',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8081',
    'file://' // Allow direct file opening
  ],
  polkadotEndpoints: [
    'wss://archive-ws.paseo.network',
    'wss://paseo-rpc.dwellir.com'
  ],
};

// Allowed wallets configuration
const ALLOWED_WALLETS: WalletType[] = ['metamask']; // Only MetaMask allowed

// Create Express app
const app = express();
const sso = new WalletSSO(config);

// Middleware setup
app.use(cors({
  origin: config.corsOrigins || ['http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Wallet restriction middleware
function restrictWallets(req: express.Request, res: express.Response, next: express.NextFunction) {
  const { walletType } = req.body;

  if (walletType && !ALLOWED_WALLETS.includes(walletType)) {
    console.log(`🚫 Wallet restriction middleware: ${walletType} not allowed. Allowed: ${ALLOWED_WALLETS.join(', ')}`);
    return res.status(403).json({
      error: `Wallet type "${walletType}" is not allowed on this service`,
      allowedWallets: ALLOWED_WALLETS,
      message: 'This service only accepts authentication from specific wallet types'
    });
  }

  next();
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    restrictions: {
      allowedWallets: ALLOWED_WALLETS,
      description: 'This server only accepts MetaMask authentication'
    }
  });
});

// Generate authentication challenge (with wallet restrictions)
app.post('/auth/challenge', restrictWallets, (req, res) => {
  try {
    const { address, walletType } = req.body;

    if (!address || !walletType) {
      return res.status(400).json({
        error: 'Missing required fields: address and walletType'
      });
    }

    // Generate challenge
    const message = sso.generateChallenge(address, walletType);

    console.log(`✅ Challenge generated for ${walletType} wallet: ${address}`);
    res.json({ message });

  } catch (error) {
    console.error('Challenge generation error:', error);
    res.status(500).json({
      error: 'Failed to generate challenge',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Authenticate user (with wallet restrictions)
app.post('/auth/login', restrictWallets, async (req, res) => {
  try {
    const { message, signature, address, walletType, chainId } = req.body;

    if (!message || !signature || !address || !walletType) {
      return res.status(400).json({
        error: 'Missing required fields: message, signature, address, walletType'
      });
    }

    // Proceed with authentication
    const authResponse = await sso.authenticate({
      message,
      signature,
      address,
      walletType,
      chainId
    });

    console.log(`✅ Authentication successful for ${walletType} wallet: ${address}`);
    res.json(authResponse);

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Refresh token
app.post('/auth/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Missing refresh token'
      });
    }

    const authResponse = sso.refreshToken(refreshToken);
    res.json(authResponse);

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Token refresh failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Logout
app.post('/auth/logout', (req, res) => {
  // In a real implementation, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
});

// Verify token
app.get('/auth/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const user = sso.verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.json({ valid: true, user });
});

// Get user profile
app.get('/user/profile', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const user = sso.verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.json({
    id: user.id,
    address: user.address,
    walletType: user.walletType,
    chainId: user.chainId,
    ensName: user.ensName,
    balance: user.balance,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  });
});

// OpenID Connect discovery
app.get('/.well-known/openid-configuration', (req, res) => {
  res.json({
    issuer: config.jwtIssuer,
    authorization_endpoint: `${config.jwtIssuer}/auth`,
    token_endpoint: `${config.jwtIssuer}/auth/login`,
    userinfo_endpoint: `${config.jwtIssuer}/user/profile`,
    jwks_uri: `${config.jwtIssuer}/.well-known/jwks.json`,
    response_types_supported: ['code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
  });
});

// Start server
const PORT = config.port || 3002;

app.listen(PORT, () => {
  console.log('🔒 Restricted Wallet SSO Server Started');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🚫 Wallet Restrictions: Only ${ALLOWED_WALLETS.join(', ')} wallets allowed`);
  console.log(`🌐 CORS Origins: ${config.corsOrigins?.join(', ') || 'none'}`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log(`   GET  /health - Health check with restrictions info`);
  console.log(`   POST /auth/challenge - Generate challenge (restricted)`);
  console.log(`   POST /auth/login - Authenticate (restricted)`);
  console.log(`   POST /auth/refresh - Refresh token`);
  console.log(`   POST /auth/logout - Logout`);
  console.log(`   GET  /auth/verify - Verify token`);
  console.log(`   GET  /user/profile - Get user profile`);
  console.log('');
  console.log('🧪 Test with: curl http://localhost:' + PORT + '/health');
});