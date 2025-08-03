"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameforgeAccount = void 0;
const nostale_auth_1 = require("./nostale-auth");
class GameforgeAccount {
    constructor(config) {
        this.gameAccounts = new Map();
        this.email = config.email;
        this.password = config.password;
        this.identityPath = config.identityPath;
        this.customClientPath = config.customGamePath;
        this.auth = new nostale_auth_1.NostaleAuth(config.identityPath, config.installationId, config.proxy);
    }
    async authenticate() {
        const result = await this.auth.authenticate(this.email, this.password);
        if (result.success) {
            await this.updateGameAccounts();
        }
        return result;
    }
    async createGameAccount(name, gfLang = 'en') {
        return await this.auth.createGameAccount(this.email, name, gfLang);
    }
    setToken(token) {
        this.auth.setToken(token);
    }
    getGameAccounts() {
        return new Map(this.gameAccounts);
    }
    async updateGameAccounts() {
        this.gameAccounts = await this.auth.getAccounts();
    }
    async getToken(accountId) {
        return await this.auth.getGameToken(accountId);
    }
    getEmail() {
        return this.email;
    }
    getPassword() {
        return this.password;
    }
    getIdentityPath() {
        return this.identityPath;
    }
    getAuth() {
        return this.auth;
    }
    getCustomClientPath() {
        return this.customClientPath;
    }
}
exports.GameforgeAccount = GameforgeAccount;
//# sourceMappingURL=gameforge-account.js.map