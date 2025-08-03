#include <napi.h>
#include "fingerprint_wrapper.h"
#include "blackbox_wrapper.h"
#include "identity_wrapper.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
    // Initialize fingerprint bindings
    FingerprintWrapper::Init(env, exports);
    
    // Initialize blackbox bindings
    BlackBoxWrapper::Init(env, exports);
    
    // Initialize identity bindings
    IdentityWrapper::Init(env, exports);
    
    return exports;
}

NODE_API_MODULE(nostale_auth, InitAll)