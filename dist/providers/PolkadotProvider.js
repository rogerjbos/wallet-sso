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
            console.log('🔍 [PolkadotProvider] verifySignature called - NO RPC connection');
            // No need to connect to RPC - signature verification is done locally
            // Convert address to public key
            const publicKey = (0, util_crypto_1.decodeAddress)(address);
            // Verify signature
            const { isValid } = (0, util_crypto_1.signatureVerify)(message, signature, publicKey);
            console.log(`🔍 [PolkadotProvider] Signature valid: ${isValid}`);
            return isValid;
        }
        catch (error) {
            console.error('Polkadot signature verification failed:', error);
            return false;
        }
    }
    async getUserInfo(address) {
        try {
            console.log('🔍 [PolkadotProvider] getUserInfo called - skipping RPC for fast auth');
            // For authentication, we don't need balance or identity info
            // Return minimal info without RPC connection to avoid delays
            return {
                address: address.toLowerCase(),
                publicKey: (0, util_1.u8aToHex)((0, util_crypto_1.decodeAddress)(address)),
            };
            // Note: If you need balance/identity, connect to RPC separately after auth
            // await this.connect();
            // if (!this.api) throw new Error('API not connected');
            // const account = await this.api.query.system.account(address);
            // const balance = (account as any).data.free.toString();
        }
        catch (error) {
            console.error('Failed to get Polkadot user info:', error);
            return {
                address: address.toLowerCase(),
            };
        }
    }
    async getChainId() {
        // Do not connect to RPC during authentication; return a sensible default quickly
        // If needed, resolve actual chain ID later after auth
        console.log('🔍 [PolkadotProvider] getChainId returning default (no RPC)');
        return 42; // Paseo / default testnet
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