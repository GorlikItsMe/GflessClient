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
exports.EncryptedBlackBox = exports.BlackBox = void 0;
const crypto = __importStar(require("crypto"));
class BlackBox {
    constructor(identity, request) {
        this.identity = identity;
        this.identity.setRequest(request);
    }
    encoded() {
        return BlackBox.encode(this.fingerprintArrayToBuffer());
    }
    static decode(blackbox) {
        let decodedBlackbox = blackbox.replace(/^tra:/, '').replace(/_/g, '/').replace(/-/g, '+');
        // Add padding if needed
        while (decodedBlackbox.length % 4) {
            decodedBlackbox += '=';
        }
        const decoded = Buffer.from(decodedBlackbox, 'base64');
        const uriDecoded = Buffer.alloc(decoded.length);
        uriDecoded[0] = decoded[0];
        for (let i = 1; i < decoded.length; i++) {
            const b = decoded[i - 1];
            const a = decoded[i];
            const c = (a - b) & 0xFF; // Ensure byte range
            uriDecoded[i] = c;
        }
        const fingerprintStr = decodeURIComponent(uriDecoded.toString());
        const fingerprintArray = JSON.parse(fingerprintStr);
        const fingerprint = {};
        if (fingerprintArray.length !== BlackBox.BLACKBOX_FIELDS.length) {
            throw new Error('BlackBox field count mismatch');
        }
        for (let i = 0; i < BlackBox.BLACKBOX_FIELDS.length; i++) {
            fingerprint[BlackBox.BLACKBOX_FIELDS[i]] = fingerprintArray[i];
        }
        return Buffer.from(JSON.stringify(fingerprint));
    }
    static encode(fingerprintArrayBuffer) {
        const uriEncoded = Buffer.from(encodeURIComponent(fingerprintArrayBuffer.toString()).replace(/[!'()*]/g, (c) => {
            return '%' + c.charCodeAt(0).toString(16).toUpperCase();
        }));
        const blackbox = Buffer.alloc(uriEncoded.length);
        blackbox[0] = uriEncoded[0];
        for (let i = 1; i < uriEncoded.length; i++) {
            const a = blackbox[i - 1];
            const b = uriEncoded[i];
            const c = (a + b) & 0xFF; // Ensure byte range
            blackbox[i] = c;
        }
        let base64 = blackbox.toString('base64');
        base64 = base64.replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');
        return 'tra:' + base64;
    }
    fingerprintArrayToBuffer() {
        const fingerprintData = this.identity.getFingerprint().json();
        const fingerprintArray = [];
        for (const field of BlackBox.BLACKBOX_FIELDS) {
            fingerprintArray.push(fingerprintData[field]);
        }
        return Buffer.from(JSON.stringify(fingerprintArray));
    }
}
exports.BlackBox = BlackBox;
BlackBox.BLACKBOX_FIELDS = [
    'v', 'tz', 'osType', 'app', 'vendor', 'mem', 'con', 'lang',
    'plugins', 'gpu', 'fonts', 'audioC', 'width', 'height', 'video',
    'audio', 'media', 'permissions', 'audioFP', 'webglFP', 'canvasFP',
    'creation', 'uuid', 'd', 'osVersion', 'vector', 'userAgent',
    'serverTimeInMS', 'request'
];
class EncryptedBlackBox extends BlackBox {
    constructor(identity, accountId, gsid, installationId) {
        const request = EncryptedBlackBox.createRequest(gsid, installationId);
        super(identity, request);
        this.accountId = accountId;
        this.gsid = gsid;
    }
    encrypted() {
        const key = this.gsid + '-' + this.accountId;
        const keyHash = crypto.createHash('sha512').update(key).digest('hex');
        const blackbox = this.fingerprintArrayToBuffer();
        const encrypted = this.encrypt(blackbox, Buffer.from(keyHash, 'hex'));
        return encrypted.toString('base64');
    }
    encrypt(data, key) {
        // Use AES-256-CBC encryption similar to the original implementation
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key.subarray(0, 32), iv);
        let encrypted = cipher.update(data);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return Buffer.concat([iv, encrypted]);
    }
    static createRequest(gsid, installationId) {
        return {
            gsid: gsid,
            installationId: installationId,
            timestamp: Date.now()
        };
    }
}
exports.EncryptedBlackBox = EncryptedBlackBox;
//# sourceMappingURL=blackbox.js.map