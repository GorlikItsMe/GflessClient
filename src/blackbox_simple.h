#ifndef BLACKBOX_SIMPLE_H
#define BLACKBOX_SIMPLE_H

#include "nostale_types.h"
#include "fingerprint_simple.h"
#include <memory>

class BlackBoxSimple {
public:
    BlackBoxSimple(std::shared_ptr<FingerprintSimple> fingerprint, const std::string& request = "");
    
    std::string encoded() const;
    static std::string decode(const std::string& blackbox);
    static std::string encodeStatic(const std::string& fingerprintArrayStr);

private:
    static const std::vector<std::string> BLACKBOX_FIELDS;
    std::shared_ptr<FingerprintSimple> fingerprint_;
    
    std::string encode(const JsonObject& fingerprint) const;
};

class EncryptedBlackBoxSimple : public BlackBoxSimple {
public:
    EncryptedBlackBoxSimple(std::shared_ptr<FingerprintSimple> fingerprint, 
                           const std::string& accountId, const std::string& gsid, 
                           const std::string& installationId);
    
    std::string encrypted() const;

private:
    std::string accountId_;
    std::string gsid_;
    
    std::string encrypt(const std::string& str, const std::string& key) const;
    std::string createRequest(const std::string& gsid, const std::string& installationId) const;
};

#endif // BLACKBOX_SIMPLE_H