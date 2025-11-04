import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { WalletSSO } from '../../src/WalletSSO';
import { WalletType } from '../../src/types';

// Configuration for address-restricted Polkadot server
const config = {
  jwtSecret: 'your-super-secret-key-change-in-production',
  jwtIssuer: 'http://localhost:3003',
  jwtAudience: 'wallet-sso-polkadot-restricted-demo',
  accessTokenExpiry: 3600, // 1 hour
  refreshTokenExpiry: 86400, // 24 hours
  sessionSecret: 'your-session-secret-change-in-production',
  port: 3003, // Different port to run alongside other servers
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

// Address whitelist - only these Polkadot addresses can authenticate
const WHITELISTED_ADDRESSES: string[] = [
  // Example addresses - replace with real whitelisted addresses
  '15Vd1WdavwMs4n1Zi8BDkFG262iS6Ut5YN57Ew7HJXNfUnzz', // These are placeholder addresses
  '5FJQ...', // In production, load from database/smart contract
  '15M8...',
  '12MZ...',
  '13ZK...',
];

// Function to check if address is whitelisted
function isAddressWhitelisted(address: string): boolean {
  return WHITELISTED_ADDRESSES.some(whitelisted =>
    whitelisted.toLowerCase() === address.toLowerCase()
  );
}

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

// Address whitelist middleware
function restrictToWhitelistedAddresses(req: express.Request, res: express.Response, next: express.NextFunction) {
  const { address, walletType } = req.body;

  // Only allow Polkadot wallets
  if (walletType !== 'polkadot') {
    console.log(`🚫 Wallet type restriction: ${walletType} not allowed. Only Polkadot addresses permitted.`);
    return res.status(403).json({
      error: `Wallet type "${walletType}" is not allowed on this service`,
      allowedWalletTypes: ['polkadot'],
      message: 'This service only accepts Polkadot wallet authentication'
    });
  }

  // Check if address is whitelisted
  if (!address || !isAddressWhitelisted(address)) {
    console.log(`🚫 Address restriction: ${address} not in whitelist. Wallet type: ${walletType}`);
    return res.status(403).json({
      error: 'Address not authorized',
      address: address,
      whitelisted: false,
      message: 'Your Polkadot address is not authorized for this service. Please contact the administrator to be added to the whitelist.',
      supportContact: 'admin@example.com' // In production, provide actual support contact
    });
  }

  console.log(`✅ Address authorized: ${address} (Polkadot whitelisted)`);
  next();
}

// Routes

// Health check with whitelist information
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    restrictions: {
      walletType: 'polkadot-only',
      addressBased: true,
      whitelistedAddresses: WHITELISTED_ADDRESSES,
      description: 'Only whitelisted Polkadot addresses can authenticate'
    }
  });
});

// Generate authentication challenge (with address restrictions)
app.post('/auth/challenge', restrictToWhitelistedAddresses, (req, res) => {
  try {
    const { address, walletType } = req.body;

    // Generate challenge
    const message = sso.generateChallenge(address, walletType);

    console.log(`✅ Challenge generated for whitelisted Polkadot address: ${address}`);
    res.json({
      message,
      addressAuthorized: true,
      restrictions: 'polkadot-address-whitelist'
    });

  } catch (error) {
    console.error('Challenge generation error:', error);
    res.status(500).json({
      error: 'Failed to generate challenge',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Authenticate user (with address restrictions)
app.post('/auth/login', restrictToWhitelistedAddresses, async (req, res) => {
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

    console.log(`✅ Authentication successful for whitelisted Polkadot address: ${address}`);
    res.json({
      ...authResponse,
      addressAuthorized: true,
      restrictions: 'polkadot-address-whitelist'
    });

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

  res.json({
    valid: true,
    user,
    addressAuthorized: isAddressWhitelisted(user.address),
    restrictions: 'polkadot-address-whitelist'
  });
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
    addressAuthorized: isAddressWhitelisted(user.address),
    restrictions: 'polkadot-address-whitelist'
  });
});

// Get whitelist information (for debugging/admin purposes)
app.get('/admin/whitelist', (req, res) => {
  res.json({
    whitelistedAddresses: WHITELISTED_ADDRESSES,
    count: WHITELISTED_ADDRESSES.length,
    description: 'Current whitelisted Polkadot addresses'
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
const PORT = config.port || 3003;

app.listen(PORT, () => {
  console.log('🔐 Polkadot Address Restricted SSO Server Started');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🔴 Wallet Restriction: Polkadot only`);
  console.log(`📋 Address Whitelist: ${WHITELISTED_ADDRESSES.length} addresses authorized`);
  console.log(`🌐 CORS Origins: ${config.corsOrigins?.join(', ') || 'none'}`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log(`   GET  /health - Health check with whitelist info`);
  console.log(`   GET  /admin/whitelist - View whitelisted addresses`);
  console.log(`   POST /auth/challenge - Generate challenge (address restricted)`);
  console.log(`   POST /auth/login - Authenticate (address restricted)`);
  console.log(`   POST /auth/refresh - Refresh token`);
  console.log(`   POST /auth/logout - Logout`);
  console.log(`   GET  /auth/verify - Verify token`);
  console.log(`   GET  /user/profile - Get user profile`);
  console.log('');
  console.log('🧪 Test with: curl http://localhost:' + PORT + '/health');
  console.log('📝 Check whitelist: curl http://localhost:' + PORT + '/admin/whitelist');
});