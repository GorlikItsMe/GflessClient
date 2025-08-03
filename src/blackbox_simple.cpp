#include "blackbox_simple.h"
#include <sstream>
#include <algorithm>

const std::vector<std::string> BlackBoxSimple::BLACKBOX_FIELDS = {
    "v", "tz", "osType", "app", "vendor", "mem", "con", "lang", "plugins", 
    "gpu", "fonts", "audioC", "width", "height", "video", "audio", "media", 
    "permissions", "audioFP", "webglFP", "canvasFP", "creation", "uuid", 
    "d", "osVersion", "vector", "userAgent", "serverTimeInMS", "request"
};

BlackBoxSimple::BlackBoxSimple(std::shared_ptr<FingerprintSimple> fingerprint, const std::string& request)
    : fingerprint_(fingerprint) {
    if (!request.empty()) {
        fingerprint_->setRequest(request);
    }
}

std::string BlackBoxSimple::encoded() const {
    return encode(fingerprint_->json());
}

std::string BlackBoxSimple::encode(const JsonObject& fingerprint) const {
    // Create JSON array from fields
    std::stringstream ss;
    ss << "[";
    bool first = true;
    for (const auto& field : BLACKBOX_FIELDS) {
        if (!first) ss << ",";
        std::string value = fingerprint.value(field);
        // Simple JSON escaping
        if (value.empty()) {
            ss << "\"\"";
        } else if (value == "true" || value == "false" || std::all_of(value.begin(), value.end(), ::isdigit)) {
            ss << value;
        } else {
            ss << "\"" << value << "\"";
        }
        first = false;
    }
    ss << "]";
    
    return encodeStatic(ss.str());
}

std::string BlackBoxSimple::decode(const std::string& blackbox) {
    try {
        std::string decodedBlackbox = blackbox;
        
        // Remove "tra:" prefix
        if (decodedBlackbox.substr(0, 4) == "tra:") {
            decodedBlackbox = decodedBlackbox.substr(4);
        }
        
        // Replace URL-safe characters
        std::replace(decodedBlackbox.begin(), decodedBlackbox.end(), '_', '/');
        std::replace(decodedBlackbox.begin(), decodedBlackbox.end(), '-', '+');
        
        // Add padding if needed
        while (decodedBlackbox.length() % 4) {
            decodedBlackbox += '=';
        }
        
        // Base64 decode
        ByteArray decoded = Base64::decode(decodedBlackbox);
        
        // Reverse the encoding algorithm
        std::vector<uint8_t> uriDecoded;
        if (!decoded.empty()) {
            uriDecoded.push_back(decoded[0]);
            
            for (size_t i = 1; i < decoded.size(); ++i) {
                uint8_t b = decoded[i - 1];
                uint8_t a = decoded[i];
                uint8_t c = a - b;
                uriDecoded.push_back(c);
            }
        }
        
        // Convert to string and URL decode
        std::string uriDecodedStr(uriDecoded.begin(), uriDecoded.end());
        std::string fingerprintStr = Url::fromPercentEncoding(uriDecodedStr);
        
        // Parse the JSON array back to object (simplified)
        JsonObject fingerprint;
        // This is a very basic JSON array parser - for production use a proper JSON library
        size_t pos = fingerprintStr.find('[');
        if (pos != std::string::npos) {
            size_t endPos = fingerprintStr.find(']', pos);
            if (endPos != std::string::npos) {
                std::string arrayContent = fingerprintStr.substr(pos + 1, endPos - pos - 1);
                
                // Split by commas and assign to fields
                std::vector<std::string> values;
                std::stringstream ss(arrayContent);
                std::string item;
                
                while (std::getline(ss, item, ',')) {
                    // Remove quotes and whitespace
                    item.erase(0, item.find_first_not_of(" \t\n\r\f\v"));
                    item.erase(item.find_last_not_of(" \t\n\r\f\v") + 1);
                    if (item.front() == '"' && item.back() == '"') {
                        item = item.substr(1, item.length() - 2);
                    }
                    values.push_back(item);
                }
                
                // Assign values to fields
                for (size_t i = 0; i < std::min(BLACKBOX_FIELDS.size(), values.size()); ++i) {
                    fingerprint.insert(BLACKBOX_FIELDS[i], values[i]);
                }
            }
        }
        
        return fingerprint.toString();
    } catch (const std::exception& e) {
        return "";
    }
}

std::string BlackBoxSimple::encodeStatic(const std::string& fingerprintArrayStr) {
    // URL encode
    std::string uriEncoded = Url::toPercentEncoding(fingerprintArrayStr, "-_!~*.'()");
    
    // Apply the encoding algorithm
    std::vector<uint8_t> blackbox;
    if (!uriEncoded.empty()) {
        blackbox.push_back(static_cast<uint8_t>(uriEncoded[0]));
        
        for (size_t i = 1; i < uriEncoded.length(); ++i) {
            uint8_t a = blackbox[i - 1];
            uint8_t b = static_cast<uint8_t>(uriEncoded[i]);
            uint8_t c = a + b;
            blackbox.push_back(c);
        }
    }
    
    // Base64 encode
    std::string base64 = Base64::encode(blackbox);
    
    // Make URL-safe and remove padding
    std::replace(base64.begin(), base64.end(), '/', '_');
    std::replace(base64.begin(), base64.end(), '+', '-');
    base64.erase(std::remove(base64.begin(), base64.end(), '='), base64.end());
    
    return "tra:" + base64;
}

// EncryptedBlackBoxSimple implementation
EncryptedBlackBoxSimple::EncryptedBlackBoxSimple(std::shared_ptr<FingerprintSimple> fingerprint,
                                                 const std::string& accountId, const std::string& gsid,
                                                 const std::string& installationId)
    : BlackBoxSimple(fingerprint, createRequest(gsid, installationId))
    , accountId_(accountId)
    , gsid_(gsid) {
}

std::string EncryptedBlackBoxSimple::encrypted() const {
    std::string key = gsid_ + "-" + accountId_;
    std::string hashedKey = Crypto::sha512(key);
    
    std::string blackbox = encode(fingerprint_->json());
    std::string encrypted = encrypt(blackbox, hashedKey);
    
    return Base64::encode(encrypted);
}

std::string EncryptedBlackBoxSimple::encrypt(const std::string& str, const std::string& key) const {
    std::string result;
    
    for (size_t i = 0; i < str.length(); ++i) {
        size_t keyIndex = i % key.length();
        char encrypted = str[i] ^ key[keyIndex] ^ key[key.length() - keyIndex - 1];
        result.push_back(encrypted);
    }
    
    return result;
}

std::string EncryptedBlackBoxSimple::createRequest(const std::string& gsid, const std::string& installationId) const {
    // Create a simple JSON request object
    std::stringstream ss;
    ss << "{";
    ss << "\"features\":[" << RandomGenerator::global()->bounded(1, 2147483647) << "],";
    ss << "\"installation\":\"" << installationId << "\",";
    
    size_t dashPos = gsid.find_last_of('-');
    std::string session = (dashPos != std::string::npos) ? gsid.substr(0, dashPos) : gsid;
    ss << "\"session\":\"" << session << "\"";
    ss << "}";
    
    return ss.str();
}