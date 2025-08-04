#include <napi.h>
#include "gfless/gfless.h"

// Utility function wrappers
Napi::Value GetCurrentTimeISO(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    try {
        std::string time = gfless::Utils::getCurrentTimeISO();
        return Napi::String::New(env, time);
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

Napi::Value GetCurrentTimeMs(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    try {
        int64_t time = gfless::Utils::getCurrentTimeMs();
        return Napi::Number::New(env, static_cast<double>(time));
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

Napi::Value RandomString(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Number argument required").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    try {
        size_t length = info[0].As<Napi::Number>().Uint32Value();
        std::string random = gfless::Utils::randomString(length);
        return Napi::String::New(env, random);
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

Napi::Value Base64Encode(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "String argument required").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    try {
        std::string data = info[0].As<Napi::String>();
        std::string encoded = gfless::Utils::base64Encode(data);
        return Napi::String::New(env, encoded);
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

Napi::Value Base64Decode(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "String argument required").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    try {
        std::string encoded = info[0].As<Napi::String>();
        std::string decoded = gfless::Utils::base64Decode(encoded);
        return Napi::String::New(env, decoded);
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

Napi::Value UrlEncode(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "String argument required").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    try {
        std::string data = info[0].As<Napi::String>();
        std::string encoded = gfless::Utils::urlEncode(data);
        return Napi::String::New(env, encoded);
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

Napi::Value UrlDecode(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "String argument required").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    try {
        std::string encoded = info[0].As<Napi::String>();
        std::string decoded = gfless::Utils::urlDecode(encoded);
        return Napi::String::New(env, decoded);
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

// Crypto utility wrappers
Napi::Value SHA512Hex(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "String argument required").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    try {
        std::string data = info[0].As<Napi::String>();
        std::string hash = gfless::CryptoUtils::sha512Hex(data);
        return Napi::String::New(env, hash);
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

Napi::Value XOREncrypt(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 2 || !info[0].IsString() || !info[1].IsString()) {
        Napi::TypeError::New(env, "Two string arguments required").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    try {
        std::string data = info[0].As<Napi::String>();
        std::string key = info[1].As<Napi::String>();
        std::string encrypted = gfless::CryptoUtils::xorEncrypt(data, key);
        return Napi::String::New(env, encrypted);
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

// Export function
Napi::Object InitUtils(Napi::Env env, Napi::Object exports) {
    // Create Utils object
    Napi::Object utils = Napi::Object::New(env);
    
    utils.Set("getCurrentTimeISO", Napi::Function::New(env, GetCurrentTimeISO));
    utils.Set("getCurrentTimeMs", Napi::Function::New(env, GetCurrentTimeMs));
    utils.Set("randomString", Napi::Function::New(env, RandomString));
    utils.Set("base64Encode", Napi::Function::New(env, Base64Encode));
    utils.Set("base64Decode", Napi::Function::New(env, Base64Decode));
    utils.Set("urlEncode", Napi::Function::New(env, UrlEncode));
    utils.Set("urlDecode", Napi::Function::New(env, UrlDecode));
    
    exports.Set("Utils", utils);
    
    // Create Crypto object
    Napi::Object crypto = Napi::Object::New(env);
    
    crypto.Set("sha512Hex", Napi::Function::New(env, SHA512Hex));
    crypto.Set("xorEncrypt", Napi::Function::New(env, XOREncrypt));
    
    exports.Set("Crypto", crypto);
    
    return exports;
}