const crypto = require('crypto');

class BlackBox {
    static BLACKBOX_FIELDS = [
        "v", "tz", "osType", "app", "vendor", "mem", "con", "lang", "plugins", 
        "gpu", "fonts", "audioC", "width", "height", "video", "audio", "media", 
        "permissions", "audioFP", "webglFP", "canvasFP", "creation", "uuid", 
        "d", "osVersion", "vector", "userAgent", "serverTimeInMS", "request"
    ];

    constructor(identity, request) {
        this.identity = identity;
        if (request !== undefined) {
            identity.setRequest(request);
        }
    }

    encoded() {
        return this.encode(this.identity.getFingerprint().json());
    }

    encode(fingerprint) {
        const fingerprintArray = [];
        
        for (const field of BlackBox.BLACKBOX_FIELDS) {
            fingerprintArray.push(fingerprint[field]);
        }

        const fingerprintArrayStr = JSON.stringify(fingerprintArray);
        return BlackBox.encodeStatic(fingerprintArrayStr);
    }

    static decode(blackbox) {
        try {
            let decodedBlackbox = blackbox;
            decodedBlackbox = decodedBlackbox.replace("tra:", "").replace(/_/g, '/').replace(/-/g, '+');
            decodedBlackbox = Buffer.from(decodedBlackbox, 'base64');

            const uriDecoded = [];
            uriDecoded.push(decodedBlackbox[0]);

            for (let i = 1; i < decodedBlackbox.length; i++) {
                const b = decodedBlackbox[i - 1];
                const a = decodedBlackbox[i];
                const c = a - b;
                uriDecoded.push(c);
            }

            const uriDecodedBuffer = Buffer.from(uriDecoded);
            const fingerprintStr = decodeURIComponent(uriDecodedBuffer.toString());
            const fingerprintArray = JSON.parse(fingerprintStr);
            const fingerprint = {};

            if (fingerprintArray.length !== BlackBox.BLACKBOX_FIELDS.length) {
                console.error("BlackBox::decode Error size doesn't match");
                return null;
            }

            for (let i = 0; i < BlackBox.BLACKBOX_FIELDS.length; i++) {
                fingerprint[BlackBox.BLACKBOX_FIELDS[i]] = fingerprintArray[i];
            }

            return JSON.stringify(fingerprint);
        } catch (error) {
            console.error("BlackBox decode error:", error);
            return null;
        }
    }

    static encodeStatic(fingerprintArrayStr) {
        const uriEncoded = encodeURIComponent(fingerprintArrayStr);
        const blackbox = [];

        blackbox.push(uriEncoded.charCodeAt(0));

        for (let i = 1; i < uriEncoded.length; i++) {
            const a = blackbox[i - 1];
            const b = uriEncoded.charCodeAt(i);
            const c = (a + b) & 0xFF; // Keep it within byte range
            blackbox.push(c);
        }

        let base64 = Buffer.from(blackbox).toString('base64');
        base64 = base64.replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');
        return "tra:" + base64;
    }
}

class EncryptedBlackBox extends BlackBox {
    constructor(identity, accountId, gsid, installationId) {
        const request = EncryptedBlackBox.createRequest(gsid, installationId);
        super(identity, request);
        this.accountId = accountId;
        this.gsid = gsid;
    }

    encrypted() {
        const key = this.gsid + "-" + this.accountId;
        const hashedKey = crypto.createHash('sha512').update(key).digest('hex');
        
        const blackbox = this.encode(this.identity.getFingerprint().json());
        const encrypted = this.encrypt(blackbox, hashedKey);
        
        return Buffer.from(encrypted).toString('base64');
    }

    encrypt(str, key) {
        const strBuffer = Buffer.from(str);
        const keyBuffer = Buffer.from(key);
        const result = [];

        for (let i = 0; i < strBuffer.length; i++) {
            const keyIndex = i % keyBuffer.length;
            const encrypted = strBuffer[i] ^ keyBuffer[keyIndex] ^ keyBuffer[keyBuffer.length - keyIndex - 1];
            result.push(encrypted);
        }

        return Buffer.from(result);
    }

    static createRequest(gsid, installationId) {
        const request = {};
        const featuresArray = [];

        // Add a random feature (bounded to avoid overflow)
        featuresArray.push(Math.floor(Math.random() * 2147483647) + 1);
        request.features = featuresArray;
        request.installation = installationId;
        request.session = gsid.substring(0, gsid.lastIndexOf("-"));

        return request;
    }
}

module.exports = { BlackBox, EncryptedBlackBox };