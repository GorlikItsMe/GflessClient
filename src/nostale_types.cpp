#include "nostale_types.h"
#include <sstream>
#include <iomanip>
#include <algorithm>
#include <openssl/sha.h>
#include <openssl/evp.h>

// JsonObject implementation (simple key-value pairs)
std::string JsonObject::toString() const {
    std::stringstream ss;
    ss << "{";
    bool first = true;
    for (const auto& pair : data) {
        if (!first) ss << ",";
        ss << "\"" << pair.first << "\":\"" << pair.second << "\"";
        first = false;
    }
    ss << "}";
    return ss.str();
}

JsonObject JsonObject::fromString(const std::string& json) {
    JsonObject obj;
    // Very basic JSON parsing - just for demo purposes
    // In a real implementation, you'd use a proper JSON library
    size_t pos = 0;
    while ((pos = json.find("\"", pos)) != std::string::npos) {
        size_t keyStart = pos + 1;
        size_t keyEnd = json.find("\"", keyStart);
        if (keyEnd == std::string::npos) break;
        
        std::string key = json.substr(keyStart, keyEnd - keyStart);
        
        size_t valueStart = json.find("\"", keyEnd + 1);
        if (valueStart == std::string::npos) break;
        valueStart++;
        
        size_t valueEnd = json.find("\"", valueStart);
        if (valueEnd == std::string::npos) break;
        
        std::string value = json.substr(valueStart, valueEnd - valueStart);
        obj.insert(key, value);
        
        pos = valueEnd + 1;
    }
    return obj;
}

// Base64 implementation
static const std::string base64_chars = 
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "abcdefghijklmnopqrstuvwxyz"
    "0123456789+/";

std::string Base64::encode(const ByteArray& data) {
    std::string ret;
    int i = 0;
    int j = 0;
    unsigned char char_array_3[3];
    unsigned char char_array_4[4];
    
    const unsigned char* bytes_to_encode = data.data();
    int in_len = data.size();

    while (in_len--) {
        char_array_3[i++] = *(bytes_to_encode++);
        if (i == 3) {
            char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
            char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
            char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
            char_array_4[3] = char_array_3[2] & 0x3f;

            for(i = 0; (i <4) ; i++)
                ret += base64_chars[char_array_4[i]];
            i = 0;
        }
    }

    if (i) {
        for(j = i; j < 3; j++)
            char_array_3[j] = '\0';

        char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
        char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
        char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
        char_array_4[3] = char_array_3[2] & 0x3f;

        for (j = 0; (j < i + 1); j++)
            ret += base64_chars[char_array_4[j]];

        while((i++ < 3))
            ret += '=';
    }

    return ret;
}

std::string Base64::encode(const std::string& data) {
    ByteArray bytes(data.begin(), data.end());
    return encode(bytes);
}

ByteArray Base64::decode(const std::string& encoded_string) {
    int in_len = encoded_string.size();
    int i = 0;
    int j = 0;
    int in = 0;
    unsigned char char_array_4[4], char_array_3[3];
    ByteArray ret;

    auto is_base64 = [](unsigned char c) {
        return (isalnum(c) || (c == '+') || (c == '/'));
    };

    while (in_len-- && (encoded_string[in] != '=') && is_base64(encoded_string[in])) {
        char_array_4[i++] = encoded_string[in]; in++;
        if (i ==4) {
            for (i = 0; i <4; i++)
                char_array_4[i] = base64_chars.find(char_array_4[i]);

            char_array_3[0] = (char_array_4[0] << 2) + ((char_array_4[1] & 0x30) >> 4);
            char_array_3[1] = ((char_array_4[1] & 0xf) << 4) + ((char_array_4[2] & 0x3c) >> 2);
            char_array_3[2] = ((char_array_4[2] & 0x3) << 6) + char_array_4[3];

            for (i = 0; (i < 3); i++)
                ret.push_back(char_array_3[i]);
            i = 0;
        }
    }

    if (i) {
        for (j = i; j <4; j++)
            char_array_4[j] = 0;

        for (j = 0; j <4; j++)
            char_array_4[j] = base64_chars.find(char_array_4[j]);

        char_array_3[0] = (char_array_4[0] << 2) + ((char_array_4[1] & 0x30) >> 4);
        char_array_3[1] = ((char_array_4[1] & 0xf) << 4) + ((char_array_4[2] & 0x3c) >> 2);
        char_array_3[2] = ((char_array_4[2] & 0x3) << 6) + char_array_4[3];

        for (j = 0; (j < i - 1); j++) ret.push_back(char_array_3[j]);
    }

    return ret;
}

// URL encoding implementation
std::string Url::toPercentEncoding(const std::string& input, const std::string& exclude) {
    std::ostringstream escaped;
    escaped.fill('0');
    escaped << std::hex;

    for (char c : input) {
        if (isalnum(c) || c == '-' || c == '_' || c == '.' || c == '~' || 
            exclude.find(c) != std::string::npos) {
            escaped << c;
        } else {
            escaped << std::uppercase;
            escaped << '%' << std::setw(2) << int((unsigned char) c);
            escaped << std::nouppercase;
        }
    }

    return escaped.str();
}

std::string Url::fromPercentEncoding(const std::string& input) {
    std::string result;
    for (size_t i = 0; i < input.length(); ++i) {
        if (input[i] == '%' && i + 2 < input.length()) {
            int value;
            std::istringstream is(input.substr(i + 1, 2));
            is >> std::hex >> value;
            result += static_cast<char>(value);
            i += 2;
        } else {
            result += input[i];
        }
    }
    return result;
}

// Crypto implementation using OpenSSL
std::string Crypto::sha512(const std::string& input) {
    unsigned char hash[SHA512_DIGEST_LENGTH];
    SHA512_CTX sha512;
    SHA512_Init(&sha512);
    SHA512_Update(&sha512, input.c_str(), input.size());
    SHA512_Final(hash, &sha512);
    
    std::stringstream ss;
    for(int i = 0; i < SHA512_DIGEST_LENGTH; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
    }
    return ss.str();
}