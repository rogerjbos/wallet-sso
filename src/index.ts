// Main exports for the wallet SSO library
export { WalletSSO } from './WalletSSO';
export { WalletSSOServer } from './WalletSSOServer';
export { MetaMaskProvider } from './providers/MetaMaskProvider';
export { PolkadotProvider } from './providers/PolkadotProvider';
export { JWTUtils } from './utils/JWTUtils';
export { ChallengeUtils } from './utils/ChallengeUtils';

// Type exports
export type {
  WalletUser,
  AuthRequest,
  AuthResponse,
  JWTPayload,
  SSOConfig,
  Challenge,
  TokenPair,
  WalletType,
  WalletAuthProvider,
} from './types';

// Default export for convenience
import { WalletSSO } from './WalletSSO';
import { WalletSSOServer } from './WalletSSOServer';
import type { SSOConfig } from './types';

export default {
  WalletSSO,
  WalletSSOServer,
  createServer: (config: SSOConfig) => new WalletSSOServer(config),
  createSSO: (config: SSOConfig) => new WalletSSO(config),
};