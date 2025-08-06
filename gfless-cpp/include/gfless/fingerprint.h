#pragma once

#include "common.h"
#include "http_client.h"

namespace gfless {

class Fingerprint {
public:
    Fingerprint() = default;
    
    Fingerprint(const json& fp, 
               const std::string& proxyIp = "",
               const std::string& proxyPort = "",
               const std::string& proxyUsername = "",
               const std::string& proxyPassword = "",
               bool useProxy = false);
    
    // Get fingerprint as JSON object
    json getJson() const;
    
    // Get fingerprint as JSON string
    std::string toString() const;
    
    // Update methods
    void updateVector();
    void updateCreation();
    void updateServerTime();
    void updateTimings();
    void setRequest(const json& request);
    
private:
    static const int VERSION = 7;
    static const int UUID_LENGTH = 27;
    static const int VECTOR_LENGTH = 100;
    static const std::string SERVER_FILE_GAME1_URL;
    
    json fingerprint_;
    std::string proxy_ip_;
    std::string proxy_port_;
    std::string proxy_username_;
    std::string proxy_password_;
    bool use_proxy_;
    
    // Helper methods
    std::string generateUuid() const;
    std::string generateVector() const;
    char randomAsciiCharacter() const;
    std::string randomString(size_t size) const;
    std::string getServerDate() const;
};

} // namespace gfless