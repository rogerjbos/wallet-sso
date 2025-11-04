"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaMaskProvider = void 0;
const ethers_1 = require("ethers");
class MetaMaskProvider {
    constructor(rpcUrl) {
        // Use public RPC if no URL provided (no Infura dependency)
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl || 'https://cloudflare-eth.com');
    }
    async verifySignature(message, signature, address) {
        try {
            const recoveredAddress = ethers_1.ethers.verifyMessage(message, signature);
            return recoveredAddress.toLowerCase() === address.toLowerCase();
        }
        catch (error) {
            console.error('MetaMask signature verification failed:', error);
            return false;
        }
    }
    async getUserInfo(address) {
        try {
            const balance = await this.provider.getBalance(address);
            const ensName = await this.provider.lookupAddress(address);
            return {
                address: address.toLowerCase(),
                balance: ethers_1.ethers.formatEther(balance),
                ensName: ensName || undefined,
            };
        }
        catch (error) {
            console.error('Failed to get MetaMask user info:', error);
            return {
                address: address.toLowerCase(),
            };
        }
    }
    async getChainId() {
        try {
            const network = await this.provider.getNetwork();
            return Number(network.chainId);
        }
        catch (error) {
            console.error('Failed to get chain ID:', error);
            return 1; // Default to Ethereum mainnet
        }
    }
}
exports.MetaMaskProvider = MetaMaskProvider;
//# sourceMappingURL=MetaMaskProvider.js.map