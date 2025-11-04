"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTUtils = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JWTUtils {
    constructor(config) {
        this.config = config;
    }
    generateAccessToken(payload) {
        const jwtPayload = {
            ...payload,
            iss: this.config.jwtIssuer,
            aud: this.config.jwtAudience,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + this.config.accessTokenExpiry,
        };
        return jsonwebtoken_1.default.sign(jwtPayload, this.config.jwtSecret);
    }
    generateRefreshToken(userId) {
        const payload = {
            sub: userId,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + this.config.refreshTokenExpiry,
        };
        return jsonwebtoken_1.default.sign(payload, this.config.jwtSecret);
    }
    generateIdToken(userPayload) {
        const jwtPayload = {
            ...userPayload,
            iss: this.config.jwtIssuer,
            aud: this.config.jwtAudience,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + this.config.accessTokenExpiry,
        };
        return jsonwebtoken_1.default.sign(jwtPayload, this.config.jwtSecret);
    }
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.config.jwtSecret);
            return decoded;
        }
        catch (error) {
            console.error('Token verification failed:', error);
            return null;
        }
    }
    verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.config.jwtSecret);
            if (decoded.type !== 'refresh')
                return null;
            return { sub: decoded.sub };
        }
        catch (error) {
            console.error('Refresh token verification failed:', error);
            return null;
        }
    }
}
exports.JWTUtils = JWTUtils;
//# sourceMappingURL=JWTUtils.js.map