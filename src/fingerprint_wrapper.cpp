#include "fingerprint_wrapper.h"
#include <QCoreApplication>
#include <QJsonObject>
#include <QJsonDocument>

Napi::FunctionReference FingerprintWrapper::constructor;

// Ensure Qt Application is initialized
static QCoreApplication* ensureQtApp() {
    static QCoreApplication* app = nullptr;
    if (!app) {
        static int argc = 1;
        static char appName[] = "nostale_auth";
        static char* argv[] = { appName, nullptr };
        app = new QCoreApplication(argc, argv);
    }
    return app;
}

Napi::Object FingerprintWrapper::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    // Initialize Qt Application
    ensureQtApp();

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
        // Create new fingerprint with default parameters
        fingerprint_ = std::make_unique<Fingerprint>();
    } else if (info.Length() >= 1) {
        // Create from existing data or with proxy config
        if (info[0].IsObject()) {
            // Parse existing fingerprint data
            QJsonObject fp;
            Napi::Object obj = info[0].As<Napi::Object>();
            Napi::Array props = obj.GetPropertyNames();
            
            for (uint32_t i = 0; i < props.Length(); i++) {
                Napi::Value key = props[i];
                if (key.IsString()) {
                    QString keyStr = QString::fromStdString(key.As<Napi::String>().Utf8Value());
                    Napi::Value val = obj.Get(key);
                    if (val.IsString()) {
                        fp[keyStr] = QString::fromStdString(val.As<Napi::String>().Utf8Value());
                    } else if (val.IsNumber()) {
                        fp[keyStr] = val.As<Napi::Number>().DoubleValue();
                    } else if (val.IsBoolean()) {
                        fp[keyStr] = val.As<Napi::Boolean>().Value();
                    }
                }
            }
            
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
            
            fingerprint_ = std::make_unique<Fingerprint>(fp, proxyIp, proxyPort, proxyUsername, proxyPassword, useProxy);
        } else {
            fingerprint_ = std::make_unique<Fingerprint>();
        }
    }
}

Napi::Value FingerprintWrapper::GetJson(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    QJsonObject fp = fingerprint_->json();
    Napi::Object result = Napi::Object::New(env);
    
    for (auto it = fp.begin(); it != fp.end(); ++it) {
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

Napi::Value FingerprintWrapper::ToString(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::String::New(env, fingerprint_->toString().toStdString());
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
        QString request = QString::fromStdString(info[0].As<Napi::String>().Utf8Value());
        QJsonDocument doc = QJsonDocument::fromJson(request.toUtf8());
        fingerprint_->setRequest(doc.object());
    }
    
    return env.Undefined();
}