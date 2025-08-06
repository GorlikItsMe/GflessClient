#include "gfless/crypto_utils.h"
#include <openssl/sha.h>
#include <openssl/evp.h>
#include <openssl/err.h>
#include <stdexcept>

namespace gfless {

bool CryptoUtils::openssl_initialized_ = false;

void CryptoUtils::initOpenSSL() {
    if (!openssl_initialized_) {
        OpenSSL_add_all_algorithms();
        ERR_load_crypto_strings();
        openssl_initialized_ = true;
    }
}

std::string CryptoUtils::sha512(const std::string& data) {
    initOpenSSL();
    
    unsigned char hash[SHA512_DIGEST_LENGTH];
    SHA512_CTX sha512_ctx;
    
    if (SHA512_Init(&sha512_ctx) != 1) {
        throw std::runtime_error("Failed to initialize SHA512 context");
    }
    
    if (SHA512_Update(&sha512_ctx, data.c_str(), data.length()) != 1) {
        throw std::runtime_error("Failed to update SHA512 hash");
    }
    
    if (SHA512_Final(hash, &sha512_ctx) != 1) {
        throw std::runtime_error("Failed to finalize SHA512 hash");
    }
    
    return std::string(reinterpret_cast<char*>(hash), SHA512_DIGEST_LENGTH);
}

std::string CryptoUtils::sha512Hex(const std::string& data) {
    std::string hash = sha512(data);
    return toHex(hash);
}

std::string CryptoUtils::xorEncrypt(const std::string& data, const std::string& key) {
    if (key.empty()) {
        throw std::invalid_argument("Key cannot be empty");
    }
    
    std::string result;
    result.reserve(data.length());
    
    for (size_t i = 0; i < data.length(); ++i) {
        size_t key_index = i % key.length();
        size_t reverse_key_index = key.length() - key_index - 1;
        
        char encrypted_char = data[i] ^ key[key_index] ^ key[reverse_key_index];
        result.push_back(encrypted_char);
    }
    
    return result;
}

std::string CryptoUtils::xorDecrypt(const std::string& data, const std::string& key) {
    // XOR encryption is symmetric, so decryption is the same as encryption
    return xorEncrypt(data, key);
}

std::string CryptoUtils::toHex(const std::string& data) {
    std::stringstream ss;
    ss << std::hex << std::setfill('0');
    
    for (unsigned char c : data) {
        ss << std::setw(2) << static_cast<int>(c);
    }
    
    return ss.str();
}

std::string CryptoUtils::fromHex(const std::string& hex) {
    if (hex.length() % 2 != 0) {
        throw std::invalid_argument("Invalid hex string length");
    }
    
    std::string result;
    result.reserve(hex.length() / 2);
    
    for (size_t i = 0; i < hex.length(); i += 2) {
        std::string byte_str = hex.substr(i, 2);
        char byte = static_cast<char>(std::stoi(byte_str, nullptr, 16));
        result.push_back(byte);
    }
    
    return result;
}

} // namespace gfless