#include "fingerprint_wrapper.h"
#include "nostale_types.h"

Napi::FunctionReference FingerprintWrapper::constructor;

Napi::Object FingerprintWrapper::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "Fingerprint", {
        InstanceMethod("getJson", &FingerprintWrapper::GetJson),
        InstanceMethod("toString", &FingerprintWrapper::ToString),
        InstanceMethod("updateVector", &FingerprintWrapper::UpdateVector),
        InstanceMethod("updateCreation", &FingerprintWrapper::UpdateCreation),
        InstanceMethod("updateServerTime", &FingerprintWrapper::UpdateServerTime),
        InstanceMethod("updateTimings", &FingerprintWrapper::UpdateTimings),
        InstanceMethod("setRequest", &FingerprintWrapper::SetRequest),
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("Fingerprint", func);
    return exports;
}

FingerprintWrapper::FingerprintWrapper(const Napi::CallbackInfo& info) 
    : Napi::ObjectWrap<FingerprintWrapper>(info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() == 0) {
        // Create new fingerprint
        fingerprint_ = std::make_shared<FingerprintSimple>();
    } else if (info.Length() >= 1) {
        // Create from existing data or with proxy config
        if (info[0].IsObject()) {
            // Parse existing fingerprint data
            JsonObject fp;
            Napi::Object obj = info[0].As<Napi::Object>();
            Napi::Array props = obj.GetPropertyNames();
            
            for (uint32_t i = 0; i < props.Length(); i++) {
                Napi::Value key = props[i];
                if (key.IsString()) {
                    std::string keyStr = key.As<Napi::String>().Utf8Value();
                    Napi::Value val = obj.Get(key);
                    if (val.IsString()) {
                        fp.insert(keyStr, val.As<Napi::String>().Utf8Value());
                    }
                }
            }
            
            // Check for proxy config in second parameter
            if (info.Length() >= 2 && info[1].IsObject()) {
                Napi::Object proxyConfig = info[1].As<Napi::Object>();
                std::string ip, port, username, password;
                bool useProxy = false;
                
                if (proxyConfig.Has("ip")) {
                    ip = proxyConfig.Get("ip").As<Napi::String>().Utf8Value();
                }
                if (proxyConfig.Has("port")) {
                    port = proxyConfig.Get("port").As<Napi::String>().Utf8Value();
                }
                if (proxyConfig.Has("username")) {
                    username = proxyConfig.Get("username").As<Napi::String>().Utf8Value();
                }
                if (proxyConfig.Has("password")) {
                    password = proxyConfig.Get("password").As<Napi::String>().Utf8Value();
                }
                if (proxyConfig.Has("useProxy")) {
                    useProxy = proxyConfig.Get("useProxy").As<Napi::Boolean>().Value();
                }
                
                fingerprint_ = std::make_shared<FingerprintSimple>(fp, ip, port, username, password, useProxy);
            } else {
                fingerprint_ = std::make_shared<FingerprintSimple>(fp);
            }
        } else {
            fingerprint_ = std::make_shared<FingerprintSimple>();
        }
    }
}

Napi::Value FingerprintWrapper::GetJson(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    JsonObject fp = fingerprint_->json();
    Napi::Object result = Napi::Object::New(env);
    
    for (const auto& pair : fp.data) {
        result.Set(pair.first, pair.second);
    }
    
    return result;
}

Napi::Value FingerprintWrapper::ToString(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::String::New(env, fingerprint_->toString());
}

Napi::Value FingerprintWrapper::UpdateVector(const Napi::CallbackInfo& info) {
    fingerprint_->updateVector();
    return info.Env().Undefined();
}

Napi::Value FingerprintWrapper::UpdateCreation(const Napi::CallbackInfo& info) {
    fingerprint_->updateCreation();
    return info.Env().Undefined();
}

Napi::Value FingerprintWrapper::UpdateServerTime(const Napi::CallbackInfo& info) {
    fingerprint_->updateServerTime();
    return info.Env().Undefined();
}

Napi::Value FingerprintWrapper::UpdateTimings(const Napi::CallbackInfo& info) {
    fingerprint_->updateTimings();
    return info.Env().Undefined();
}

Napi::Value FingerprintWrapper::SetRequest(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() >= 1 && info[0].IsString()) {
        std::string request = info[0].As<Napi::String>().Utf8Value();
        fingerprint_->setRequest(request);
    }
    
    return env.Undefined();
}