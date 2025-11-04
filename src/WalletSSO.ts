import { MetaMaskProvider } from './providers/MetaMaskProvider';
import { PolkadotProvider } from './providers/PolkadotProvider';
import { JWTUtils } from './utils/JWTUtils';
import { ChallengeUtils } from './utils/ChallengeUtils';
import {
  WalletUser,
  AuthRequest,
  AuthResponse,
  SSOConfig,
  WalletAuthProvider,
  TokenPair
} from './types';

export class WalletSSO {
  private config: SSOConfig;
  private jwtUtils: JWTUtils;
  private challengeUtils: ChallengeUtils;
  private providers: Map<string, WalletAuthProvider> = new Map();
  private users: Map<string, WalletUser> = new Map();

  constructor(config: SSOConfig) {
    this.config = config;
    this.jwtUtils = new JWTUtils(config);
    this.challengeUtils = new ChallengeUtils();

    // Initialize providers
    this.providers.set('metamask', new MetaMaskProvider());
    this.providers.set('polkadot', new PolkadotProvider(config.polkadotEndpoints || undefined));
  }

  // Generate authentication challenge
  generateChallenge(address: string, walletType: 'metamask' | 'polkadot'): string {
    return this.challengeUtils.generateChallenge(address, walletType);
  }

  // Authenticate user with wallet signature
  async authenticate(authRequest: AuthRequest): Promise<AuthResponse> {
    const { message, signature, address, walletType, chainId } = authRequest;

    // Verify challenge
    if (!this.challengeUtils.verifyChallenge(message)) {
      throw new Error('Invalid or expired challenge');
    }

    // Get provider
    const provider = this.providers.get(walletType);
    if (!provider) {
      throw new Error(`Unsupported wallet type: ${walletType}`);
    }

    // Verify signature
    const isValidSignature = await provider.verifySignature(message, signature, address);
    if (!isValidSignature) {
      throw new Error('Invalid signature');
    }

    // Get or create user
    console.log('[WalletSSO] Signature verified, getting/creating user...');
    let user = this.getUserByAddress(address, walletType);
    if (!user) {
      user = await this.createUser(address, walletType, chainId);
    } else {
      // Update last login
      user.lastLoginAt = new Date();
    }
    console.log('[WalletSSO] User ready, generating tokens...');

    // Generate tokens
    const accessToken = this.jwtUtils.generateAccessToken({
      sub: user.id,
      address: user.address,
      walletType: user.walletType,
      chainId: user.chainId,
      nonce: user.nonce,
    });

    const refreshToken = this.jwtUtils.generateRefreshToken(user.id);

    const idToken = this.jwtUtils.generateIdToken({
      sub: user.id,
      address: user.address,
      walletType: user.walletType,
      chainId: user.chainId,
      nonce: user.nonce,
    });

    const result: AuthResponse = {
      accessToken,
      refreshToken,
      idToken,
      expiresIn: this.config.accessTokenExpiry,
      tokenType: 'Bearer',
    };
    console.log('[WalletSSO] Tokens generated, returning response');
    return result;
  }

  // Refresh access token
  refreshToken(refreshToken: string): AuthResponse {
    const payload = this.jwtUtils.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    const user = this.users.get(payload.sub);
    if (!user) {
      throw new Error('User not found');
    }

    const accessToken = this.jwtUtils.generateAccessToken({
      sub: user.id,
      address: user.address,
      walletType: user.walletType,
      chainId: user.chainId,
      nonce: user.nonce,
    });

    const newRefreshToken = this.jwtUtils.generateRefreshToken(user.id);

    const idToken = this.jwtUtils.generateIdToken({
      sub: user.id,
      address: user.address,
      walletType: user.walletType,
      chainId: user.chainId,
      nonce: user.nonce,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      idToken,
      expiresIn: this.config.accessTokenExpiry,
      tokenType: 'Bearer',
    };
  }

  // Verify access token
  verifyToken(token: string): WalletUser | null {
    const payload = this.jwtUtils.verifyToken(token);
    if (!payload) return null;

    return this.users.get(payload.sub) || null;
  }

  // Get user by address and wallet type
  private getUserByAddress(address: string, walletType: 'metamask' | 'polkadot'): WalletUser | null {
    for (const user of this.users.values()) {
      if (user.address.toLowerCase() === address.toLowerCase() && user.walletType === walletType) {
        return user;
      }
    }
    return null;
  }

  // Create new user
  private async createUser(
    address: string,
    walletType: 'metamask' | 'polkadot',
    chainId?: number
  ): Promise<WalletUser> {
    const provider = this.providers.get(walletType);
    if (!provider) {
      throw new Error(`Unsupported wallet type: ${walletType}`);
    }

    const userInfo = await provider.getUserInfo(address);
    const actualChainId = chainId || (provider.getChainId ? await provider.getChainId() : undefined);

    const user: WalletUser = {
      id: `${walletType}_${address.toLowerCase()}`,
      address: address.toLowerCase(),
      walletType,
      chainId: actualChainId,
      publicKey: userInfo.publicKey,
      ensName: userInfo.ensName,
      balance: userInfo.balance,
      nonce: Math.random().toString(36).substring(2),
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    this.users.set(user.id, user);
    return user;
  }

  // Get user by ID
  getUser(userId: string): WalletUser | null {
    return this.users.get(userId) || null;
  }

  // Get all users (for debugging/admin purposes)
  getAllUsers(): WalletUser[] {
    return Array.from(this.users.values());
  }

  // Clean up resources
  async cleanup(): Promise<void> {
    // Disconnect Polkadot provider if needed
    const polkadotProvider = this.providers.get('polkadot') as PolkadotProvider;
    if (polkadotProvider && typeof polkadotProvider.disconnect === 'function') {
      await polkadotProvider.disconnect();
    }
  }
}