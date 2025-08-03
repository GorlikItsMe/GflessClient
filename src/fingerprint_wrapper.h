#ifndef FINGERPRINT_WRAPPER_H
#define FINGERPRINT_WRAPPER_H

#include <napi.h>
#include "fingerprint_simple.h"
#include <memory>

class FingerprintWrapper : public Napi::ObjectWrap<FingerprintWrapper> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    FingerprintWrapper(const Napi::CallbackInfo& info);

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
    
    std::shared_ptr<FingerprintSimple> fingerprint_;
};

#endif // FINGERPRINT_WRAPPER_H