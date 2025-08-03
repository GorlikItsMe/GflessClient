#ifndef BLACKBOX_WRAPPER_H
#define BLACKBOX_WRAPPER_H

#include <napi.h>
#include "blackbox.h" // Original Qt-based class
#include "identity.h" 
#include "fingerprint_wrapper.h"
#include <memory>
#include <QJsonObject>
#include <QJsonDocument>

class BlackBoxWrapper : public Napi::ObjectWrap<BlackBoxWrapper> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    BlackBoxWrapper(const Napi::CallbackInfo& info);

private:
    static Napi::FunctionReference constructor;
    
    // Instance methods
    Napi::Value Encoded(const Napi::CallbackInfo& info);
    
    // Static methods
    static Napi::Value Decode(const Napi::CallbackInfo& info);
    static Napi::Value EncodeStatic(const Napi::CallbackInfo& info);
    
    std::unique_ptr<BlackBox> blackbox_;
    std::shared_ptr<Identity> identity_;
};

#endif // BLACKBOX_WRAPPER_H