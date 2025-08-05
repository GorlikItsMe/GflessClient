#include "gfless/identity.h"
#include <fstream>
#include <iostream>

namespace gfless {

Identity::Identity(const std::string& filePath,
                  const std::string& proxyIp,
                  const std::string& proxyPort,
                  const std::string& proxyUsername,
                  const std::string& proxyPassword,
                  bool useProxy)
    : filename_(filePath) {
    
    initFingerprint(proxyIp, proxyPort, proxyUsername, proxyPassword, useProxy);
}

Identity::~Identity() {
    save();
}

void Identity::update() {
    fingerprint_.updateVector();
    fingerprint_.updateServerTime();
    fingerprint_.updateCreation();
    fingerprint_.updateTimings();
}

Fingerprint Identity::getFingerprint() const {
    return fingerprint_;
}

void Identity::setRequest(const json& request) {
    fingerprint_.setRequest(request);
}

void Identity::initFingerprint(const std::string& proxyIp,
                              const std::string& proxyPort,
                              const std::string& proxyUsername,
                              const std::string& proxyPassword,
                              bool useProxy) {
    
    std::ifstream file(filename_);
    
    if (file.is_open()) {
        try {
            json fp_json;
            file >> fp_json;
            
            fingerprint_ = Fingerprint(fp_json, proxyIp, proxyPort, 
                                     proxyUsername, proxyPassword, useProxy);
            
        } catch (const std::exception& e) {
            // If file is invalid JSON, create empty fingerprint
            std::cerr << "Warning: Invalid identity file format: " << e.what() << std::endl;
            fingerprint_ = Fingerprint(json::object(), proxyIp, proxyPort,
                                     proxyUsername, proxyPassword, useProxy);
        }
        
        file.close();
    } else {
        // File doesn't exist, create empty fingerprint
        fingerprint_ = Fingerprint(json::object(), proxyIp, proxyPort,
                                 proxyUsername, proxyPassword, useProxy);
    }
}

void Identity::save() const {
    if (filename_.empty()) {
        return;
    }
    
    std::ofstream file(filename_);
    
    if (file.is_open()) {
        try {
            file << fingerprint_.toString();
        } catch (const std::exception& e) {
            std::cerr << "Error saving identity file: " << e.what() << std::endl;
        }
        
        file.close();
    } else {
        std::cerr << "Error: Cannot write to identity file: " << filename_ << std::endl;
    }
}

} // namespace gfless
