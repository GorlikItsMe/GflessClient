#include <napi.h>
#include "gfless/gfless.h"

// Forward declarations
Napi::Object InitIdentity(Napi::Env env, Napi::Object exports);
Napi::Object InitBlackBox(Napi::Env env, Napi::Object exports);
Napi::Object InitUtils(Napi::Env env, Napi::Object exports);

// Utility functions
Napi::Value EncodeBlackBox(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "String argument required").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    std::string data = info[0].As<Napi::String>();
    std::string encoded = gfless::BlackBox::encode(data);
    
    return Napi::String::New(env, encoded);
}

Napi::Value DecodeBlackBox(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "String argument required").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    std::string encoded = info[0].As<Napi::String>();
    std::string decoded = gfless::BlackBox::decode(encoded);
    
    return Napi::String::New(env, decoded);
}

Napi::Value GetVersion(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::String::New(env, gfless::VERSION);
}

// Module initialization
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    // Export static functions
    exports.Set("encodeBlackBox", Napi::Function::New(env, EncodeBlackBox));
    exports.Set("decodeBlackBox", Napi::Function::New(env, DecodeBlackBox));
    exports.Set("getVersion", Napi::Function::New(env, GetVersion));
    
    // Initialize class wrappers
    InitIdentity(env, exports);
    InitBlackBox(env, exports);
    InitUtils(env, exports);
    
    return exports;
}

NODE_API_MODULE(gfless, Init)