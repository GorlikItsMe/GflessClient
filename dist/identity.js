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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Identity = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fingerprint_1 = require("./fingerprint");
class Identity {
    constructor(filePath, proxy) {
        this.filename = filePath || path.join(__dirname, '..', 'identity.json');
        this.fingerprint = this.initFingerprint(proxy);
    }
    initFingerprint(proxy) {
        let fingerprintData = {};
        // Try to load existing fingerprint from file
        if (fs.existsSync(this.filename)) {
            try {
                const fileContent = fs.readFileSync(this.filename, 'utf8');
                fingerprintData = JSON.parse(fileContent);
            }
            catch (error) {
                console.warn('Failed to load identity file, creating new one:', error);
            }
        }
        const fingerprint = new fingerprint_1.Fingerprint(fingerprintData, proxy);
        // Save the fingerprint if it's new or updated
        this.save(fingerprint);
        return fingerprint;
    }
    update() {
        this.fingerprint.updateVector();
        this.fingerprint.updateCreation();
        this.fingerprint.updateTimings();
        this.save(this.fingerprint);
    }
    async updateServerTime() {
        await this.fingerprint.updateServerTime();
        this.save(this.fingerprint);
    }
    getFingerprint() {
        return this.fingerprint;
    }
    setRequest(request) {
        this.fingerprint.setRequest(request);
    }
    save(fingerprint) {
        try {
            // Ensure directory exists
            const dir = path.dirname(this.filename);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // Save fingerprint to file
            const data = JSON.stringify(fingerprint.json(), null, 2);
            fs.writeFileSync(this.filename, data, 'utf8');
        }
        catch (error) {
            console.error('Failed to save identity file:', error);
        }
    }
    static generateIdentityFile(blackboxString, outputPath) {
        try {
            // Parse blackbox to extract fingerprint data
            const decoded = this.parseBlackbox(blackboxString);
            if (!decoded) {
                return false;
            }
            // Create fingerprint from decoded data
            const fingerprint = new fingerprint_1.Fingerprint(decoded);
            // Ensure directory exists
            const dir = path.dirname(outputPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // Save to file
            const data = JSON.stringify(fingerprint.json(), null, 2);
            fs.writeFileSync(outputPath, data, 'utf8');
            return true;
        }
        catch (error) {
            console.error('Failed to generate identity file:', error);
            return false;
        }
    }
    static parseBlackbox(blackboxString) {
        try {
            // Remove "tra:" prefix if present
            let cleanBlackbox = blackboxString.replace(/^tra:/, '');
            // Replace URL-safe base64 characters
            cleanBlackbox = cleanBlackbox.replace(/_/g, '/').replace(/-/g, '+');
            // Add padding if needed
            while (cleanBlackbox.length % 4) {
                cleanBlackbox += '=';
            }
            // Decode base64
            let decoded = Buffer.from(cleanBlackbox, 'base64');
            // Decode the differential encoding
            const uriDecoded = Buffer.alloc(decoded.length);
            uriDecoded[0] = decoded[0];
            for (let i = 1; i < decoded.length; i++) {
                const b = decoded[i - 1];
                const a = decoded[i];
                const c = a - b;
                uriDecoded[i] = c;
            }
            // URI decode
            const fingerprintStr = decodeURIComponent(uriDecoded.toString());
            // Parse as JSON array
            const fingerprintArray = JSON.parse(fingerprintStr);
            // Map array to fingerprint object
            const blackboxFields = [
                'v', 'tz', 'osType', 'app', 'vendor', 'mem', 'con', 'lang',
                'plugins', 'gpu', 'fonts', 'audioC', 'width', 'height', 'video',
                'audio', 'media', 'permissions', 'audioFP', 'webglFP', 'canvasFP',
                'creation', 'uuid', 'd', 'osVersion', 'vector', 'userAgent',
                'serverTimeInMS', 'request'
            ];
            if (fingerprintArray.length !== blackboxFields.length) {
                console.error('Blackbox field count mismatch');
                return null;
            }
            const fingerprint = {};
            for (let i = 0; i < blackboxFields.length; i++) {
                fingerprint[blackboxFields[i]] = fingerprintArray[i];
            }
            return fingerprint;
        }
        catch (error) {
            console.error('Failed to parse blackbox:', error);
            return null;
        }
    }
}
exports.Identity = Identity;
//# sourceMappingURL=identity.js.map