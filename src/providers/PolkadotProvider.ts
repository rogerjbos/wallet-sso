import { ApiPromise, WsProvider } from '@polkadot/api';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { WalletAuthProvider, WalletUser } from '../types';

export class PolkadotProvider implements WalletAuthProvider {
  private api: ApiPromise | null = null;
  private endpoints: string[];

  constructor(endpoints: string[] = ['wss://paseo-rpc.dwellir.com', 'wss://archive-rpc.paseo.network', 'wss://rpc.ibp.network/paseo']) {
    this.endpoints = endpoints;
  }

  private async connect(): Promise<void> {
    if (this.api) return;

    for (const endpoint of this.endpoints) {
      try {
        const provider = new WsProvider(endpoint);
        this.api = await ApiPromise.create({ provider });
        await this.api.isReady;
        break;
      } catch (error) {
        console.warn(`Failed to connect to ${endpoint}:`, error);
      }
    }

    if (!this.api) {
      throw new Error('Failed to connect to any Polkadot endpoint');
    }
  }

  async verifySignature(message: string, signature: string, address: string): Promise<boolean> {
    try {
      await this.connect();

      // Convert address to public key
      const publicKey = decodeAddress(address);

      // Verify signature
      const { isValid } = signatureVerify(message, signature, publicKey);

      return isValid;
    } catch (error) {
      console.error('Polkadot signature verification failed:', error);
      return false;
    }
  }

  async getUserInfo(address: string): Promise<Partial<WalletUser>> {
    try {
      await this.connect();

      if (!this.api) throw new Error('API not connected');

      // Get account balance
      const account = await this.api.query.system.account(address);
      const balance = (account as any).data.free.toString();

      // Get identity if available
      let identity: any = null;
      try {
        identity = await this.api.query.identity.identityOf(address);
      } catch (error) {
        // Identity pallet might not be available
      }

      return {
        address: address.toLowerCase(),
        publicKey: u8aToHex(decodeAddress(address)),
        balance: balance,
      };
    } catch (error) {
      console.error('Failed to get Polkadot user info:', error);
      return {
        address: address.toLowerCase(),
      };
    }
  }

  async getChainId(): Promise<number> {
    try {
      await this.connect();
      if (!this.api) throw new Error('API not connected');

      const chain = await this.api.rpc.system.chain();
      const chainId = chain.toString().toLowerCase();

      // Map common chains to IDs
      if (chainId.includes('paseo')) return 42; // Paseo testnet
      if (chainId.includes('polkadot')) return 0;
      if (chainId.includes('kusama')) return 2;
      if (chainId.includes('westend')) return 42;

      return 42; // Default to Paseo testnet
    } catch (error) {
      console.error('Failed to get chain ID:', error);
      return 42; // Default to Paseo testnet
    }
  }

  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
  }
}