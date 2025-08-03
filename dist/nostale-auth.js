"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NostaleAuth = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const socks_proxy_agent_1 = require("socks-proxy-agent");
const identity_1 = require("./identity");
const blackbox_1 = require("./blackbox");
class NostaleAuth {
    constructor(identityPath, installationId, proxy) {
        this.token = '';
        this.locale = 'en-US';
        this.chromeVersion = '72.0.3626.121';
        this.gameforgeVersion = '2.1.15';
        this.browserUserAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36';
        this.identity = new identity_1.Identity(identityPath, proxy);
        this.installationId = installationId;
        this.httpClient = this.createHttpClient(proxy);
    }
    createHttpClient(proxy) {
        const config = {
            timeout: 30000,
            headers: {
                'User-Agent': this.browserUserAgent,
            },
        };
        if (proxy) {
            const proxyUrl = proxy.username
                ? `socks5://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
                : `socks5://${proxy.host}:${proxy.port}`;
            config.httpsAgent = new socks_proxy_agent_1.SocksProxyAgent(proxyUrl);
            config.httpAgent = new socks_proxy_agent_1.SocksProxyAgent(proxyUrl);
        }
        return axios_1.default.create(config);
    }
    async authenticate(email, password) {
        try {
            this.identity.update();
            const blackbox = new blackbox_1.BlackBox(this.identity, null);
            const response = await this.httpClient.post(`${NostaleAuth.GAMEFORGE_BASE_URL}/auth/sessions`, {
                blackbox: blackbox.encoded(),
                email: email,
                locale: this.locale,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'TNT-Installation-Id': this.installationId,
                    'Origin': 'spark://www.gameforge.com',
                    'Connection': 'keep-alive',
                    'accept-encoding': 'gzip, deflate, br'
                }
            });
            if (response.status === 201) {
                this.token = response.data.token;
                return { success: true, token: this.token };
            }
            return { success: false };
        }
        catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 409) { // Captcha required
                    const challengeId = error.response.headers['gf-challenge-id']?.split(';')[0];
                    return {
                        success: false,
                        captcha: true,
                        challengeId: challengeId
                    };
                }
                else if (status === 403) { // Wrong credentials
                    return {
                        success: false,
                        wrongCredentials: true
                    };
                }
            }
            return { success: false };
        }
    }
    async getAccounts() {
        const accounts = new Map();
        if (!this.token) {
            return accounts;
        }
        try {
            const response = await this.httpClient.get(`${NostaleAuth.GAMEFORGE_BASE_URL}/user/accounts`, {
                headers: {
                    'User-Agent': this.browserUserAgent,
                    'TNT-Installation-Id': this.installationId,
                    'Origin': 'spark://www.gameforge.com',
                    'Authorization': `Bearer ${this.token}`,
                    'Connection': 'Keep-Alive'
                }
            });
            if (response.status === 200) {
                const data = response.data;
                for (const key in data) {
                    const accountData = data[key];
                    const guls = accountData.guls;
                    if (guls && guls.game === 'nostale') {
                        accounts.set(accountData.id, accountData.displayName);
                    }
                }
            }
        }
        catch (error) {
            console.error('Failed to get accounts:', error);
        }
        return accounts;
    }
    async getGameToken(accountId) {
        if (!this.token) {
            return '';
        }
        try {
            // Send iovation data first
            await this.sendIovation(accountId);
            const gsid = this.generateGsid();
            this.identity.update();
            const encryptedBlackbox = new blackbox_1.EncryptedBlackBox(this.identity, accountId, gsid, this.installationId);
            const response = await this.httpClient.post(`${NostaleAuth.GAMEFORGE_BASE_URL}/auth/thin/codes`, {
                platformGameAccountId: accountId,
                gsid: gsid,
                blackbox: encryptedBlackbox.encrypted(),
                gameId: NostaleAuth.NOSTALE_GAME_ID
            }, {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'User-Agent': `Chrome/${this.chromeVersion} (${this.generateThirdTypeUserAgentMagic(accountId)})`,
                    'Authorization': `Bearer ${this.token}`,
                    'Connection': 'Keep-Alive',
                    'tnt-installation-id': this.installationId,
                    'accept-encoding': 'gzip, deflate, br'
                }
            });
            if (response.status === 201) {
                return response.data.code;
            }
        }
        catch (error) {
            console.error('Failed to get token for account:', accountId, error);
        }
        return '';
    }
    async createGameAccount(email, name, gfLang = 'en') {
        if (!this.token) {
            throw new Error('Not authenticated');
        }
        try {
            const response = await this.httpClient.post(`${NostaleAuth.GAMEFORGE_BASE_URL}/user/accounts`, {
                email: email,
                name: name,
                gfLang: gfLang
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                    'TNT-Installation-Id': this.installationId
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to create game account:', error);
            throw error;
        }
    }
    async sendIovation(accountId) {
        try {
            this.identity.update();
            const blackbox = new blackbox_1.BlackBox(this.identity, null);
            await this.httpClient.post('https://spark.gameforge.com/api/v1/auth/iovation', {
                iov: blackbox.encoded(),
                platformGameAccountId: accountId
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                    'TNT-Installation-Id': this.installationId
                }
            });
            return true;
        }
        catch (error) {
            console.error('Failed to send iovation:', error);
            return false;
        }
    }
    generateGsid() {
        const uuid = crypto.randomUUID().replace(/-/g, '');
        const randomNum = Math.floor(Math.random() * (9999 - 1000) + 1000);
        return `${uuid}-${randomNum}`;
    }
    getFirstNumber(uuid) {
        for (const char of uuid) {
            if (/\d/.test(char)) {
                return char;
            }
        }
        return null;
    }
    generateThirdTypeUserAgentMagic(accountId) {
        const firstLetter = this.getFirstNumber(this.installationId);
        const firstTwoLettersOfAccountId = accountId.substring(0, 2);
        if (!firstLetter || parseInt(firstLetter) % 2 === 0) {
            const hashOfCert = crypto.createHash('sha256').update('dummy-cert').digest('hex');
            const hashOfVersion = crypto.createHash('sha1').update(this.chromeVersion).digest('hex');
            const hashOfInstallationId = crypto.createHash('sha256').update(this.installationId).digest('hex');
            const hashOfAccountId = crypto.createHash('sha256').update(accountId).digest('hex');
            const hashOfSum = crypto.createHash('sha1').update(hashOfCert + hashOfVersion + hashOfInstallationId + hashOfAccountId).digest('hex');
            return hashOfSum.substring(0, 8);
        }
        else {
            const hashOfVersion = crypto.createHash('sha256').update(this.gameforgeVersion).digest('hex');
            const hashOfInstallationId = crypto.createHash('sha1').update(this.installationId).digest('hex');
            const hashOfAccountId = crypto.createHash('sha1').update(accountId).digest('hex');
            const hashOfSum = crypto.createHash('sha256').update(hashOfVersion + hashOfInstallationId + hashOfAccountId).digest('hex');
            return hashOfSum.substring(0, 8);
        }
    }
    getInstallationId() {
        return this.installationId;
    }
    setToken(token) {
        this.token = token;
    }
    getToken() {
        return this.token;
    }
}
exports.NostaleAuth = NostaleAuth;
NostaleAuth.GAMEFORGE_BASE_URL = 'https://spark.gameforge.com/api/v1';
NostaleAuth.NOSTALE_GAME_ID = 'dd4e22d6-00d1-44b9-8126-d8b40e0cd7c9';
//# sourceMappingURL=nostale-auth.js.map