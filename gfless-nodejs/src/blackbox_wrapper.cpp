#include <napi.h>
#include "gfless/gfless.h"

class BlackBoxWrapper : public Napi::ObjectWrap<BlackBoxWrapper> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    BlackBoxWrapper(const Napi::CallbackInfo& info);
    
private:
    static Napi::FunctionReference constructor;
    
    // Methods
    Napi::Value Encoded(const Napi::CallbackInfo& info);
    
    std::unique_ptr<gfless::BlackBox> blackbox_;
};

class EncryptedBlackBoxWrapper : public Napi::ObjectWrap<EncryptedBlackBoxWrapper> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    EncryptedBlackBoxWrapper(const Napi::CallbackInfo& info);
    
private:
    static Napi::FunctionReference constructor;
    
    // Methods
    Napi::Value Encrypted(const Napi::CallbackInfo& info);
    
    std::unique_ptr<gfless::EncryptedBlackBox> encryptedBlackbox_;
};

// BlackBox implementation
Napi::FunctionReference BlackBoxWrapper::constructor;

Napi::Object BlackBoxWrapper::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);
    
    Napi::Function func = DefineClass(env, "BlackBox", {
        InstanceMethod("encoded", &BlackBoxWrapper::Encoded),
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
    
    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Identity argument required").ThrowAsJavaScriptException();
        return;
    }
    
    // Extract identity from wrapper
    if (!info[0].IsObject()) {
        Napi::TypeError::New(env, "Identity object required").ThrowAsJavaScriptException();
        return;
    }
    
    // For now, we'll assume the identity is passed as an external reference
    // In a full implementation, you'd need to extract the Identity from the wrapper
    // This is simplified for the example
    
    try {
        gfless::json request = gfless::json::object();
        if (info.Length() > 1 && info[1].IsObject()) {
            // Convert JS object to JSON
            Napi::Object global = env.Global();
            Napi::Object JSON = global.Get("JSON").As<Napi::Object>();
            Napi::Function stringify = JSON.Get("stringify").As<Napi::Function>();
            
            Napi::Value jsonValue = stringify.Call(JSON, { info[1] });
            std::string jsonStr = jsonValue.As<Napi::String>();
            request = gfless::json::parse(jsonStr);
        }
        
        // Note: This is simplified - in reality you'd need to extract the C++ Identity
        // from the JavaScript wrapper object
        
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    }
}

Napi::Value BlackBoxWrapper::Encoded(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    try {
        std::string encoded = blackbox_->encoded();
        return Napi::String::New(env, encoded);
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

// EncryptedBlackBox implementation
Napi::FunctionReference EncryptedBlackBoxWrapper::constructor;

Napi::Object EncryptedBlackBoxWrapper::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);
    
    Napi::Function func = DefineClass(env, "EncryptedBlackBox", {
        InstanceMethod("encrypted", &EncryptedBlackBoxWrapper::Encrypted),
    });
    
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    
    exports.Set("EncryptedBlackBox", func);
    return exports;
}

EncryptedBlackBoxWrapper::EncryptedBlackBoxWrapper(const Napi::CallbackInfo& info) 
    : Napi::ObjectWrap<EncryptedBlackBoxWrapper>(info) {
    
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    
    if (info.Length() < 4 || !info[1].IsString() || !info[2].IsString() || !info[3].IsString()) {
        Napi::TypeError::New(env, "Identity, accountId, gsid, and installationId required").ThrowAsJavaScriptException();
        return;
    }
    
    std::string accountId = info[1].As<Napi::String>();
    std::string gsid = info[2].As<Napi::String>();
    std::string installationId = info[3].As<Napi::String>();
    
    try {
        // Note: This is simplified - in reality you'd need to extract the C++ Identity
        // from the JavaScript wrapper object
        
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    }
}

Napi::Value EncryptedBlackBoxWrapper::Encrypted(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    try {
        std::string encrypted = encryptedBlackbox_->encrypted();
        return Napi::String::New(env, encrypted);
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

// Export function
Napi::Object InitBlackBox(Napi::Env env, Napi::Object exports) {
    BlackBoxWrapper::Init(env, exports);
    EncryptedBlackBoxWrapper::Init(env, exports);
    return exports;
}