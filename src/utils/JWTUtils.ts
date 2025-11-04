import jwt from 'jsonwebtoken';
import { JWTPayload, SSOConfig } from '../types';

export class JWTUtils {
  private config: SSOConfig;

  constructor(config: SSOConfig) {
    this.config = config;
  }

  generateAccessToken(payload: Omit<JWTPayload, 'iss' | 'aud' | 'exp' | 'iat'>): string {
    const jwtPayload: JWTPayload = {
      ...payload,
      iss: this.config.jwtIssuer,
      aud: this.config.jwtAudience,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.config.accessTokenExpiry,
    };

    return jwt.sign(jwtPayload, this.config.jwtSecret);
  }

  generateRefreshToken(userId: string): string {
    const payload = {
      sub: userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.config.refreshTokenExpiry,
    };

    return jwt.sign(payload, this.config.jwtSecret);
  }

  generateIdToken(userPayload: Omit<JWTPayload, 'iss' | 'aud' | 'exp' | 'iat'>): string {
    const jwtPayload: JWTPayload = {
      ...userPayload,
      iss: this.config.jwtIssuer,
      aud: this.config.jwtAudience,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.config.accessTokenExpiry,
    };

    return jwt.sign(jwtPayload, this.config.jwtSecret);
  }

  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  verifyRefreshToken(token: string): { sub: string } | null {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret) as any;
      if (decoded.type !== 'refresh') return null;
      return { sub: decoded.sub };
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }
}