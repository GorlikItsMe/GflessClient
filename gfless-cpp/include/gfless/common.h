#pragma once

#include <string>
#include <vector>
#include <memory>
#include <chrono>
#include <random>
#include <map>
#include <fstream>
#include <sstream>
#include <iomanip>
#include <nlohmann/json.hpp>

namespace gfless {

using json = nlohmann::json;

// Common types
using TimePoint = std::chrono::system_clock::time_point;
using Milliseconds = std::chrono::milliseconds;

// Utility functions
class Utils {
public:
    static std::string getCurrentTimeISO();
    static int64_t getCurrentTimeMs();
    static std::string randomString(size_t length);
    static char randomAsciiChar();
    static std::string urlEncode(const std::string& value);
    static std::string urlDecode(const std::string& value);
    static std::string base64Encode(const std::string& data);
    static std::string base64Decode(const std::string& data);
    
    // Public access to random generator for other classes
    static std::mt19937& getRandomGenerator() { return gen_; }
    
private:
    static std::random_device rd_;
    static std::mt19937 gen_;
    static std::uniform_int_distribution<> ascii_dis_;
};

} // namespace gfless