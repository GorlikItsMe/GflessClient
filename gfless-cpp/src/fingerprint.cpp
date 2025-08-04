#include "gfless/fingerprint.h"
#include "gfless/crypto_utils.h"
#include <limits>

namespace gfless {

const std::string Fingerprint::SERVER_FILE_GAME1_URL = "https://gameforge.com/tra/game1.js";

Fingerprint::Fingerprint(const json& fp,
                        const std::string& proxyIp,
                        const std::string& proxyPort,
                        const std::string& proxyUsername,
                        const std::string& proxyPassword,
                        bool useProxy)
    : fingerprint_(fp)
    , proxy_ip_(proxyIp)
    , proxy_port_(proxyPort)
    , proxy_username_(proxyUsername)
    , proxy_password_(proxyPassword)
    , use_proxy_(useProxy) {
}

json Fingerprint::getJson() const {
    return fingerprint_;
}

std::string Fingerprint::toString() const {
    return fingerprint_.dump();
}

void Fingerprint::updateVector() {
    int64_t current_time_ms = Utils::getCurrentTimeMs();
    
    // Get current vector and decode it
    std::string vector_b64 = fingerprint_["vector"].get<std::string>();
    std::string content = Utils::base64Decode(vector_b64);
    
    // Find the last space (timestamp separator)
    size_t last_space = content.rfind(' ');
    if (last_space == std::string::npos) {
        // Invalid vector format, regenerate
        fingerprint_["vector"] = generateVector();
        return;
    }
    
    // Extract old timestamp
    std::string old_time_str = content.substr(last_space + 1);
    int64_t old_time = std::stoll(old_time_str);
    content = content.substr(0, last_space);
    
    // Update vector if enough time has passed (0x3e8 = 1000ms)
    if (old_time + 1000 < current_time_ms) {
        // Shift vector left and add new random character
        content = content.substr(1) + randomAsciiCharacter();
    }
    
    // Create new vector with current timestamp
    std::string new_vector = content + " " + std::to_string(current_time_ms);
    fingerprint_["vector"] = Utils::base64Encode(new_vector);
}

void Fingerprint::updateCreation() {
    fingerprint_["creation"] = Utils::getCurrentTimeISO();
}

void Fingerprint::updateServerTime() {
    fingerprint_["serverTimeInMS"] = getServerDate();
}

void Fingerprint::updateTimings() {
    // Random delay between 150-300ms
    std::uniform_int_distribution<int> dis(150, 300);
    fingerprint_["d"] = dis(Utils::getRandomGenerator());
}

void Fingerprint::setRequest(const json& request) {
    fingerprint_["request"] = request;
}

std::string Fingerprint::generateUuid() const {
    std::string str = randomString(UUID_LENGTH);
    std::string b64 = Utils::base64Encode(str);
    
    // Convert to lowercase as in Qt version
    std::transform(b64.begin(), b64.end(), b64.begin(), ::tolower);
    
    return b64;
}

std::string Fingerprint::generateVector() const {
    std::string str = randomString(VECTOR_LENGTH);
    int64_t time = Utils::getCurrentTimeMs();
    std::string vec = str + " " + std::to_string(time);
    
    return Utils::base64Encode(vec);
}

char Fingerprint::randomAsciiCharacter() const {
    return Utils::randomAsciiChar();
}

std::string Fingerprint::randomString(size_t size) const {
    return Utils::randomString(size);
}

std::string Fingerprint::getServerDate() const {
    try {
        HttpClient client;
        
        if (use_proxy_ && !proxy_ip_.empty()) {
            int port = std::stoi(proxy_port_);
            client.setProxy(proxy_ip_, port, proxy_username_, proxy_password_);
        }
        
        std::string date = client.getServerDate(SERVER_FILE_GAME1_URL);
        if (!date.empty()) {
            // Parse date and convert to ISO format with milliseconds
            // For now, return the raw date - in a full implementation,
            // you'd parse the HTTP date format and convert to ISO
            return Utils::getCurrentTimeISO(); // Fallback to current time
        }
    } catch (const std::exception& e) {
        // Log error if needed, fallback to current time
    }
    
    return Utils::getCurrentTimeISO();
}

} // namespace gfless