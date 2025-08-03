"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fingerprint = void 0;
const axios_1 = __importDefault(require("axios"));
const socks_proxy_agent_1 = require("socks-proxy-agent");
class Fingerprint {
    constructor(fingerprint = {}, proxy) {
        this.proxy = proxy;
        this.fingerprint = this.initializeFingerprint(fingerprint);
        this.httpClient = this.createHttpClient();
    }
    createHttpClient() {
        const config = {
            timeout: 30000,
            headers: {
                'User-Agent': this.fingerprint.userAgent,
            },
        };
        if (this.proxy) {
            const proxyUrl = this.proxy.username
                ? `socks5://${this.proxy.username}:${this.proxy.password}@${this.proxy.host}:${this.proxy.port}`
                : `socks5://${this.proxy.host}:${this.proxy.port}`;
            config.httpsAgent = new socks_proxy_agent_1.SocksProxyAgent(proxyUrl);
            config.httpAgent = new socks_proxy_agent_1.SocksProxyAgent(proxyUrl);
        }
        return axios_1.default.create(config);
    }
    initializeFingerprint(partial) {
        const now = new Date();
        const timezone = -now.getTimezoneOffset();
        return {
            v: Fingerprint.VERSION,
            tz: timezone,
            osType: 'Windows',
            app: 'Gecko',
            vendor: 'Google Inc.',
            mem: 8192,
            con: 4,
            lang: 'en-US,en;q=0.9',
            plugins: ['PDF Viewer', 'Chrome PDF Viewer', 'Chromium PDF Viewer'],
            gpu: 'ANGLE (NVIDIA GeForce GTX 1060 6GB Direct3D11 vs_5_0 ps_5_0)',
            fonts: ['Arial', 'Calibri', 'Cambria', 'Comic Sans MS', 'Courier', 'Georgia', 'Impact', 'Times New Roman', 'Trebuchet MS', 'Verdana'],
            audioC: 2,
            width: 1920,
            height: 1080,
            video: 'probably',
            audio: 'probably',
            media: 'probably',
            permissions: 'granted',
            audioFP: this.generateRandomString(32),
            webglFP: this.generateRandomString(64),
            canvasFP: this.generateRandomString(48),
            creation: now.toISOString(),
            uuid: this.generateUuid(),
            d: Math.floor(Math.random() * (300 - 150) + 150),
            osVersion: '10.0',
            vector: this.generateVector(),
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
            serverTimeInMS: now.toISOString(),
            ...partial
        };
    }
    json() {
        return { ...this.fingerprint };
    }
    toString() {
        return JSON.stringify(this.fingerprint);
    }
    updateVector() {
        const currentTimeMs = Date.now();
        const vectorData = Buffer.from(this.fingerprint.vector, 'base64').toString();
        const lastSpaceIndex = vectorData.lastIndexOf(' ');
        let content = vectorData.substring(0, lastSpaceIndex);
        const oldTime = parseInt(vectorData.substring(lastSpaceIndex + 1));
        if (oldTime + 1000 < currentTimeMs) {
            content = content.substring(1) + this.randomAsciiCharacter();
        }
        const newVector = content + ' ' + currentTimeMs;
        this.fingerprint.vector = Buffer.from(newVector).toString('base64');
    }
    updateCreation() {
        this.fingerprint.creation = new Date().toISOString();
    }
    async updateServerTime() {
        try {
            const serverDate = await this.getServerDate();
            this.fingerprint.serverTimeInMS = serverDate;
        }
        catch (error) {
            // Fallback to current time if server request fails
            this.fingerprint.serverTimeInMS = new Date().toISOString();
        }
    }
    updateTimings() {
        this.fingerprint.d = Math.floor(Math.random() * (300 - 150) + 150);
    }
    setRequest(request) {
        this.fingerprint.request = request;
    }
    generateUuid() {
        const str = this.generateRandomString(Fingerprint.UUID_LENGTH);
        return Buffer.from(str).toString('base64').toLowerCase();
    }
    generateVector() {
        const str = this.generateRandomString(Fingerprint.VECTOR_LENGTH);
        const time = Date.now();
        const vec = str + ' ' + time;
        return Buffer.from(vec).toString('base64');
    }
    randomAsciiCharacter() {
        return String.fromCharCode(Math.floor(Math.random() * (126 - 32) + 32));
    }
    generateRandomString(size) {
        let str = '';
        for (let i = 0; i < size; i++) {
            str += this.randomAsciiCharacter();
        }
        return str;
    }
    async getServerDate() {
        try {
            const response = await this.httpClient.get(Fingerprint.SERVER_FILE_GAME1_FILE);
            const dateHeader = response.headers.date;
            if (dateHeader) {
                const date = new Date(dateHeader);
                return date.toISOString();
            }
            return new Date().toISOString();
        }
        catch (error) {
            return new Date().toISOString();
        }
    }
}
exports.Fingerprint = Fingerprint;
Fingerprint.VERSION = 7;
Fingerprint.UUID_LENGTH = 27;
Fingerprint.VECTOR_LENGTH = 100;
Fingerprint.SERVER_FILE_GAME1_FILE = 'https://gameforge.com/tra/game1.js';
//# sourceMappingURL=fingerprint.js.map