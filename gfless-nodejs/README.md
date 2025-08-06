# Gfless Node.js Library

A Node.js library for generating device fingerprints and blackbox data for authentication purposes. This library provides JavaScript/TypeScript bindings for the Qt-free C++ gfless library, enabling easy integration into Node.js applications.

## Features

- **TypeScript Support**: Full TypeScript definitions included
- **Native Performance**: Uses C++ backend via N-API for optimal performance  
- **Cross-Platform**: Works on Linux, macOS, and Windows
- **Promise-Based**: Modern async/await compatible API
- **Proxy Support**: Built-in SOCKS5 proxy support for network operations
- **Complete Functionality**: All features from the C++ library exposed
- **Comprehensive Testing**: Full test suite using Jest

## Installation

### Prerequisites

- **Node.js** 16.0.0 or higher
- **Python** 3.7+ (for node-gyp)
- **C++ Compiler** (GCC, Clang, or MSVC)
- **System Dependencies**: libcurl, OpenSSL

### Ubuntu/Debian

```bash
# Install system dependencies
sudo apt update
sudo apt install build-essential python3-dev libcurl4-openssl-dev libssl-dev

# Install the package
npm install gfless
```

### macOS

```bash
# Install dependencies (if not already installed)
brew install curl openssl

# Install the package
npm install gfless
```

### Windows

```bash
# Install Visual Studio Build Tools
# Or install Visual Studio with C++ workload

# Install the package
npm install gfless
```

## Quick Start

### JavaScript (CommonJS)

```javascript
const { createIdentity, createBlackBox, Utils } = require('gfless');

async function example() {
  // Create an identity
  const identity = createIdentity('identity.json');
  
  // Update with current data
  identity.update();
  
  // Create a blackbox
  const blackBox = createBlackBox(identity, {
    app: 'my_application',
    version: '1.0'
  });
  
  const encoded = blackBox.encoded();
  console.log('Encoded BlackBox:', encoded);
}

example().catch(console.error);
```

### TypeScript (ESM)

```typescript
import { 
  createIdentity, 
  createEncryptedBlackBox,
  ProxyOptions,
  Identity 
} from 'gfless';

async function authExample(): Promise<void> {
  // Create identity with proxy settings
  const proxyOptions: ProxyOptions = {
    proxyIp: '127.0.0.1',
    proxyPort: '8080',
    useProxy: false
  };
  
  const identity: Identity = createIdentity('auth.json', proxyOptions);
  identity.update();
  
  // Create encrypted blackbox for authentication
  const encryptedBox = createEncryptedBlackBox(
    identity,
    'account123',
    'session456', 
    'install789'
  );
  
  const encrypted: string = encryptedBox.encrypted();
  console.log('Encrypted BlackBox:', encrypted);
}

authExample().catch(console.error);
```

## API Reference

### Classes

#### `Identity`

Manages device fingerprints and their persistence.

```typescript
class Identity {
  constructor(filePath: string, options?: ProxyOptions);
  update(): void;
  getFingerprint(): Fingerprint;
  setRequest(request: any): void;
}
```

**Example:**
```javascript
const identity = new Identity('identity.json', {
  proxyIp: '127.0.0.1',
  proxyPort: '8080',
  useProxy: false
});

identity.update();
const fingerprint = identity.getFingerprint();
```

#### `BlackBox`

Encodes fingerprint data for basic authentication.

```typescript
class BlackBox {
  constructor(identity: Identity, request?: any);
  encoded(): string;
  
  // Static methods
  static encode(data: string): string;
  static decode(blackbox: string): string;
}
```

**Example:**
```javascript
const blackBox = new BlackBox(identity, { app: 'test' });
const encoded = blackBox.encoded();

// Static usage
const staticEncoded = BlackBox.encode('["test", 123]');
const decoded = BlackBox.decode(staticEncoded);
```

#### `EncryptedBlackBox`

Creates encrypted blackboxes for secure authentication.

```typescript
class EncryptedBlackBox {
  constructor(
    identity: Identity,
    accountId: string,
    gsid: string,
    installationId: string
  );
  encrypted(): string;
}
```

**Example:**
```javascript
const encryptedBox = new EncryptedBlackBox(
  identity,
  'account_id_123',
  'game_session_456',
  'installation_789'
);

const encrypted = encryptedBox.encrypted();
```

### Utility Classes

#### `Utils`

Utility functions for encoding, time, and random generation.

