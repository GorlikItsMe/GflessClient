# Gfless Node.js Addon (Headless)

This addon exposes the core authentication logic from `Launcher/src/auth` without any GUI dependencies. It binds `NostaleAuth` to Node.js via N-API.

## What it provides

- `createAuth(options)` → returns an `auth` object with:
  - `authenticate(email, password)` → `{ ok, captcha, gfChallengeId, wrongCredentials }`
  - `getAccounts()` → `{ [accountId]: displayName }`
  - `getToken(accountId)` → `string`
  - `setToken(token)`
  - `getInstallationId()`

## Prerequisites (Ubuntu/Debian)

- Build tools: `build-essential cmake ninja-build python3 g++`
- Node.js ≥ 18 and `node-gyp`
- Qt6 Core + Network development packages

Install:

```bash
sudo apt update
sudo apt install -y build-essential cmake ninja-build python3 g++ curl git pkg-config \
  qt6-base-dev qt6-base-dev-tools libqt6network6-dev
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g node-gyp
```

## Build

```bash
cd node-addon
npm install
npm run build
```

The built addon will be at `node-addon/build/Release/gfless.node`.

## Run tests

```bash
npm test
```

## Usage

```javascript
const { createAuth } = require('./build/Release/gfless.node');

const auth = createAuth({
  identityPath: '/path/to/identity.json',
  installationId: 'YOUR-INSTALLATION-ID',
  proxy: { enabled: false }
});

(async () => {
  const res = await auth.authenticate('email@example.com', 'password');
  if (res.ok) {
    const accounts = await auth.getAccounts();
    const first = Object.keys(accounts)[0];
    const token = await auth.getToken(first);
    console.log(token);
  } else if (res.captcha) {
    console.error('Captcha required. Solve via the GUI flow or integrate API if needed.');
  }
})();
```

## Notes

- On Linux, `NostaleAuth::initInstallationId()` reads Windows registry. Provide an explicit `installationId` via `createAuth({ installationId })`.
- Certificates are embedded from Qt resources (`resources.qrc`).
- This is a headless build; do not use GUI components.