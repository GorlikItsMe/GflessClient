"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameforgeAuthUtils = exports.GameAccount = exports.GameforgeAccount = exports.NostaleAuth = exports.EncryptedBlackBox = exports.BlackBox = exports.Identity = exports.Fingerprint = void 0;
// Core classes
var fingerprint_1 = require("./fingerprint");
Object.defineProperty(exports, "Fingerprint", { enumerable: true, get: function () { return fingerprint_1.Fingerprint; } });
var identity_1 = require("./identity");
Object.defineProperty(exports, "Identity", { enumerable: true, get: function () { return identity_1.Identity; } });
var blackbox_1 = require("./blackbox");
Object.defineProperty(exports, "BlackBox", { enumerable: true, get: function () { return blackbox_1.BlackBox; } });
Object.defineProperty(exports, "EncryptedBlackBox", { enumerable: true, get: function () { return blackbox_1.EncryptedBlackBox; } });
var nostale_auth_1 = require("./nostale-auth");
Object.defineProperty(exports, "NostaleAuth", { enumerable: true, get: function () { return nostale_auth_1.NostaleAuth; } });
var gameforge_account_1 = require("./gameforge-account");
Object.defineProperty(exports, "GameforgeAccount", { enumerable: true, get: function () { return gameforge_account_1.GameforgeAccount; } });
var game_account_1 = require("./game-account");
Object.defineProperty(exports, "GameAccount", { enumerable: true, get: function () { return game_account_1.GameAccount; } });
// Import for internal use
const identity_2 = require("./identity");
// Utility functions
class GameforgeAuthUtils {
    /**
     * Generate an installation ID similar to what the Gameforge client uses
     */
    static generateInstallationId() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    /**
     * Create an identity file from a blackbox string (extracted from Fiddler)
     */
    static generateIdentityFromBlackbox(blackboxString, outputPath) {
        return identity_2.Identity.generateIdentityFile(blackboxString, outputPath);
    }
}
exports.GameforgeAuthUtils = GameforgeAuthUtils;
//# sourceMappingURL=index.js.map