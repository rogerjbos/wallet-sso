"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolkadotProvider = void 0;
const api_1 = require("@polkadot/api");
const util_1 = require("@polkadot/util");
const util_crypto_1 = require("@polkadot/util-crypto");
class PolkadotProvider {
    constructor(endpoints = ['wss://paseo-rpc.dwellir.com', 'wss://archive-rpc.paseo.network', 'wss://rpc.ibp.network/paseo']) {
        this.api = null;
        this.endpoints = endpoints;
    }
    async connect() {
        if (this.api)
            return;
        for (const endpoint of this.endpoints) {
            try {
                const provider = new api_1.WsProvider(endpoint);
                this.api = await api_1.ApiPromise.create({ provider });
                await this.api.isReady;
                break;
            }
            catch (error) {
                console.warn(`Failed to connect to ${endpoint}:`, error);
            }
        }
        if (!this.api) {
            throw new Error('Failed to connect to any Polkadot endpoint');
        }
    }
    async verifySignature(message, signature, address) {
        try {
            await this.connect();
            // Convert address to public key
            const publicKey = (0, util_crypto_1.decodeAddress)(address);
            // Verify signature
            const { isValid } = (0, util_crypto_1.signatureVerify)(message, signature, publicKey);
            return isValid;
        }
        catch (error) {
            console.error('Polkadot signature verification failed:', error);
            return false;
        }
    }
    async getUserInfo(address) {
        try {
            await this.connect();
            if (!this.api)
                throw new Error('API not connected');
            // Get account balance
            const account = await this.api.query.system.account(address);
            const balance = account.data.free.toString();
            // Get identity if available
            let identity = null;
            try {
                identity = await this.api.query.identity.identityOf(address);
            }
            catch (error) {
                // Identity pallet might not be available
            }
            return {
                address: address.toLowerCase(),
                publicKey: (0, util_1.u8aToHex)((0, util_crypto_1.decodeAddress)(address)),
                balance: balance,
            };
        }
        catch (error) {
            console.error('Failed to get Polkadot user info:', error);
            return {
                address: address.toLowerCase(),
            };
        }
    }
    async getChainId() {
        try {
            await this.connect();
            if (!this.api)
                throw new Error('API not connected');
            const chain = await this.api.rpc.system.chain();
            const chainId = chain.toString().toLowerCase();
            // Map common chains to IDs
            if (chainId.includes('paseo'))
                return 42; // Paseo testnet
            if (chainId.includes('polkadot'))
                return 0;
            if (chainId.includes('kusama'))
                return 2;
            if (chainId.includes('westend'))
                return 42;
            return 42; // Default to Paseo testnet
        }
        catch (error) {
            console.error('Failed to get chain ID:', error);
            return 42; // Default to Paseo testnet
        }
    }
    async disconnect() {
        if (this.api) {
            await this.api.disconnect();
            this.api = null;
        }
    }
}
exports.PolkadotProvider = PolkadotProvider;
//# sourceMappingURL=PolkadotProvider.js.map