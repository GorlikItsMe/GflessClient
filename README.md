# GflessClient

This application simulates almost everything that the Gameforge client does allowing you to have multiple gameforge accounts in the same launcher and open several game clients with just one click.

# Discord

To get help and check out more in depths tutorials you can join the discord server.

[<img src="https://discord.com/api/guilds/1339601581049647136/widget.png?style=banner2">](https://discord.gg/AVs6g3myx3)

## Features

* You can have multiple gameforge accounts in the same launcher.
* You can log in with your gameforge accounts through a proxy server.
* You can use custom game clients for each gameforge account in case you want to proxy the game aswell.
* You can use a different identity and installation id for each gameforge account.
* The software can check for game updates at startup
* You can disable the nosmall popup at first daily login.
* You can create new game accounts.
* Allows you to create profiles with game accounts that belong to different gameforge accounts and set a custom name for each account.
* You can selet and open multiple game accounts in one click.
* The process of selecting the server, channel and the character is fully automated.
* Allows you to quickly open the game settings by clicking in the wheel button.
* Allows you to change the game language.

## Instructions

1. Download the latest release version
2. Extract the folder and open GflessClient.exe
3. Generate your identity file (See instructions below)
4. Go to Options > Settings and select your identity file.
5. Go to Options > Settings and select your NostaleClientX.exe
6. Add a gameforge account
7. Select the accounts you want to open and click on Play

## How to generate identity file

You'll need to extract a valid blackbox from the request to auth/iovation following this steps:

1. Open [Fiddler](https://www.telerik.com/download/fiddler-b) and the Gameforge Client.
2. Enable HTTPS traffic decryption / Tools > Options > HTTPS > Decrypt HTTPS traffic.
3. Connect your game account and copy the blackbox from the request to auth/iovation (the blackbox look something like "tra:JVqc0...")
4. In the Gfless Client go to Options > Identity generator, paste the blackbox and click on the button that says "Generate and save".
5. Save the generated identity to a file.

## Credits

Big thanks and full credits to [morsisko](https://github.com/morsisko) and [stdLemon](https://github.com/stdLemon) for all the reverse engineering needed to make this project possible.<br>
Repositories used for this project: [Nostale-Auth](https://github.com/morsisko/NosTale-Auth), [Nostale-Gfless](https://github.com/morsisko/NosTale-Gfless) and [nostale-auth](https://github.com/stdLemon/nostale-auth)

## Node.js binding (headless API)

This repo now includes a Node.js addon that exposes the core logic from `Launcher/src/auth` without the GUI. It focuses on `NostaleAuth` to authenticate, list accounts, and obtain tokens.

- Location: `node-addon/`
- Exposed methods:
  - `createAuth(options)` → instance
    - options: `{ identityPath, installationId, proxy: { enabled, host, port, username, password } }`
  - `auth.authenticate(email, password)` → `{ ok, captcha, gfChallengeId, wrongCredentials }`
  - `auth.getAccounts()` → `{ [id]: displayName }`
  - `auth.getToken(accountId)` → `string`

### Requirements

- Qt 6 (Core, Network) in headless mode
- CMake ≥ 3.18, Ninja or Make
- Node.js ≥ 18, `node-gyp` toolchain
- A C++17 compiler

On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y build-essential cmake ninja-build python3 g++ curl git pkg-config \
  qtbase5-dev qtdeclarative5-dev qt6-base-dev qt6-base-dev-tools libqt6network6-dev
# Node.js (use your preferred method)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g node-gyp
```

### Build

```bash
cd node-addon
npm install
npm run build
```

### Test

```bash
npm test
```

### Usage example

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
    console.log('Token:', token);
  }
})();
```
