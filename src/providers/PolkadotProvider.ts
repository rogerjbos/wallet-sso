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
      console.log('🔍 [PolkadotProvider] verifySignature called - NO RPC connection');
      // No need to connect to RPC - signature verification is done locally
      // Convert address to public key
      const publicKey = decodeAddress(address);

      // Verify signature
      const { isValid } = signatureVerify(message, signature, publicKey);
      
      console.log(`🔍 [PolkadotProvider] Signature valid: ${isValid}`);
      return isValid;
    } catch (error) {
      console.error('Polkadot signature verification failed:', error);
      return false;
    }
  }

  async getUserInfo(address: string): Promise<Partial<WalletUser>> {
    try {
      console.log('🔍 [PolkadotProvider] getUserInfo called - skipping RPC for fast auth');
      // For authentication, we don't need balance or identity info
      // Return minimal info without RPC connection to avoid delays
      return {
        address: address.toLowerCase(),
        publicKey: u8aToHex(decodeAddress(address)),
      };
      
      // Note: If you need balance/identity, connect to RPC separately after auth
      // await this.connect();
      // if (!this.api) throw new Error('API not connected');
      // const account = await this.api.query.system.account(address);
      // const balance = (account as any).data.free.toString();
    } catch (error) {
      console.error('Failed to get Polkadot user info:', error);
      return {
        address: address.toLowerCase(),
      };
    }
  }

  async getChainId(): Promise<number> {
    // Do not connect to RPC during authentication; return a sensible default quickly
    // If needed, resolve actual chain ID later after auth
    console.log('🔍 [PolkadotProvider] getChainId returning default (no RPC)');
    return 42; // Paseo / default testnet
  }

  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
  }
}