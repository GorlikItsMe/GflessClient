#pragma once

/**
 * Gfless C++ Library
 * 
 * A C++ library for generating device fingerprints and blackbox data
 * for authentication purposes. This is a Qt-free port of the original
 * GflessClient authentication system.
 */

#include "common.h"
#include "crypto_utils.h"
#include "http_client.h"
#include "fingerprint.h"
#include "identity.h"
#include "blackbox.h"

namespace gfless {

// Library version
constexpr const char* VERSION = "1.0.0";

// Convenience functions for common use cases

/**
 * Create an Identity from a file path with optional proxy settings
 */
inline std::shared_ptr<Identity> createIdentity(
    const std::string& filePath,
    const std::string& proxyIp = "",
    const std::string& proxyPort = "",
    const std::string& proxyUsername = "",
    const std::string& proxyPassword = "",
    bool useProxy = false) {
    
    return std::make_shared<Identity>(filePath, proxyIp, proxyPort, 
                                    proxyUsername, proxyPassword, useProxy);
}

/**
 * Create a BlackBox for encoding
 */
inline std::unique_ptr<BlackBox> createBlackBox(
    std::shared_ptr<Identity> identity,
    const json& request = json::object()) {
    
    return std::make_unique<BlackBox>(identity, request);
}

/**
 * Create an EncryptedBlackBox for authentication
 */
inline std::unique_ptr<EncryptedBlackBox> createEncryptedBlackBox(
    std::shared_ptr<Identity> identity,
    const std::string& accountId,
    const std::string& gsid,
    const std::string& installationId) {
    
    return std::make_unique<EncryptedBlackBox>(identity, accountId, gsid, installationId);
}

} // namespace gfless