const fs = require('fs');
const path = require('path');
const Fingerprint = require('./Fingerprint');

class Identity {
    constructor(filePath, proxyConfig = {}) {
        this.filename = filePath;
        this.proxyConfig = proxyConfig;
        this.fingerprint = null;
        
        this.initFingerprint();
    }

    initFingerprint() {
        if (fs.existsSync(this.filename)) {
            try {
                const content = fs.readFileSync(this.filename, 'utf8');
                const fingerprintData = JSON.parse(content);
                this.fingerprint = new Fingerprint(fingerprintData, this.proxyConfig);
            } catch (error) {
                console.error('Error reading fingerprint file:', error.message);
                this.fingerprint = new Fingerprint({}, this.proxyConfig);
            }
        } else {
            // Create new fingerprint if file doesn't exist
            this.fingerprint = new Fingerprint({}, this.proxyConfig);
        }
    }

    async update() {
        this.fingerprint.updateVector();
        await this.fingerprint.updateServerTime();
        this.fingerprint.updateCreation();
        this.fingerprint.updateTimings();
    }

    getFingerprint() {
        return this.fingerprint;
    }

    setRequest(request) {
        this.fingerprint.setRequest(request);
    }

    save() {
        try {
            // Ensure directory exists
            const dir = path.dirname(this.filename);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            const content = this.fingerprint.toString();
            fs.writeFileSync(this.filename, content, 'utf8');
        } catch (error) {
            console.error('Error saving fingerprint file:', error.message);
        }
    }

    // Destructor equivalent - call this when done
    close() {
        this.save();
    }
}

module.exports = Identity;