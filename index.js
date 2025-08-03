const binding = require('./build/Release/nostale_auth');

module.exports = {
    Fingerprint: binding.Fingerprint,
    BlackBox: binding.BlackBox,
    Identity: binding.Identity
};