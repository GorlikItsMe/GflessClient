#include "blackbox_wrapper.h"
#include <QJsonObject>
#include <QJsonDocument>
#include <QJsonArray>

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
                // Create Identity from the Fingerprint
                identity_ = std::make_shared<Identity>();
                
                QJsonValue request;
                if (info.Length() >= 2 && info[1].IsString()) {
                    QString requestStr = QString::fromStdString(info[1].As<Napi::String>().Utf8Value());
                    QJsonDocument doc = QJsonDocument::fromJson(requestStr.toUtf8());
                    request = doc.object();
                }
                
                blackbox_ = std::make_unique<BlackBox>(identity_, request);
            }
        }
    }
    
    if (!blackbox_) {
        // Fallback: create with empty identity
        identity_ = std::make_shared<Identity>();
        blackbox_ = std::make_unique<BlackBox>(identity_, QJsonValue());
    }
}

Napi::Value BlackBoxWrapper::Encoded(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::String::New(env, blackbox_->encoded().toStdString());
}

Napi::Value BlackBoxWrapper::Decode(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() >= 1 && info[0].IsString()) {
        QString blackboxStr = QString::fromStdString(info[0].As<Napi::String>().Utf8Value());
        QByteArray result = BlackBox::decode(blackboxStr.toUtf8());
        return Napi::String::New(env, result.toStdString());
    }
    
    return env.Null();
}

Napi::Value BlackBoxWrapper::EncodeStatic(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() >= 1 && info[0].IsString()) {
        QString dataStr = QString::fromStdString(info[0].As<Napi::String>().Utf8Value());
        QByteArray result = BlackBox::encode(dataStr.toUtf8());
        return Napi::String::New(env, result.toStdString());
    }
    
    return env.Null();
}