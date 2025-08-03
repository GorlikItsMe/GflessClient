#include "identity_wrapper.h"
#include <QJsonObject>
#include <QJsonDocument>

Napi::FunctionReference IdentityWrapper::constructor;

Napi::Object IdentityWrapper::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "Identity", {
        InstanceMethod("update", &IdentityWrapper::Update),
        InstanceMethod("getFingerprint", &IdentityWrapper::GetFingerprint),
        InstanceMethod("setRequest", &IdentityWrapper::SetRequest),
        InstanceMethod("save", &IdentityWrapper::Save),
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

    if (info.Length() >= 1 && info[0].IsString()) {
        // Create with file path
        QString filePath = QString::fromStdString(info[0].As<Napi::String>().Utf8Value());
        
        // Check for proxy config in second parameter
        QString proxyIp, proxyPort, proxyUsername, proxyPassword;
        bool useProxy = false;
        
        if (info.Length() >= 2 && info[1].IsObject()) {
            Napi::Object proxyConfig = info[1].As<Napi::Object>();
            
            if (proxyConfig.Has("ip")) {
                proxyIp = QString::fromStdString(proxyConfig.Get("ip").As<Napi::String>().Utf8Value());
            }
            if (proxyConfig.Has("port")) {
                proxyPort = QString::fromStdString(proxyConfig.Get("port").As<Napi::String>().Utf8Value());
            }
            if (proxyConfig.Has("username")) {
                proxyUsername = QString::fromStdString(proxyConfig.Get("username").As<Napi::String>().Utf8Value());
            }
            if (proxyConfig.Has("password")) {
                proxyPassword = QString::fromStdString(proxyConfig.Get("password").As<Napi::String>().Utf8Value());
            }
            if (proxyConfig.Has("useProxy")) {
                useProxy = proxyConfig.Get("useProxy").As<Napi::Boolean>().Value();
            }
        }
        
        identity_ = std::make_shared<Identity>(filePath, proxyIp, proxyPort, proxyUsername, proxyPassword, useProxy);
    } else {
        // Create with default parameters
        identity_ = std::make_shared<Identity>();
    }
}

Napi::Value IdentityWrapper::Update(const Napi::CallbackInfo& info) {
    identity_->update();
    return info.Env().Undefined();
}

Napi::Value IdentityWrapper::GetFingerprint(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    Fingerprint fp = identity_->getFingerprint();
    QJsonObject fpJson = fp.json();
    
    Napi::Object result = Napi::Object::New(env);
    
    for (auto it = fpJson.begin(); it != fpJson.end(); ++it) {
        QString key = it.key();
        QJsonValue value = it.value();
        
        if (value.isString()) {
            result.Set(key.toStdString(), value.toString().toStdString());
        } else if (value.isDouble()) {
            result.Set(key.toStdString(), value.toDouble());
        } else if (value.isBool()) {
            result.Set(key.toStdString(), value.toBool());
        } else if (value.isArray() || value.isObject()) {
            // Convert to JSON string for complex types
            QJsonDocument doc(value.isArray() ? QJsonDocument(value.toArray()) : QJsonDocument(value.toObject()));
            result.Set(key.toStdString(), doc.toJson(QJsonDocument::Compact).toStdString());
        }
    }
    
    return result;
}

Napi::Value IdentityWrapper::SetRequest(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() >= 1 && info[0].IsString()) {
        QString request = QString::fromStdString(info[0].As<Napi::String>().Utf8Value());
        QJsonDocument doc = QJsonDocument::fromJson(request.toUtf8());
        identity_->setRequest(doc.object());
    }
    
    return env.Undefined();
}

Napi::Value IdentityWrapper::Save(const Napi::CallbackInfo& info) {
    // Identity saves automatically in destructor, but we can force save here
    // Note: The original Identity class saves in its destructor
    return info.Env().Undefined();
}