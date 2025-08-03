const axios = require('axios');
const crypto = require('crypto');

class Fingerprint {
    static VERSION = 7;
    static UUID_LENGTH = 27;
    static VECTOR_LENGTH = 100;
    static SERVER_FILE_GAME1_FILE = "https://gameforge.com/tra/game1.js";

    constructor(fp = {}, proxyConfig = {}) {
        this.fingerprint = fp;
        this.proxyConfig = proxyConfig;
        
        // Initialize fingerprint with default values if empty
        if (Object.keys(fp).length === 0) {
            this._initializeFingerprint();
        }
    }

    _initializeFingerprint() {
        this.fingerprint = {
            v: Fingerprint.VERSION,
            tz: new Date().getTimezoneOffset(),
            osType: process.platform,
            app: "GflessClient",
            vendor: "Gameforge",
            mem: Math.floor(Math.random() * 4096) + 2048, // Random memory between 2-6GB
            con: 1,
            lang: "en-US",
            plugins: [],
            gpu: "Generic GPU",
            fonts: [],
            audioC: 2,
            width: 1920,
            height: 1080,
            video: "mp4",
            audio: "ogg",
            media: true,
            permissions: {},
            audioFP: this._generateRandomString(20),
            webglFP: this._generateRandomString(20),
            canvasFP: this._generateRandomString(20),
            creation: new Date().toISOString(),
            uuid: this.generateUuid(),
            d: Math.floor(Math.random() * 150) + 150, // Random between 150-300
            osVersion: process.version,
            vector: this.generateVector(),
            userAgent: `GflessClient/${Fingerprint.VERSION}`,
            serverTimeInMS: "",
            request: null
        };
    }

    json() {
        return this.fingerprint;
    }

    toString() {
        return JSON.stringify(this.fingerprint);
    }

    updateVector() {
        const currentTimeMs = Date.now();
        const content = Buffer.from(this.fingerprint.vector, 'base64').toString();
        const lastBlankIndex = content.lastIndexOf(' ');
        const oldTime = parseInt(content.substring(lastBlankIndex + 1));
        let vectorContent = content.substring(0, lastBlankIndex);

        if (oldTime + 0x3e8 < currentTimeMs) {
            vectorContent = vectorContent.substring(1) + this.randomAsciiCharacter();
        }

        const newVector = vectorContent + " " + currentTimeMs.toString();
        this.fingerprint.vector = Buffer.from(newVector).toString('base64');
    }

    updateCreation() {
        this.fingerprint.creation = new Date().toISOString();
    }

    async updateServerTime() {
        try {
            this.fingerprint.serverTimeInMS = await this.getServerDate();
        } catch (error) {
            console.error('Failed to update server time:', error.message);
            // Fallback to local time if server request fails
            this.fingerprint.serverTimeInMS = new Date().toISOString();
        }
    }

    updateTimings() {
        this.fingerprint.d = Math.floor(Math.random() * 150) + 150;
    }

    setRequest(request) {
        this.fingerprint.request = request;
    }

    generateUuid() {
        const str = this._generateRandomString(Fingerprint.UUID_LENGTH);
        return Buffer.from(str).toString('base64').toLowerCase();
    }

    generateVector() {
        const str = this._generateRandomString(Fingerprint.VECTOR_LENGTH);
        const time = Date.now();
        const vec = str + " " + time.toString();
        return Buffer.from(vec).toString('base64');
    }

    randomAsciiCharacter() {
        return String.fromCharCode(Math.floor(Math.random() * (126 - 32)) + 32);
    }

    _generateRandomString(size) {
        let str = '';
        for (let i = 0; i < size; i++) {
            str += this.randomAsciiCharacter();
        }
        return str;
    }

    async getServerDate() {
        try {
            const axiosConfig = {
                method: 'GET',
                url: Fingerprint.SERVER_FILE_GAME1_FILE,
                timeout: 5000
            };

            // Add proxy configuration if provided
            if (this.proxyConfig.useProxy) {
                axiosConfig.proxy = {
                    protocol: 'socks5',
                    host: this.proxyConfig.ip,
                    port: parseInt(this.proxyConfig.port)
                };

                if (this.proxyConfig.username) {
                    axiosConfig.proxy.auth = {
                        username: this.proxyConfig.username,
                        password: this.proxyConfig.password
                    };
                }
            }

            const response = await axios(axiosConfig);
            const dateHeader = response.headers['date'];
            
            if (dateHeader) {
                const date = new Date(dateHeader.replace('GMT', 'UTC'));
                return date.toISOString();
            }
            
            return new Date().toISOString();
        } catch (error) {
            console.error('Error fetching server date:', error.message);
            return new Date().toISOString();
        }
    }
}

module.exports = Fingerprint;