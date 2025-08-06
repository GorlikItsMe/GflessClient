#pragma once

#include "common.h"
#include "fingerprint.h"
#include "identity.h"

namespace gfless {

class BlackBox {
public:
    BlackBox(std::shared_ptr<Identity> ident, const json& req);
    
    std::string encoded() const;
    
    static std::string decode(const std::string& blackbox);
    static std::string encode(const std::string& fingerprintArrayStr);
    static std::string encode(const json& fingerprint);

protected:
    static const std::vector<std::string> BLACKBOX_FIELDS;
    std::shared_ptr<Identity> identity_;
    
    // std::string encode(const json& fingerprint) const;
};

class EncryptedBlackBox : public BlackBox {
public:
    EncryptedBlackBox(std::shared_ptr<Identity> ident,
                     const std::string& accId,
                     const std::string& gsid,
                     const std::string& installationId);
    
    std::string encrypted() const;
    
private:
    std::string account_id_;
    std::string gsid_;
    
    std::string encrypt(const std::string& str, const std::string& key) const;
    json createRequest(const std::string& gsid, const std::string& installationId) const;
};

} // namespace gfless