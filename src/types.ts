export interface WalletUser {
  id: string;
  address: string;
  chainId?: number;
  walletType: 'metamask' | 'polkadot';
  publicKey?: string;
  ensName?: string;
  balance?: string;
  nonce: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface AuthRequest {
  message: string;
  signature: string;
  address: string;
  walletType: 'metamask' | 'polkadot';
  chainId?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface JWTPayload {
  sub: string; // Subject (user ID)
  iss: string; // Issuer
  aud: string; // Audience
  exp: number; // Expiration time
  iat: number; // Issued at
  address: string;
  walletType: 'metamask' | 'polkadot';
  chainId?: number;
  nonce: string;
}

export interface SSOConfig {
  jwtSecret: string;
  jwtIssuer: string;
  jwtAudience: string;
  accessTokenExpiry: number; // in seconds
  refreshTokenExpiry: number; // in seconds
  sessionSecret: string;
  port?: number;
  corsOrigins?: string[];
  polkadotEndpoints?: string[];
}

export interface Challenge {
  message: string;
  expiresAt: Date;
  used: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type WalletType = 'metamask' | 'polkadot';

export interface WalletAuthProvider {
  verifySignature(message: string, signature: string, address: string): Promise<boolean>;
  getUserInfo(address: string): Promise<Partial<WalletUser>>;
  getChainId?(): Promise<number>;
}