#include "fingerprint_simple.h"
#include <fstream>
#include <sstream>
#include <curl/curl.h>

const std::string FingerprintSimple::SERVER_FILE_GAME1_FILE = "https://gameforge.com/tra/game1.js";

// Callback function for curl to write response data
static size_t WriteCallback(void *contents, size_t size, size_t nmemb, void *userp) {
    ((std::string*)userp)->append((char*)contents, size * nmemb);
    return size * nmemb;
}

FingerprintSimple::FingerprintSimple()
    : proxy(false) {
    initializeFingerprint();
}

FingerprintSimple::FingerprintSimple(const JsonObject& fp, const std::string& proxyIp,
                                   const std::string& proxyPort, const std::string& proxyUsername,
                                   const std::string& proxyPassword, bool useProxy)
    : fingerprint(fp), ip(proxyIp), port(proxyPort), username(proxyUsername),
      password(proxyPassword), proxy(useProxy) {
    if (fingerprint.data.empty()) {
        initializeFingerprint();
    }
}

void FingerprintSimple::initializeFingerprint() {
    fingerprint.insert("v", std::to_string(VERSION));
    fingerprint.insert("tz", std::to_string(-DateTime::currentMSecsSinceEpoch() % 1000)); // Simple timezone offset
    fingerprint.insert("osType", "Windows");
    fingerprint.insert("app", "GflessClient");
    fingerprint.insert("vendor", "Gameforge");
    fingerprint.insert("mem", std::to_string(RandomGenerator::global()->bounded(2048, 6144)));
    fingerprint.insert("con", "1");
    fingerprint.insert("lang", "en-US");
    fingerprint.insert("plugins", "[]");
    fingerprint.insert("gpu", "Generic GPU");
    fingerprint.insert("fonts", "[]");
    fingerprint.insert("audioC", "2");
    fingerprint.insert("width", "1920");
    fingerprint.insert("height", "1080");
    fingerprint.insert("video", "mp4");
    fingerprint.insert("audio", "ogg");
    fingerprint.insert("media", "true");
    fingerprint.insert("permissions", "{}");
    fingerprint.insert("audioFP", randomString(20));
    fingerprint.insert("webglFP", randomString(20));
    fingerprint.insert("canvasFP", randomString(20));
    fingerprint.insert("creation", DateTime::currentDateTimeISO());
    fingerprint.insert("uuid", generateUuid());
    fingerprint.insert("d", std::to_string(RandomGenerator::global()->bounded(150, 300)));
    fingerprint.insert("osVersion", "10.0");
    fingerprint.insert("vector", generateVector());
    fingerprint.insert("userAgent", "GflessClient/" + std::to_string(VERSION));
    fingerprint.insert("serverTimeInMS", "");
    fingerprint.insert("request", "");
}

JsonObject FingerprintSimple::json() const {
    return fingerprint;
}

std::string FingerprintSimple::toString() const {
    return fingerprint.toString();
}

void FingerprintSimple::updateVector() {
    int64_t currentTimeMs = DateTime::currentMSecsSinceEpoch();
    std::string vectorBase64 = fingerprint.value("vector");
    
    ByteArray content = Base64::decode(vectorBase64);
    std::string contentStr(content.begin(), content.end());
    
    size_t lastBlankIndex = contentStr.find_last_of(' ');
    if (lastBlankIndex != std::string::npos) {
        int64_t oldTime = std::stoll(contentStr.substr(lastBlankIndex + 1));
        std::string vectorContent = contentStr.substr(0, lastBlankIndex);
        
        if (oldTime + 0x3e8 < currentTimeMs) {
            vectorContent = vectorContent.substr(1) + randomAsciiCharacter();
        }
        
        std::string newVector = vectorContent + " " + std::to_string(currentTimeMs);
        fingerprint.insert("vector", Base64::encode(newVector));
    }
}

void FingerprintSimple::updateCreation() {
    fingerprint.insert("creation", DateTime::currentDateTimeISO());
}

void FingerprintSimple::updateServerTime() {
    fingerprint.insert("serverTimeInMS", getServerDate());
}

void FingerprintSimple::updateTimings() {
    fingerprint.insert("d", std::to_string(RandomGenerator::global()->bounded(150, 300)));
}

void FingerprintSimple::setRequest(const std::string& request) {
    fingerprint.insert("request", request);
}

std::string FingerprintSimple::generateUuid() const {
    std::string str = randomString(UUID_LENGTH);
    std::string base64 = Base64::encode(str);
    std::transform(base64.begin(), base64.end(), base64.begin(), ::tolower);
    return base64;
}

std::string FingerprintSimple::generateVector() const {
    std::string str = randomString(VECTOR_LENGTH);
    int64_t time = DateTime::currentMSecsSinceEpoch();
    std::string vec = str + " " + std::to_string(time);
    return Base64::encode(vec);
}

char FingerprintSimple::randomAsciiCharacter() const {
    return RandomGenerator::global()->bounded(32, 126);
}

std::string FingerprintSimple::randomString(int size) const {
    std::string str;
    for (int i = 0; i < size; ++i) {
        str += randomAsciiCharacter();
    }
    return str;
}

std::string FingerprintSimple::getServerDate() const {
    CURL *curl;
    CURLcode res;
    std::string readBuffer;
    std::string dateHeader;

    curl = curl_easy_init();
    if(curl) {
        curl_easy_setopt(curl, CURLOPT_URL, SERVER_FILE_GAME1_FILE.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
        curl_easy_setopt(curl, CURLOPT_NOBODY, 1L); // HEAD request only
        curl_easy_setopt(curl, CURLOPT_TIMEOUT, 5L);
        
        // Proxy configuration
        if (proxy && !ip.empty()) {
            std::string proxyUrl = ip + ":" + port;
            curl_easy_setopt(curl, CURLOPT_PROXY, proxyUrl.c_str());
            curl_easy_setopt(curl, CURLOPT_PROXYTYPE, CURLPROXY_SOCKS5);
            
            if (!username.empty()) {
                std::string userpass = username + ":" + password;
                curl_easy_setopt(curl, CURLOPT_PROXYUSERPWD, userpass.c_str());
            }
        }
        
        struct curl_slist *headers = nullptr;
        res = curl_easy_perform(curl);
        
        if (res == CURLE_OK) {
            char *date;
            res = curl_easy_getinfo(curl, CURLINFO_FILETIME, &date);
            if (res == CURLE_OK && date) {
                // Convert timestamp to ISO format
                time_t rawtime = (time_t)date;
                struct tm * timeinfo = gmtime(&rawtime);
                char buffer[32];
                strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%S.000Z", timeinfo);
                dateHeader = buffer;
            }
        }
        
        curl_easy_cleanup(curl);
    }
    
    // Fallback to current time if request fails
    if (dateHeader.empty()) {
        dateHeader = DateTime::currentDateTimeISO();
    }
    
    return dateHeader;
}