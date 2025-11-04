import { JWTPayload, SSOConfig } from '../types';
export declare class JWTUtils {
    private config;
    constructor(config: SSOConfig);
    generateAccessToken(payload: Omit<JWTPayload, 'iss' | 'aud' | 'exp' | 'iat'>): string;
    generateRefreshToken(userId: string): string;
    generateIdToken(userPayload: Omit<JWTPayload, 'iss' | 'aud' | 'exp' | 'iat'>): string;
    verifyToken(token: string): JWTPayload | null;
    verifyRefreshToken(token: string): {
        sub: string;
    } | null;
}
//# sourceMappingURL=JWTUtils.d.ts.map