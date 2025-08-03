# Gameforge Authentication Library

[![CI](https://github.com/your-username/gameforge-auth/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/gameforge-auth/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/gameforge-auth.svg)](https://badge.fury.io/js/gameforge-auth)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript/Node.js library for Gameforge authentication and token generation. This library provides a pure API interface for authenticating with Gameforge accounts and generating game tokens, focusing on the core authentication functionality without GUI components.

## ✨ Features

- 🔐 **Complete Gameforge Authentication**: Login to your Gameforge accounts
- 🎮 **Game Token Generation**: Generate tokens for game accounts (NosTale, etc.)
- 🛡️ **Device Fingerprinting**: Advanced fingerprinting and blackbox encoding
- 🌐 **Proxy Support**: SOCKS5 proxy support for all requests
- 🔄 **Multiple Accounts**: Manage multiple Gameforge accounts simultaneously
- 📦 **TypeScript Support**: Full TypeScript definitions included
- ⚡ **Modern Async/Await**: Clean promise-based API
- 🧪 **Comprehensive Testing**: Extensive test suite with CI/CD

## 📦 Installation

```bash
npm install gameforge-auth
```

## 🚀 Quick Start

```typescript
import { GameforgeAccount, GameforgeAuthUtils } from 'gameforge-auth';

// Generate installation ID
const installationId = GameforgeAuthUtils.generateInstallationId();

// Configure account
const account = new GameforgeAccount({
  email: 'your-gameforge-email@example.com',
  password: 'your-gameforge-password',
  identityPath: './identity.json',
  installationId: installationId
});

// Authenticate
const result = await account.authenticate();
if (result.success) {
  console.log('Authentication successful!');
  
  // Get game accounts
  const gameAccounts = account.getGameAccounts();
  
  // Generate token for first account
  const [accountId] = gameAccounts.keys();
  const token = await account.getToken(accountId);
  console.log('Game token:', token);
}
```

## 📋 Prerequisites

Before using this library, you need to extract a valid blackbox from the Gameforge client. This is required for proper device fingerprinting:

### 🔍 Extracting Blackbox with Fiddler

1. **Install Fiddler**: Download and install [Fiddler Classic](https://www.telerik.com/download/fiddler)

2. **Configure HTTPS Decryption**: 
   - Go to Tools > Options > HTTPS
   - Check "Decrypt HTTPS traffic"

3. **Capture Authentication**:
   - Start Fiddler
   - Open the official Gameforge Client
   - Login to your account
   - Look for requests to `auth/iovation`

4. **Extract Blackbox**:
   - Find the request containing the blackbox (starts with "tra:")
   - Copy the blackbox value
   - Use it with `GameforgeAuthUtils.generateIdentityFromBlackbox()`

## 📖 Usage Examples

### Basic Authentication

```typescript
import { GameforgeAccount, GameforgeAuthUtils } from 'gameforge-auth';
import * as path from 'path';

async function basicExample() {
  const installationId = GameforgeAuthUtils.generateInstallationId();
  const identityPath = path.join(__dirname, 'identity.json');

  // Optional: Generate identity from extracted blackbox
  const blackbox = 'tra:JVqc0...'; // Your extracted blackbox
  GameforgeAuthUtils.generateIdentityFromBlackbox(blackbox, identityPath);

  const account = new GameforgeAccount({
    email: 'your-email@example.com',
    password: 'your-password',
    identityPath: identityPath,
    installationId: installationId
  });

  const result = await account.authenticate();
  
  if (result.success) {
    console.log('✅ Authentication successful');
    
    // Get all game accounts
    const gameAccounts = account.getGameAccounts();
    console.log(`Found ${gameAccounts.size} game accounts`);
    
    // Generate tokens for each account
    for (const [accountId, displayName] of gameAccounts) {
      const token = await account.getToken(accountId);
      console.log(`${displayName}: ${token}`);
    }
  } else if (result.captcha) {
    console.log('🤖 Captcha required:', result.challengeId);
  } else if (result.wrongCredentials) {
    console.log('❌ Wrong credentials');
  }
}
```

### Using Proxy

```typescript
const account = new GameforgeAccount({
  email: 'your-email@example.com',
  password: 'your-password',
  identityPath: './identity.json',
  installationId: GameforgeAuthUtils.generateInstallationId(),
  proxy: {
    host: '127.0.0.1',
    port: 1080,
    username: 'proxy-user', // optional
    password: 'proxy-pass'  // optional
  }
});
```

### Multiple Accounts Management

```typescript
import { GameforgeManager } from 'gameforge-auth/examples/advanced-usage';

const manager = new GameforgeManager();

// Add multiple accounts
manager.addAccount('main', 'user1@example.com', 'password1');
manager.addAccount('alt', 'user2@example.com', 'password2', {
  proxy: { host: '127.0.0.1', port: 1080 }
});

// Authenticate all accounts
const results = await manager.authenticateAllAccounts();

// Generate tokens for all accounts
const tokens = await manager.generateAllTokens();
```

### Working with Game Accounts

```typescript
import { GameAccount } from 'gameforge-auth';

// Create a GameAccount instance for easier management
const gameAccount = new GameAccount(
  gameforgeAccount,    // GameforgeAccount instance
  'AccountName',       // Account name
  'account-id-123',    // Account ID
  'Custom Display',    // Custom display name
  0,                   // Server location
  1,                   // Server index
  1,                   // Channel index
  0,                   // Character slot
  true                 // Auto login
);

// Get token for this specific account
const token = await gameAccount.getGameToken();

// Access account properties
console.log('Account ID:', gameAccount.getId());
console.log('Display Name:', gameAccount.getDisplayName());
console.log('Server Info:', {
  location: gameAccount.getServerLocation(),
  server: gameAccount.getServer(),
  channel: gameAccount.getChannel(),
  slot: gameAccount.getSlot()
});
```

## 🏗️ API Reference

### GameforgeAccount

Main class for managing Gameforge account authentication.

```typescript
class GameforgeAccount {
  constructor(config: GameforgeAccountConfig)
  
  async authenticate(): Promise<AuthResult>
  async createGameAccount(name: string, gfLang?: string): Promise<any>
  async updateGameAccounts(): Promise<void>
  async getToken(accountId: string): Promise<string>
  
  setToken(token: string): void
  getGameAccounts(): Map<string, string>
  getEmail(): string
  getPassword(): string
  getIdentityPath(): string
  getAuth(): NostaleAuth
  getCustomClientPath(): string | undefined
}
```

### GameforgeAuthUtils

Utility functions for common operations.

```typescript
class GameforgeAuthUtils {
  static generateInstallationId(): string
  static generateIdentityFromBlackbox(blackbox: string, outputPath: string): boolean
}
```

### NostaleAuth

Core authentication class (usually used through GameforgeAccount).

```typescript
class NostaleAuth {
  constructor(identityPath: string, installationId: string, proxy?: ProxyConfig)
  
  async authenticate(email: string, password: string): Promise<AuthResult>
  async getAccounts(): Promise<Map<string, string>>
  async getToken(accountId: string): Promise<string>
  async createGameAccount(email: string, name: string, gfLang?: string): Promise<any>
  
  getInstallationId(): string
  setToken(token: string): void
  getToken(): string
}
```

### Types

```typescript
interface GameforgeAccountConfig {
  email: string
  password: string
  identityPath: string
  installationId: string
  customGamePath?: string
  proxy?: ProxyConfig
}

interface ProxyConfig {
  host: string
  port: number
  username?: string
  password?: string
}

interface AuthResult {
  success: boolean
  captcha?: boolean
  challengeId?: string
  wrongCredentials?: boolean
  token?: string
}
```

## 🧪 Testing

The library includes comprehensive tests covering all functionality:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch

# Run integration tests (requires test credentials)
npm run test:integration
```

### Setting up Test Environment

For integration tests, set these environment variables:

```bash
export TEST_EMAIL="your-test-email@example.com"
export TEST_PASSWORD="your-test-password"
export TEST_BLACKBOX="tra:your-extracted-blackbox..."
```

## 🔧 Development

### Building

```bash
# Build TypeScript
npm run build

# Clean build directory
npm run clean

# Lint code
npm run lint
npm run lint:fix
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📁 Project Structure

```
gameforge-auth/
├── src/
│   ├── __tests__/           # Unit tests
│   │   ├── integration/     # Integration tests
│   │   ├── fingerprint.test.ts
│   │   └── blackbox.test.ts
│   ├── fingerprint.ts       # Device fingerprinting
│   ├── identity.ts          # Identity management
│   ├── blackbox.ts          # Blackbox encoding/decoding
│   ├── nostale-auth.ts      # Core authentication
│   ├── gameforge-account.ts # Account wrapper
│   ├── game-account.ts      # Individual game account
│   ├── types.ts            # TypeScript definitions
│   └── index.ts            # Main exports
├── examples/
│   ├── basic-usage.ts      # Basic usage examples
│   └── advanced-usage.ts   # Advanced usage examples
├── .github/workflows/      # GitHub Actions CI/CD
├── dist/                   # Compiled JavaScript
└── docs/                   # Documentation
```

## ⚠️ Important Notes

### Security

- **Never commit real credentials** to version control
- **Use environment variables** for sensitive data
- **Extract blackbox properly** using official Gameforge client
- **Respect rate limits** to avoid being blocked

### Legal Disclaimer

This library is for educational purposes. Users are responsible for:
- Complying with Gameforge's Terms of Service
- Using the library responsibly
- Not violating any applicable laws or regulations

### Compatibility

- **Node.js**: 18.x, 20.x, 21.x
- **TypeScript**: 5.x
- **Games**: Primarily tested with NosTale

## 🤝 Credits

This project is inspired by and builds upon the work from:

- [morsisko/NosTale-Auth](https://github.com/morsisko/NosTale-Auth)
- [morsisko/NosTale-Gfless](https://github.com/morsisko/NosTale-Gfless)
- [stdLemon/nostale-auth](https://github.com/stdLemon/nostale-auth)

Big thanks to the contributors of these projects for their reverse engineering work.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues and Support

- **Bug Reports**: [GitHub Issues](https://github.com/your-username/gameforge-auth/issues)
- **Feature Requests**: [GitHub Issues](https://github.com/your-username/gameforge-auth/issues)
- **Documentation**: [GitHub Wiki](https://github.com/your-username/gameforge-auth/wiki)

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

---

**⭐ If this library helped you, please consider giving it a star!**
