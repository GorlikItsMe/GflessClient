#ifndef IDENTITY_WRAPPER_H
#define IDENTITY_WRAPPER_H

#include <napi.h>
#include "identity.h" // Original Qt-based class
#include "fingerprint_wrapper.h"
#include <memory>
#include <QJsonObject>
#include <QJsonDocument>

class IdentityWrapper : public Napi::ObjectWrap<IdentityWrapper> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    IdentityWrapper(const Napi::CallbackInfo& info);

    // Access to the underlying Qt object
    std::shared_ptr<Identity> getIdentity() { return identity_; }

private:
    static Napi::FunctionReference constructor;
    
    // Instance methods
    Napi::Value Update(const Napi::CallbackInfo& info);
    Napi::Value GetFingerprint(const Napi::CallbackInfo& info);
    Napi::Value SetRequest(const Napi::CallbackInfo& info);
    Napi::Value Save(const Napi::CallbackInfo& info);
    
    std::shared_ptr<Identity> identity_;
};

#endif // IDENTITY_WRAPPER_H