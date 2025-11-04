"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeUtils = void 0;
const uuid_1 = require("uuid");
class ChallengeUtils {
    constructor() {
        this.challenges = new Map();
    }
    generateChallenge(address, walletType) {
        const nonce = (0, uuid_1.v4)();
        const message = `Sign this message to authenticate with ${walletType.toUpperCase()} wallet ${address} at ${new Date().toISOString()}. Nonce: ${nonce}`;
        const challenge = {
            message,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            used: false,
        };
        // Store challenge with nonce as key
        this.challenges.set(nonce, challenge);
        // Clean up expired challenges
        this.cleanup();
        return message;
    }
    verifyChallenge(message) {
        // Find challenge by message content
        for (const [nonce, challenge] of this.challenges.entries()) {
            if (challenge.message === message) {
                if (challenge.used || challenge.expiresAt < new Date()) {
                    return false;
                }
                // Mark as used
                challenge.used = true;
                return true;
            }
        }
        return false;
    }
    cleanup() {
        const now = new Date();
        for (const [nonce, challenge] of this.challenges.entries()) {
            if (challenge.expiresAt < now || challenge.used) {
                this.challenges.delete(nonce);
            }
        }
    }
    getChallengeCount() {
        this.cleanup();
        return this.challenges.size;
    }
}
exports.ChallengeUtils = ChallengeUtils;
//# sourceMappingURL=ChallengeUtils.js.map