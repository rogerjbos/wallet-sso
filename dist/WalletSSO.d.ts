import { WalletUser, AuthRequest, AuthResponse, SSOConfig } from './types';
export declare class WalletSSO {
    private config;
    private jwtUtils;
    private challengeUtils;
    private providers;
    private users;
    constructor(config: SSOConfig);
    generateChallenge(address: string, walletType: 'metamask' | 'polkadot'): string;
    authenticate(authRequest: AuthRequest): Promise<AuthResponse>;
    refreshToken(refreshToken: string): AuthResponse;
    verifyToken(token: string): WalletUser | null;
    private getUserByAddress;
    private createUser;
    getUser(userId: string): WalletUser | null;
    getAllUsers(): WalletUser[];
    cleanup(): Promise<void>;
}
//# sourceMappingURL=WalletSSO.d.ts.map