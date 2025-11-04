"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletSSO = void 0;
const MetaMaskProvider_1 = require("./providers/MetaMaskProvider");
const PolkadotProvider_1 = require("./providers/PolkadotProvider");
const JWTUtils_1 = require("./utils/JWTUtils");
const ChallengeUtils_1 = require("./utils/ChallengeUtils");
class WalletSSO {
    constructor(config) {
        this.providers = new Map();
        this.users = new Map();
        this.config = config;
        this.jwtUtils = new JWTUtils_1.JWTUtils(config);
        this.challengeUtils = new ChallengeUtils_1.ChallengeUtils();
        // Initialize providers
        this.providers.set('metamask', new MetaMaskProvider_1.MetaMaskProvider());
        this.providers.set('polkadot', new PolkadotProvider_1.PolkadotProvider(config.polkadotEndpoints));
    }
    // Generate authentication challenge
    generateChallenge(address, walletType) {
        return this.challengeUtils.generateChallenge(address, walletType);
    }
    // Authenticate user with wallet signature
    async authenticate(authRequest) {
        const { message, signature, address, walletType, chainId } = authRequest;
        // Verify challenge
        if (!this.challengeUtils.verifyChallenge(message)) {
            throw new Error('Invalid or expired challenge');
        }
        // Get provider
        const provider = this.providers.get(walletType);
        if (!provider) {
            throw new Error(`Unsupported wallet type: ${walletType}`);
        }
        // Verify signature
        const isValidSignature = await provider.verifySignature(message, signature, address);
        if (!isValidSignature) {
            throw new Error('Invalid signature');
        }
        // Get or create user
        let user = this.getUserByAddress(address, walletType);
        if (!user) {
            user = await this.createUser(address, walletType, chainId);
        }
        else {
            // Update last login
            user.lastLoginAt = new Date();
        }
        // Generate tokens
        const accessToken = this.jwtUtils.generateAccessToken({
            sub: user.id,
            address: user.address,
            walletType: user.walletType,
            chainId: user.chainId,
            nonce: user.nonce,
        });
        const refreshToken = this.jwtUtils.generateRefreshToken(user.id);
        const idToken = this.jwtUtils.generateIdToken({
            sub: user.id,
            address: user.address,
            walletType: user.walletType,
            chainId: user.chainId,
            nonce: user.nonce,
        });
        return {
            accessToken,
            refreshToken,
            idToken,
            expiresIn: this.config.accessTokenExpiry,
            tokenType: 'Bearer',
        };
    }
    // Refresh access token
    refreshToken(refreshToken) {
        const payload = this.jwtUtils.verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new Error('Invalid refresh token');
        }
        const user = this.users.get(payload.sub);
        if (!user) {
            throw new Error('User not found');
        }
        const accessToken = this.jwtUtils.generateAccessToken({
            sub: user.id,
            address: user.address,
            walletType: user.walletType,
            chainId: user.chainId,
            nonce: user.nonce,
        });
        const newRefreshToken = this.jwtUtils.generateRefreshToken(user.id);
        const idToken = this.jwtUtils.generateIdToken({
            sub: user.id,
            address: user.address,
            walletType: user.walletType,
            chainId: user.chainId,
            nonce: user.nonce,
        });
        return {
            accessToken,
            refreshToken: newRefreshToken,
            idToken,
            expiresIn: this.config.accessTokenExpiry,
            tokenType: 'Bearer',
        };
    }
    // Verify access token
    verifyToken(token) {
        const payload = this.jwtUtils.verifyToken(token);
        if (!payload)
            return null;
        return this.users.get(payload.sub) || null;
    }
    // Get user by address and wallet type
    getUserByAddress(address, walletType) {
        for (const user of this.users.values()) {
            if (user.address.toLowerCase() === address.toLowerCase() && user.walletType === walletType) {
                return user;
            }
        }
        return null;
    }
    // Create new user
    async createUser(address, walletType, chainId) {
        const provider = this.providers.get(walletType);
        if (!provider) {
            throw new Error(`Unsupported wallet type: ${walletType}`);
        }
        const userInfo = await provider.getUserInfo(address);
        const actualChainId = chainId || (provider.getChainId ? await provider.getChainId() : undefined);
        const user = {
            id: `${walletType}_${address.toLowerCase()}`,
            address: address.toLowerCase(),
            walletType,
            chainId: actualChainId,
            publicKey: userInfo.publicKey,
            ensName: userInfo.ensName,
            balance: userInfo.balance,
            nonce: Math.random().toString(36).substring(2),
            createdAt: new Date(),
            lastLoginAt: new Date(),
        };
        this.users.set(user.id, user);
        return user;
    }
    // Get user by ID
    getUser(userId) {
        return this.users.get(userId) || null;
    }
    // Get all users (for debugging/admin purposes)
    getAllUsers() {
        return Array.from(this.users.values());
    }
    // Clean up resources
    async cleanup() {
        // Disconnect Polkadot provider if needed
        const polkadotProvider = this.providers.get('polkadot');
        if (polkadotProvider && typeof polkadotProvider.disconnect === 'function') {
            await polkadotProvider.disconnect();
        }
    }
}
exports.WalletSSO = WalletSSO;
//# sourceMappingURL=WalletSSO.js.map