```typescript
class Utils {
  static getCurrentTimeISO(): string;
  static getCurrentTimeMs(): number;
  static randomString(length: number): string;
  static base64Encode(data: string): string;
  static base64Decode(encoded: string): string;
  static urlEncode(data: string): string;
  static urlDecode(encoded: string): string;
}
```

**Example:**
```javascript
const timeISO = Utils.getCurrentTimeISO();
const timeMs = Utils.getCurrentTimeMs();
const random = Utils.randomString(16);
const encoded = Utils.base64Encode('hello world');
```

#### `Crypto`

Cryptographic utility functions.

```typescript
class Crypto {
  static sha512Hex(data: string): string;
  static xorEncrypt(data: string, key: string): string;
  static xorDecrypt(data: string, key: string): string;
}
```

**Example:**
```javascript
const hash = Crypto.sha512Hex('input data');
const encrypted = Crypto.xorEncrypt('secret', 'key');
const decrypted = Crypto.xorDecrypt(encrypted, 'key');
```

### Convenience Functions

```typescript
// Identity creation
function createIdentity(filePath: string, options?: ProxyOptions): Identity;

// BlackBox creation
function createBlackBox(identity: Identity, request?: any): BlackBox;

// EncryptedBlackBox creation  
function createEncryptedBlackBox(
  identity: Identity,
  accountId: string,
  gsid: string,
  installationId: string
): EncryptedBlackBox;

// Version info
function getVersion(): string;
```

### TypeScript Interfaces

#### `ProxyOptions`

```typescript
interface ProxyOptions {
  proxyIp?: string;
  proxyPort?: string;
  proxyUsername?: string;
  proxyPassword?: string;
  useProxy?: boolean;
}
```

#### `Fingerprint`

```typescript
interface Fingerprint {
  v?: number;
  tz?: string;
  osType?: string;
  app?: string;
  vendor?: string;
  mem?: number;
  con?: string;
  lang?: string;
  plugins?: any[];
  gpu?: string;
  fonts?: string[];
  audioC?: number;
  width?: number;
  height?: number;
  video?: string;
  audio?: string;
  media?: any;
  permissions?: any;
  audioFP?: string;
  webglFP?: string;
  canvasFP?: string;
  creation?: string;
  uuid?: string;
  d?: number;
  osVersion?: string;
  vector?: string;
  userAgent?: string;
  serverTimeInMS?: string;
  request?: any;
}
```

## Examples

### Basic Fingerprint Generation

```javascript
const { createIdentity, Utils } = require('gfless');

const identity = createIdentity('device.json');
identity.update();

const fingerprint = identity.getFingerprint();
console.log('Device fingerprint created at:', fingerprint.creation);
console.log('Fingerprint version:', fingerprint.v);
```

### Authentication Workflow

```javascript
const { 
  createIdentity, 
  createEncryptedBlackBox 
} = require('gfless');

async function authenticate(accountId, sessionId, installationId) {
  // Create or load identity
  const identity = createIdentity('auth_identity.json');
  identity.update();
  
  // Generate encrypted blackbox
  const encryptedBox = createEncryptedBlackBox(
    identity,
    accountId,
    sessionId, 
    installationId
  );
  
  const authData = encryptedBox.encrypted();
  
  // Use authData in your authentication request
  return authData;
}

authenticate('user123', 'sess456', 'inst789')
  .then(authData => {
    console.log('Authentication data generated:', authData.length, 'bytes');
  })
  .catch(console.error);
```

### Proxy Configuration

```javascript
const { createIdentity } = require('gfless');

const identity = createIdentity('proxied_identity.json', {
  proxyIp: '127.0.0.1',
  proxyPort: '8080',
  proxyUsername: 'user',
  proxyPassword: 'pass',
  useProxy: true
});

// Network operations will use the proxy
identity.update();
```

### Batch Processing

```javascript
const { createIdentity, createBlackBox } = require('gfless');

async function generateMultipleBlackBoxes(count) {
  const identity = createIdentity('batch_identity.json');
  identity.update();
  
  const results = [];
  
  for (let i = 0; i < count; i++) {
    const blackBox = createBlackBox(identity, {
      batch: i,
      timestamp: Date.now()
    });
    
    results.push({
      id: i,
      encoded: blackBox.encoded()
    });
  }
  
  return results;
}

generateMultipleBlackBoxes(5)
  .then(results => {
    console.log(`Generated ${results.length} blackboxes`);
    results.forEach(r => {
      console.log(`${r.id}: ${r.encoded.substring(0, 50)}...`);
    });
  });
```

