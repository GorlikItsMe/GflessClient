#ifndef NOSTALE_TYPES_H
#define NOSTALE_TYPES_H

#include <string>
#include <vector>
#include <map>
#include <random>
#include <chrono>
#include <cstdint>

// Basic type replacements for Qt types
using String = std::string;
using ByteArray = std::vector<uint8_t>;
using StringList = std::vector<std::string>;

// Simple JSON-like object using std::map
class JsonObject {
public:
    std::map<std::string, std::string> data;
    
    void insert(const std::string& key, const std::string& value) {
        data[key] = value;
    }
    
    std::string value(const std::string& key) const {
        auto it = data.find(key);
        return (it != data.end()) ? it->second : "";
    }
    
    bool contains(const std::string& key) const {
        return data.find(key) != data.end();
    }
    
    std::string toString() const;
    static JsonObject fromString(const std::string& json);
};

// Random number generator
class RandomGenerator {
public:
    static RandomGenerator* global() {
        static RandomGenerator instance;
        return &instance;
    }
    
    int bounded(int min, int max) {
        std::uniform_int_distribution<int> dist(min, max - 1);
        return dist(gen);
    }
    
    uint64_t bounded64(uint64_t min, uint64_t max) {
        std::uniform_int_distribution<uint64_t> dist(min, max - 1);
        return dist(gen);
    }

private:
    std::mt19937 gen{std::chrono::steady_clock::now().time_since_epoch().count()};
};

// DateTime utilities
class DateTime {
public:
    static int64_t currentMSecsSinceEpoch() {
        auto now = std::chrono::system_clock::now();
        auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch());
        return ms.count();
    }
    
    static std::string currentDateTimeISO() {
        auto now = std::chrono::system_clock::now();
        auto time_t = std::chrono::system_clock::to_time_t(now);
        auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()) % 1000;
        
        char buffer[32];
        strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%S", gmtime(&time_t));
        return std::string(buffer) + "." + std::to_string(ms.count()) + "Z";
    }
};

// Base64 encoding/decoding utilities
class Base64 {
public:
    static std::string encode(const ByteArray& data);
    static std::string encode(const std::string& data);
    static ByteArray decode(const std::string& encoded);
};

// URL encoding utilities
class Url {
public:
    static std::string toPercentEncoding(const std::string& input, const std::string& exclude = "");
    static std::string fromPercentEncoding(const std::string& input);
};

// Crypto utilities (using standard library or lightweight crypto)
class Crypto {
public:
    static std::string sha512(const std::string& input);
};

#endif // NOSTALE_TYPES_H