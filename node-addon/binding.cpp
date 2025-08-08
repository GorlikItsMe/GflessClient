#include <napi.h>
#include <memory>
#include <QString>
#include <QCoreApplication>

#include "nostaleauth.h"

namespace {

class QtCoreApp {
public:
  static void ensure() {
    if (app_) return;
    static char name[] = "gfless";
    static char* argv[] = { name };
    static int argc = 1;
    app_ = new QCoreApplication(argc, argv);
  }
private:
  static QCoreApplication* app_;
};

QCoreApplication* QtCoreApp::app_ = nullptr;

class AuthWrapper : public Napi::ObjectWrap<AuthWrapper> {
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports) {
    Napi::Function func = DefineClass(env, "Auth", {
      InstanceMethod("authenticate", &AuthWrapper::Authenticate),
      InstanceMethod("getAccounts", &AuthWrapper::GetAccounts),
      InstanceMethod("getToken", &AuthWrapper::GetToken),
      InstanceMethod("setToken", &AuthWrapper::SetToken),
      InstanceMethod("getInstallationId", &AuthWrapper::GetInstallationId)
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("createAuth", Napi::Function::New(env, &AuthWrapper::Create));
    return exports;
  }

  AuthWrapper(const Napi::CallbackInfo& info) : Napi::ObjectWrap<AuthWrapper>(info) {}

  static Napi::Value Create(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    QtCoreApp::ensure();

    if (info.Length() < 1 || !info[0].IsObject()) {
      Napi::TypeError::New(env, "options object required").ThrowAsJavaScriptException();
      return env.Null();
    }

    Napi::Object opts = info[0].As<Napi::Object>();

    QString identityPath = QString::fromUtf8(opts.Get("identityPath").ToString().Utf8Value().c_str());
    QString installationId = QString::fromUtf8(opts.Get("installationId").ToString().Utf8Value().c_str());

    bool proxyEnabled = false;
    QString proxyHost, proxyPort, proxyUser, proxyPass;

    if (opts.Has("proxy") && opts.Get("proxy").IsObject()) {
      Napi::Object p = opts.Get("proxy").As<Napi::Object>();
      if (p.Has("enabled")) proxyEnabled = p.Get("enabled").ToBoolean();
      if (p.Has("host")) proxyHost = QString::fromUtf8(p.Get("host").ToString().Utf8Value().c_str());
      if (p.Has("port")) proxyPort = QString::fromUtf8(p.Get("port").ToString().Utf8Value().c_str());
      if (p.Has("username")) proxyUser = QString::fromUtf8(p.Get("username").ToString().Utf8Value().c_str());
      if (p.Has("password")) proxyPass = QString::fromUtf8(p.Get("password").ToString().Utf8Value().c_str());
    }

    Napi::Object self = constructor.New({});
    AuthWrapper* aw = Napi::ObjectWrap<AuthWrapper>::Unwrap(self);
    aw->auth_.reset(new NostaleAuth(identityPath, installationId, proxyEnabled, proxyHost, proxyPort, proxyUser, proxyPass));

    return self;
  }

private:
  Napi::Value Authenticate(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 2) {
      Napi::TypeError::New(env, "email and password required").ThrowAsJavaScriptException();
      return env.Null();
    }
    QString email = QString::fromUtf8(info[0].ToString().Utf8Value().c_str());
    QString password = QString::fromUtf8(info[1].ToString().Utf8Value().c_str());

    bool captcha = false;
    bool wrong = false;
    QString gfChallengeId;

    bool ok = auth_->authenticate(email, password, captcha, gfChallengeId, wrong);

    Napi::Object res = Napi::Object::New(env);
    res.Set("ok", Napi::Boolean::New(env, ok));
    res.Set("captcha", Napi::Boolean::New(env, captcha));
    res.Set("gfChallengeId", Napi::String::New(env, gfChallengeId.toStdString()));
    res.Set("wrongCredentials", Napi::Boolean::New(env, wrong));
    return res;
  }

  Napi::Value GetAccounts(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    QMap<QString, QString> accs = auth_->getAccounts();
    Napi::Object obj = Napi::Object::New(env);
    for (auto it = accs.constBegin(); it != accs.constEnd(); ++it) {
      obj.Set(Napi::String::New(env, it.key().toStdString()), Napi::String::New(env, it.value().toStdString()));
    }
    return obj;
  }

  Napi::Value GetToken(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1) {
      Napi::TypeError::New(env, "accountId required").ThrowAsJavaScriptException();
      return env.Null();
    }
    QString accountId = QString::fromUtf8(info[0].ToString().Utf8Value().c_str());
    QString token = auth_->getToken(accountId);
    return Napi::String::New(env, token.toStdString());
  }

  Napi::Value SetToken(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1) {
      Napi::TypeError::New(env, "token required").ThrowAsJavaScriptException();
      return env.Null();
    }
    QString token = QString::fromUtf8(info[0].ToString().Utf8Value().c_str());
    auth_->setToken(token);
    return env.Undefined();
  }

  Napi::Value GetInstallationId(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::String::New(env, auth_->getInstallationId().toStdString());
  }

private:
  static Napi::FunctionReference constructor;
  std::unique_ptr<NostaleAuth> auth_;
};

Napi::FunctionReference AuthWrapper::constructor;

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  return AuthWrapper::Init(env, exports);
}

NODE_API_MODULE(gfless, InitAll)

} // namespace