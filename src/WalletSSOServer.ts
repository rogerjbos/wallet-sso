import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { WalletSSO } from './WalletSSO';
import { SSOConfig, AuthRequest } from './types';

export class WalletSSOServer {
  private app: express.Application;
  private sso: WalletSSO;
  private config: SSOConfig;

  constructor(config: SSOConfig) {
    this.config = config;
    this.sso = new WalletSSO(config);
    this.app = express();

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // CORS
    this.app.use(cors({
      origin: this.config.corsOrigins || ['http://localhost:3000'],
      credentials: true,
    }));

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Session
    this.app.use(session({
      secret: this.config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Generate authentication challenge
    this.app.post('/auth/challenge', (req, res) => {
      try {
        const { address, walletType } = req.body;

        if (!address || !walletType) {
          return res.status(400).json({
            error: 'Missing required fields: address, walletType'
          });
        }

        if (!['metamask', 'polkadot'].includes(walletType)) {
          return res.status(400).json({
            error: 'Invalid wallet type. Must be "metamask" or "polkadot"'
          });
        }

        const message = this.sso.generateChallenge(address, walletType);

        res.json({
          message,
          expiresIn: 300, // 5 minutes
        });
      } catch (error) {
        console.error('Challenge generation error:', error);
        res.status(500).json({ error: 'Failed to generate challenge' });
      }
    });

    // Authenticate with wallet signature
    this.app.post('/auth/login', async (req, res) => {
      try {
        const authRequest: AuthRequest = req.body;

        if (!authRequest.message || !authRequest.signature ||
            !authRequest.address || !authRequest.walletType) {
          return res.status(400).json({
            error: 'Missing required fields: message, signature, address, walletType'
          });
        }

        const authResponse = await this.sso.authenticate(authRequest);

        // Store user session
        const user = this.sso.verifyToken(authResponse.accessToken);
        if (user) {
          (req.session as any).userId = user.id;
        }

        res.json(authResponse);
      } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
          error: error instanceof Error ? error.message : 'Authentication failed'
        });
      }
    });

    // Refresh access token
    this.app.post('/auth/refresh', (req, res) => {
      try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
          return res.status(400).json({
            error: 'Missing refresh token'
          });
        }

        const authResponse = this.sso.refreshToken(refreshToken);
        res.json(authResponse);
      } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
          error: error instanceof Error ? error.message : 'Token refresh failed'
        });
      }
    });

    // Verify token (middleware endpoint)
    this.app.get('/auth/verify', (req, res) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.substring(7);
        const user = this.sso.verifyToken(token);

        if (!user) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({
          user: {
            id: user.id,
            address: user.address,
            walletType: user.walletType,
            chainId: user.chainId,
          }
        });
      } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Token verification failed' });
      }
    });

    // Logout
    this.app.post('/auth/logout', (req, res) => {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
      });
    });

    // Get user profile
    this.app.get('/user/profile', (req, res) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.substring(7);
        const user = this.sso.verifyToken(token);

        if (!user) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({
          user: {
            id: user.id,
            address: user.address,
            walletType: user.walletType,
            chainId: user.chainId,
            ensName: user.ensName,
            balance: user.balance,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
          }
        });
      } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
      }
    });

    // OpenID Connect discovery endpoint
    this.app.get('/.well-known/openid-configuration', (req, res) => {
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      res.json({
        issuer: this.config.jwtIssuer,
        authorization_endpoint: `${baseUrl}/auth/challenge`,
        token_endpoint: `${baseUrl}/auth/login`,
        userinfo_endpoint: `${baseUrl}/user/profile`,
        jwks_uri: `${baseUrl}/.well-known/jwks.json`,
        response_types_supported: ['code'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
        scopes_supported: ['openid', 'profile', 'email'],
        claims_supported: ['sub', 'iss', 'aud', 'exp', 'iat', 'address', 'walletType', 'chainId'],
      });
    });

    // JWKS endpoint (simplified - in production, use proper key management)
    this.app.get('/.well-known/jwks.json', (req, res) => {
      // This is a simplified implementation. In production, use proper JWK management
      res.json({
        keys: [{
          kty: 'RSA',
          use: 'sig',
          kid: 'wallet-sso-key-1',
          n: 'simplified-modulus', // Replace with actual RSA modulus
          e: 'AQAB',
        }]
      });
    });
  }

  // Start server
  start(port?: number): void {
    const serverPort = port || this.config.port || 3001;

    this.app.listen(serverPort, () => {
      console.log(`Wallet SSO Server running on port ${serverPort}`);
      console.log(`Health check: http://localhost:${serverPort}/health`);
    });
  }

  // Get the Express app (for testing or advanced usage)
  getApp(): express.Application {
    return this.app;
  }

  // Get the SSO instance
  getSSO(): WalletSSO {
    return this.sso;
  }

  // Clean up resources
  async cleanup(): Promise<void> {
    await this.sso.cleanup();
  }
}