"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeUtils = exports.JWTUtils = exports.PolkadotProvider = exports.MetaMaskProvider = exports.WalletSSOServer = exports.WalletSSO = void 0;
// Main exports for the wallet SSO library
var WalletSSO_1 = require("./WalletSSO");
Object.defineProperty(exports, "WalletSSO", { enumerable: true, get: function () { return WalletSSO_1.WalletSSO; } });
var WalletSSOServer_1 = require("./WalletSSOServer");
Object.defineProperty(exports, "WalletSSOServer", { enumerable: true, get: function () { return WalletSSOServer_1.WalletSSOServer; } });
var MetaMaskProvider_1 = require("./providers/MetaMaskProvider");
Object.defineProperty(exports, "MetaMaskProvider", { enumerable: true, get: function () { return MetaMaskProvider_1.MetaMaskProvider; } });
var PolkadotProvider_1 = require("./providers/PolkadotProvider");
Object.defineProperty(exports, "PolkadotProvider", { enumerable: true, get: function () { return PolkadotProvider_1.PolkadotProvider; } });
var JWTUtils_1 = require("./utils/JWTUtils");
Object.defineProperty(exports, "JWTUtils", { enumerable: true, get: function () { return JWTUtils_1.JWTUtils; } });
var ChallengeUtils_1 = require("./utils/ChallengeUtils");
Object.defineProperty(exports, "ChallengeUtils", { enumerable: true, get: function () { return ChallengeUtils_1.ChallengeUtils; } });
// Default export for convenience
const WalletSSO_2 = require("./WalletSSO");
const WalletSSOServer_2 = require("./WalletSSOServer");
exports.default = {
    WalletSSO: WalletSSO_2.WalletSSO,
    WalletSSOServer: WalletSSOServer_2.WalletSSOServer,
    createServer: (config) => new WalletSSOServer_2.WalletSSOServer(config),
    createSSO: (config) => new WalletSSO_2.WalletSSO(config),
};
//# sourceMappingURL=index.js.map