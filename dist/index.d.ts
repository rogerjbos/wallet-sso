export { WalletSSO } from './WalletSSO';
export { WalletSSOServer } from './WalletSSOServer';
export { MetaMaskProvider } from './providers/MetaMaskProvider';
export { PolkadotProvider } from './providers/PolkadotProvider';
export { JWTUtils } from './utils/JWTUtils';
export { ChallengeUtils } from './utils/ChallengeUtils';
export type { WalletUser, AuthRequest, AuthResponse, JWTPayload, SSOConfig, Challenge, TokenPair, WalletType, WalletAuthProvider, } from './types';
import { WalletSSO } from './WalletSSO';
import { WalletSSOServer } from './WalletSSOServer';
import type { SSOConfig } from './types';
declare const _default: {
    WalletSSO: typeof WalletSSO;
    WalletSSOServer: typeof WalletSSOServer;
    createServer: (config: SSOConfig) => WalletSSOServer;
    createSSO: (config: SSOConfig) => WalletSSO;
};
export default _default;
//# sourceMappingURL=index.d.ts.map