#ifndef FINGERPRINT_WRAPPER_H
#define FINGERPRINT_WRAPPER_H

#include <napi.h>
#include "fingerprint.h" // Original Qt-based class
#include <memory>
#include <QJsonObject>
#include <QJsonDocument>

class FingerprintWrapper : public Napi::ObjectWrap<FingerprintWrapper> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    FingerprintWrapper(const Napi::CallbackInfo& info);

    // Access to the underlying Qt object
    Fingerprint* getFingerprint() { return fingerprint_.get(); }

private:
    static Napi::FunctionReference constructor;
    
    // Instance methods
    Napi::Value GetJson(const Napi::CallbackInfo& info);
    Napi::Value ToString(const Napi::CallbackInfo& info);
    Napi::Value UpdateVector(const Napi::CallbackInfo& info);
    Napi::Value UpdateCreation(const Napi::CallbackInfo& info);
    Napi::Value UpdateServerTime(const Napi::CallbackInfo& info);
    Napi::Value UpdateTimings(const Napi::CallbackInfo& info);
    Napi::Value SetRequest(const Napi::CallbackInfo& info);
    
    std::unique_ptr<Fingerprint> fingerprint_;
};

#endif // FINGERPRINT_WRAPPER_H