#include "gfless/blackbox.h"
#include "gfless/crypto_utils.h"
#include <limits>
#include <iostream>
#include <algorithm>

namespace gfless {

const std::vector<std::string> BlackBox::BLACKBOX_FIELDS = {
    "v", "tz", "osType", "app", "vendor", "mem", "con", "lang", "plugins", 
    "gpu", "fonts", "audioC", "width", "height", "video", "audio", "media", 
    "permissions", "audioFP", "webglFP", "canvasFP", "creation", "uuid", "d", 
    "osVersion", "vector", "userAgent", "serverTimeInMS", "request"
};

BlackBox::BlackBox(std::shared_ptr<Identity> ident, const json& req)
    : identity_(ident) {
    identity_->setRequest(req);
}

std::string BlackBox::encode(const json& fingerprint) const {
    json fingerprintArray = json::array();
    
    for (const auto& field : BLACKBOX_FIELDS) {
        fingerprintArray.push_back(fingerprint.value(field, json()));
    }
    
    std::string fingerprintArrayStr = fingerprintArray.dump();
    return BlackBox::encode(fingerprintArrayStr);
}

std::string BlackBox::decode(const std::string& blackbox) {
    std::string decodedBlackbox = blackbox;
    
    // Remove "tra:" prefix and replace characters
    size_t tra_pos = decodedBlackbox.find("tra:");
    if (tra_pos != std::string::npos) {
        decodedBlackbox = decodedBlackbox.substr(4);
    }
    
    // Replace URL-safe base64 characters
    std::replace(decodedBlackbox.begin(), decodedBlackbox.end(), '_', '/');
    std::replace(decodedBlackbox.begin(), decodedBlackbox.end(), '-', '+');
    
    // Add padding if needed
    while (decodedBlackbox.length() % 4) {
        decodedBlackbox += '=';
    }
    
    decodedBlackbox = Utils::base64Decode(decodedBlackbox);
    
    // URI decode process (reverse of encoding)
    std::string uriDecoded;
    if (!decodedBlackbox.empty()) {
        uriDecoded.push_back(decodedBlackbox[0]);
        
        for (size_t i = 1; i < decodedBlackbox.size(); ++i) {
            char b = decodedBlackbox[i - 1];
            char a = decodedBlackbox[i];
            char c = a - b;
            uriDecoded.push_back(c);
        }
    }
    
    std::string fingerprintStr = Utils::urlDecode(uriDecoded);
    
    try {
        json fingerprintArray = json::parse(fingerprintStr);
        json fingerprint = json::object();
        
        if (fingerprintArray.size() != BLACKBOX_FIELDS.size()) {
            throw std::runtime_error("BlackBox::decode Error size doesn't match");
        }
        
        for (size_t i = 0; i < BLACKBOX_FIELDS.size(); ++i) {
            fingerprint[BLACKBOX_FIELDS[i]] = fingerprintArray[i];
        }
        
        return fingerprint.dump();
        
    } catch (const std::exception& e) {
        std::cerr << "BlackBox::decode Error: " << e.what() << std::endl;
        return "";
    }
}

std::string BlackBox::encode(const std::string& fingerprintArrayStr) {
    std::string uriEncoded = Utils::urlEncode(fingerprintArrayStr);
    
    // Encode process (reverse of decode)
    std::string blackbox;
    if (!uriEncoded.empty()) {
        blackbox.push_back(uriEncoded[0]);
        
        for (size_t i = 1; i < uriEncoded.size(); ++i) {
            char a = blackbox[i - 1];
            char b = uriEncoded[i];
            char c = a + b;
            blackbox.push_back(c);
        }
    }
    
    blackbox = Utils::base64Encode(blackbox);
    
    // Replace characters for URL-safe base64
    std::replace(blackbox.begin(), blackbox.end(), '/', '_');
    std::replace(blackbox.begin(), blackbox.end(), '+', '-');
    
    // Remove padding
    blackbox.erase(std::find(blackbox.begin(), blackbox.end(), '='), blackbox.end());
    
    return "tra:" + blackbox;
}

std::string BlackBox::encoded() const {
    return encode(identity_->getFingerprint().getJson());
}

EncryptedBlackBox::EncryptedBlackBox(std::shared_ptr<Identity> ident,
                                   const std::string& accId,
                                   const std::string& gsid,
                                   const std::string& installationId)
    : BlackBox(ident, createRequest(gsid, installationId))
    , account_id_(accId)
    , gsid_(gsid) {
}

std::string EncryptedBlackBox::encrypted() const {
    std::string key = gsid_ + "-" + account_id_;
    key = CryptoUtils::sha512Hex(key);
    
    std::string blackbox = encode(identity_->getFingerprint().getJson());
    blackbox = encrypt(blackbox, key);
    blackbox = Utils::base64Encode(blackbox);
    
    return blackbox;
}

std::string EncryptedBlackBox::encrypt(const std::string& str, const std::string& key) const {
    return CryptoUtils::xorEncrypt(str, key);
}

json EncryptedBlackBox::createRequest(const std::string& gsid, const std::string& installationId) const {
    json request = json::object();
    json featuresArray = json::array();
    
    // Random feature value
    std::uniform_int_distribution<int> dis(1, (std::numeric_limits<int>::max)());
    featuresArray.push_back(dis(Utils::getRandomGenerator()));
    
    request["features"] = featuresArray;
    request["installation"] = installationId;
    
    // Extract session from gsid (everything before last dash)
    size_t last_dash = gsid.rfind('-');
    if (last_dash != std::string::npos) {
        request["session"] = gsid.substr(0, last_dash);
    } else {
        request["session"] = gsid;
    }
    
    return request;
}

} // namespace gfless