#pragma once

#include "common.h"
#include "fingerprint.h"

namespace gfless {

class Identity {
public:
    Identity() = default;
    
    Identity(const std::string& filePath,
            const std::string& proxyIp = "",
            const std::string& proxyPort = "",
            const std::string& proxyUsername = "",
            const std::string& proxyPassword = "",
            bool useProxy = false);
    
    ~Identity();
    
    // Update fingerprint
    void update();
    
    // Get fingerprint
    Fingerprint getFingerprint() const;
    
    // Set request data
    void setRequest(const json& request);
    
private:
    std::string filename_;
    Fingerprint fingerprint_;
    
    // Initialize fingerprint from file
    void initFingerprint(const std::string& proxyIp,
                        const std::string& proxyPort,
                        const std::string& proxyUsername,
                        const std::string& proxyPassword,
                        bool useProxy);
    
    // Save fingerprint to file
    void save() const;
};

} // namespace gfless