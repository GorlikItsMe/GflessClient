const { expect } = require('chai');
const path = require('path');

// The built addon is placed in build/Release/gfless.node by cmake-js
const addonPath = path.join(__dirname, '..', 'build', 'Release', 'gfless.node');
let addon;

describe('gfless addon', function() {
  it('loads the addon module', function() {
    addon = require(addonPath);
    expect(addon).to.be.an('object');
    expect(addon.createAuth).to.be.a('function');
  });

  it('creates an auth instance and exposes methods', function() {
    const auth = addon.createAuth({
      identityPath: '',
      installationId: 'test-installation-id',
      proxy: { enabled: false }
    });

    expect(auth).to.be.an('object');
    expect(auth.authenticate).to.be.a('function');
    expect(auth.getAccounts).to.be.a('function');
    expect(auth.getToken).to.be.a('function');
    expect(auth.setToken).to.be.a('function');
    expect(auth.getInstallationId).to.be.a('function');
  });

  it('returns empty accounts and token if not authenticated', function() {
    const auth = addon.createAuth({
      identityPath: '',
      installationId: 'test-installation-id',
      proxy: { enabled: false }
    });

    const accounts = auth.getAccounts();
    expect(accounts).to.be.an('object');
    expect(Object.keys(accounts).length).to.equal(0);

    const token = auth.getToken('some-nonexistent-account');
    expect(token).to.be.a('string');
    expect(token).to.equal('');
  });
});