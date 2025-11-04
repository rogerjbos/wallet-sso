import { WalletAuthProvider, WalletUser } from '../types';
export declare class MetaMaskProvider implements WalletAuthProvider {
    private provider;
    constructor(rpcUrl?: string);
    verifySignature(message: string, signature: string, address: string): Promise<boolean>;
    getUserInfo(address: string): Promise<Partial<WalletUser>>;
    getChainId(): Promise<number>;
}
//# sourceMappingURL=MetaMaskProvider.d.ts.map