## Testing

The library includes comprehensive tests using Jest:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Run specific test files
npm test -- utils.test.ts
npm test -- blackbox.test.ts
npm test -- integration.test.ts
```

### Test Structure

```
tests/
├── setup.ts              # Test environment setup
├── utils.test.ts          # Utility function tests  
├── blackbox.test.ts       # BlackBox functionality tests
└── integration.test.ts    # End-to-end workflow tests
```

## Building from Source

```bash
# Clone the repository
git clone <repository-url>
cd gfless-nodejs

# Install dependencies
npm install

# Build the C++ library (if needed)
cd ../gfless-cpp
mkdir build && cd build
cmake .. && make

# Build the Node.js addon
cd ../../gfless-nodejs
npm run build:native

# Build TypeScript
npm run build:ts

# Run tests
npm test
```

## Project Structure

```
gfless-nodejs/
├── package.json           # Package configuration
├── binding.gyp           # Native addon build config
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Jest test configuration
├── src/                  # TypeScript source
│   ├── index.ts         # Main library exports
│   ├── addon.cpp        # Native addon entry point
│   ├── identity_wrapper.cpp
│   ├── blackbox_wrapper.cpp
│   └── utils_wrapper.cpp
├── lib/                  # Compiled JavaScript output
├── tests/               # Test suite
│   ├── setup.ts
│   ├── utils.test.ts
│   ├── blackbox.test.ts
│   └── integration.test.ts
└── examples/            # Usage examples
    ├── basic_example.js
    └── encrypted_example.js
```

## Performance Considerations

- **Native Speed**: Core operations run at native C++ speed
- **Memory Efficiency**: Minimal JavaScript ↔ C++ data copying
- **Async Operations**: Network operations don't block the event loop
- **Caching**: Fingerprint data is cached for efficiency

## Troubleshooting

### Installation Issues

1. **Missing Native Dependencies**
   ```bash
   # Ubuntu/Debian
   sudo apt install build-essential python3-dev
   
   # macOS  
   xcode-select --install
   
   # Windows
   npm install --global windows-build-tools
   ```

2. **Node-gyp Compilation Errors**
   ```bash
   # Clear cache and rebuild
   npm install --build-from-source
   
   # Or rebuild specifically
   npm run build:native
   ```

3. **Runtime Library Errors**
   ```bash
   # Check for missing shared libraries
   ldd ./build/Release/gfless.node
   
   # Install missing dependencies
   sudo apt install libcurl4-openssl-dev libssl-dev
   ```

### Common Issues

1. **"Cannot find module" errors**
   - Ensure the native addon was built successfully
   - Check that all dependencies are installed
   - Try rebuilding: `npm run build`

2. **Segmentation faults**
   - Usually indicates ABI mismatch
   - Rebuild with the exact Node.js version you're using
   - Check C++ library compatibility

3. **Network timeouts**
   - Increase timeout in HTTP client configuration
   - Check proxy settings if using a proxy
   - Verify network connectivity

## Migration from C++ Version

The Node.js library provides a JavaScript-friendly wrapper around the C++ library:

```cpp
// C++ version
auto identity = gfless::createIdentity("identity.json");
identity->update();
auto blackBox = gfless::createBlackBox(identity, request);
std::string encoded = blackBox->encoded();
```

```javascript
// Node.js version
const identity = createIdentity('identity.json');
identity.update();
const blackBox = createBlackBox(identity, request);
const encoded = blackBox.encoded();
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all tests pass: `npm test`
5. Build successfully: `npm run build`
6. Submit a pull request

### Development Setup

```bash
# Install dependencies
npm install

# Install C++ dependencies
cd ../gfless-cpp && mkdir build && cd build
cmake .. && make && cd ../../gfless-nodejs

# Build and test
npm run build
npm test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Based on the original GflessClient project and the reverse engineering work by:
- [morsisko](https://github.com/morsisko) - [Nostale-Auth](https://github.com/morsisko/NosTale-Auth)
- [stdLemon](https://github.com/stdLemon) - [nostale-auth](https://github.com/stdLemon/nostale-auth)

This Node.js binding provides a JavaScript interface to the Qt-free C++ library while maintaining full compatibility with the original authentication system.