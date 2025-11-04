import { WalletAuthProvider, WalletUser } from '../types';
export declare class PolkadotProvider implements WalletAuthProvider {
    private api;
    private endpoints;
    constructor(endpoints?: string[]);
    private connect;
    verifySignature(message: string, signature: string, address: string): Promise<boolean>;
    getUserInfo(address: string): Promise<Partial<WalletUser>>;
    getChainId(): Promise<number>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=PolkadotProvider.d.ts.map