import { ethers } from 'ethers';
import { WalletAuthProvider, WalletUser } from '../types';

export class MetaMaskProvider implements WalletAuthProvider {
  private provider: ethers.JsonRpcProvider;

  constructor(rpcUrl?: string) {
    // Use public RPC if no URL provided (no Infura dependency)
    this.provider = new ethers.JsonRpcProvider(rpcUrl || 'https://cloudflare-eth.com');
  }

  async verifySignature(message: string, signature: string, address: string): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('MetaMask signature verification failed:', error);
      return false;
    }
  }

  async getUserInfo(address: string): Promise<Partial<WalletUser>> {
    try {
      const balance = await this.provider.getBalance(address);
      const ensName = await this.provider.lookupAddress(address);

      return {
        address: address.toLowerCase(),
        balance: ethers.formatEther(balance),
        ensName: ensName || undefined,
      };
    } catch (error) {
      console.error('Failed to get MetaMask user info:', error);
      return {
        address: address.toLowerCase(),
      };
    }
  }

  async getChainId(): Promise<number> {
    try {
      const network = await this.provider.getNetwork();
      return Number(network.chainId);
    } catch (error) {
      console.error('Failed to get chain ID:', error);
      return 1; // Default to Ethereum mainnet
    }
  }
}