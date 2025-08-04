#include <napi.h>
#include "gfless/gfless.h"

class IdentityWrapper : public Napi::ObjectWrap<IdentityWrapper> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    IdentityWrapper(const Napi::CallbackInfo& info);
    
private:
    static Napi::FunctionReference constructor;
    
    // Methods
    Napi::Value Update(const Napi::CallbackInfo& info);
    Napi::Value GetFingerprint(const Napi::CallbackInfo& info);
    Napi::Value SetRequest(const Napi::CallbackInfo& info);
    
    std::shared_ptr<gfless::Identity> identity_;
};

Napi::FunctionReference IdentityWrapper::constructor;

Napi::Object IdentityWrapper::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);
    
    Napi::Function func = DefineClass(env, "Identity", {
        InstanceMethod("update", &IdentityWrapper::Update),
        InstanceMethod("getFingerprint", &IdentityWrapper::GetFingerprint),
        InstanceMethod("setRequest", &IdentityWrapper::SetRequest),
    });
    
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    
    exports.Set("Identity", func);
    return exports;
}

IdentityWrapper::IdentityWrapper(const Napi::CallbackInfo& info) 
    : Napi::ObjectWrap<IdentityWrapper>(info) {
    
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "String filePath required").ThrowAsJavaScriptException();
        return;
    }
    
    std::string filePath = info[0].As<Napi::String>();
    
    // Optional proxy parameters
    std::string proxyIp = "";
    std::string proxyPort = "";
    std::string proxyUsername = "";
    std::string proxyPassword = "";
    bool useProxy = false;
    
    if (info.Length() > 1 && info[1].IsObject()) {
        Napi::Object options = info[1].As<Napi::Object>();
        
        if (options.Has("proxyIp") && options.Get("proxyIp").IsString()) {
            proxyIp = options.Get("proxyIp").As<Napi::String>();
        }
        if (options.Has("proxyPort") && options.Get("proxyPort").IsString()) {
            proxyPort = options.Get("proxyPort").As<Napi::String>();
        }
        if (options.Has("proxyUsername") && options.Get("proxyUsername").IsString()) {
            proxyUsername = options.Get("proxyUsername").As<Napi::String>();
        }
        if (options.Has("proxyPassword") && options.Get("proxyPassword").IsString()) {
            proxyPassword = options.Get("proxyPassword").As<Napi::String>();
        }
        if (options.Has("useProxy") && options.Get("useProxy").IsBoolean()) {
            useProxy = options.Get("useProxy").As<Napi::Boolean>();
        }
    }
    
    try {
        identity_ = gfless::createIdentity(filePath, proxyIp, proxyPort, 
                                        proxyUsername, proxyPassword, useProxy);
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    }
}

Napi::Value IdentityWrapper::Update(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    try {
        identity_->update();
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
    
    return env.Undefined();
}

Napi::Value IdentityWrapper::GetFingerprint(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    try {
        gfless::json fp = identity_->getFingerprint().getJson();
        std::string fpStr = fp.dump();
        
        // Parse JSON string into JavaScript object
        Napi::Object global = env.Global();
        Napi::Object JSON = global.Get("JSON").As<Napi::Object>();
        Napi::Function parse = JSON.Get("parse").As<Napi::Function>();
        
        return parse.Call(JSON, { Napi::String::New(env, fpStr) });
        
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

Napi::Value IdentityWrapper::SetRequest(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsObject()) {
        Napi::TypeError::New(env, "Object argument required").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    try {
        // Convert JavaScript object to JSON string
        Napi::Object global = env.Global();
        Napi::Object JSON = global.Get("JSON").As<Napi::Object>();
        Napi::Function stringify = JSON.Get("stringify").As<Napi::Function>();
        
        Napi::Value jsonValue = stringify.Call(JSON, { info[0] });
        std::string jsonStr = jsonValue.As<Napi::String>();
        
        gfless::json request = gfless::json::parse(jsonStr);
        identity_->setRequest(request);
        
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
    
    return env.Undefined();
}

// Export function
Napi::Object InitIdentity(Napi::Env env, Napi::Object exports) {
    return IdentityWrapper::Init(env, exports);
}