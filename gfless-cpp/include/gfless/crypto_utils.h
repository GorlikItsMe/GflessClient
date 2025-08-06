#pragma once

#include "common.h"
#include <openssl/sha.h>
#include <openssl/evp.h>

namespace gfless {

class CryptoUtils {
public:
    // Hash functions
    static std::string sha512(const std::string& data);
    static std::string sha512Hex(const std::string& data);
    
    // XOR encryption (used in EncryptedBlackBox)
    static std::string xorEncrypt(const std::string& data, const std::string& key);
    static std::string xorDecrypt(const std::string& data, const std::string& key);
    
    // String to hex conversion
    static std::string toHex(const std::string& data);
    static std::string fromHex(const std::string& hex);
    
private:
    // Initialize OpenSSL (called automatically)
    static void initOpenSSL();
    static bool openssl_initialized_;
};

} // namespace gfless