#ifndef FINGERPRINT_SIMPLE_H
#define FINGERPRINT_SIMPLE_H

#include "nostale_types.h"
#include <memory>

class FingerprintSimple {
public:
    FingerprintSimple();
    FingerprintSimple(const JsonObject& fp, const std::string& proxyIp = "", 
                     const std::string& proxyPort = "", const std::string& proxyUsername = "",
                     const std::string& proxyPassword = "", bool useProxy = false);

    JsonObject json() const;
    std::string toString() const;

    void updateVector();
    void updateCreation();
    void updateServerTime();
    void updateTimings();
    void setRequest(const std::string& request);

private:
    static const int VERSION = 7;
    static const int UUID_LENGTH = 27;
    static const int VECTOR_LENGTH = 100;
    static const std::string SERVER_FILE_GAME1_FILE;

    JsonObject fingerprint;
    std::string ip;
    std::string port;
    std::string username;
    std::string password;
    bool proxy;

    std::string generateUuid() const;
    std::string generateVector() const;
    char randomAsciiCharacter() const;
    std::string randomString(int size) const;
    std::string getServerDate() const;
    void initializeFingerprint();
};

#endif // FINGERPRINT_SIMPLE_H