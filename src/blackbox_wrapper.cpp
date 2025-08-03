#include "blackbox_wrapper.h"

Napi::FunctionReference BlackBoxWrapper::constructor;

Napi::Object BlackBoxWrapper::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "BlackBox", {
        InstanceMethod("encoded", &BlackBoxWrapper::Encoded),
        StaticMethod("decode", &BlackBoxWrapper::Decode),
        StaticMethod("encodeStatic", &BlackBoxWrapper::EncodeStatic),
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("BlackBox", func);
    return exports;
}

BlackBoxWrapper::BlackBoxWrapper(const Napi::CallbackInfo& info) 
    : Napi::ObjectWrap<BlackBoxWrapper>(info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() >= 1) {
        // First parameter should be a Fingerprint wrapper
        if (info[0].IsObject()) {
            FingerprintWrapper* fpWrapper = Napi::ObjectWrap<FingerprintWrapper>::Unwrap(info[0].As<Napi::Object>());
            if (fpWrapper) {
                std::string request = "";
                if (info.Length() >= 2 && info[1].IsString()) {
                    request = info[1].As<Napi::String>().Utf8Value();
                }
                
                // We need access to the fingerprint from the wrapper
                // For now, create a new simple fingerprint
                auto fingerprint = std::make_shared<FingerprintSimple>();
                blackbox_ = std::make_shared<BlackBoxSimple>(fingerprint, request);
            }
        }
    }
    
    if (!blackbox_) {
        // Fallback: create with empty fingerprint
        auto fingerprint = std::make_shared<FingerprintSimple>();
        blackbox_ = std::make_shared<BlackBoxSimple>(fingerprint);
    }
}

Napi::Value BlackBoxWrapper::Encoded(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::String::New(env, blackbox_->encoded());
}

Napi::Value BlackBoxWrapper::Decode(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() >= 1 && info[0].IsString()) {
        std::string blackbox = info[0].As<Napi::String>().Utf8Value();
        std::string result = BlackBoxSimple::decode(blackbox);
        return Napi::String::New(env, result);
    }
    
    return env.Null();
}

Napi::Value BlackBoxWrapper::EncodeStatic(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() >= 1 && info[0].IsString()) {
        std::string data = info[0].As<Napi::String>().Utf8Value();
        std::string result = BlackBoxSimple::encodeStatic(data);
        return Napi::String::New(env, result);
    }
    
    return env.Null();
}