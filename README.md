# NosTale Authentication Node.js Bindings

This project provides Node.js bindings for the NosTale authentication functionality, focusing on the `Launcher/src/auth/*` files from the original C++/Qt codebase.

## Features

- **Fingerprint Generation**: Create and manage browser-like fingerprints for authentication
- **BlackBox Encoding/Decoding**: Encode and decode authentication data using the BlackBox algorithm  
- **Identity Management**: Persist and load fingerprints from files
- **Network Integration**: Fetch server time and handle proxy configurations
- **Encryption Support**: EncryptedBlackBox for secure authentication data

## Installation

```bash
npm install
```

## Quick Start

```javascript
const { Fingerprint, BlackBox, Identity } = require('./index');

// Create a new fingerprint
const fingerprint = new Fingerprint();
console.log('Fingerprint created:', fingerprint.json());

// Create an identity with file persistence
const identity = new Identity('./my_identity.json');
await identity.update();

// Create and encode a BlackBox
const blackBox = new BlackBox(identity, { features: [12345] });
const encoded = blackBox.encoded();
console.log('Encoded BlackBox:', encoded);

// Decode the BlackBox
const decoded = BlackBox.decode(encoded);
console.log('Decoded data:', decoded);
```

## Running Tests

```bash
npm test
```

This will run a comprehensive test suite that demonstrates:
- Fingerprint creation and updates
- Identity file persistence 
- BlackBox encoding/decoding
- EncryptedBlackBox functionality

## API Reference

### Fingerprint

The main fingerprint class that generates browser-like authentication data.

```javascript
const fingerprint = new Fingerprint(existingData, proxyConfig);

// Update various fingerprint components
fingerprint.updateVector();
fingerprint.updateCreation();
fingerprint.updateTimings();
await fingerprint.updateServerTime();

// Get fingerprint data
const data = fingerprint.json();
const jsonString = fingerprint.toString();
```

### Identity

Manages fingerprints with file persistence.

```javascript
const identity = new Identity('./identity.json', proxyConfig);

// Update all fingerprint components
await identity.update();

// Save to file
identity.save();

// Set request data
identity.setRequest({ features: [12345] });
```

### BlackBox

Handles encoding and decoding of fingerprint data.

```javascript
const blackBox = new BlackBox(identity, requestData);
const encoded = blackBox.encoded();

// Static methods for encoding/decoding
const decoded = BlackBox.decode(encodedData);
const encoded = BlackBox.encodeStatic(jsonString);
```

### EncryptedBlackBox

Provides encrypted BlackBox functionality.

```javascript
const encryptedBox = new EncryptedBlackBox(
    identity,
    'account-id',
    'gsid-12345',
    'installation-id'
);

const encrypted = encryptedBox.encrypted();
```

## Key Differences from Original C++ Code

- **Async/Await**: Network operations use modern JavaScript async/await patterns
- **No Qt Dependencies**: Pure Node.js implementation without Qt framework
- **JSON Handling**: Uses native JavaScript JSON instead of QJsonDocument
- **File I/O**: Uses Node.js fs module instead of QFile
- **Networking**: Uses axios instead of QNetworkAccessManager
- **Error Handling**: JavaScript-style error handling with try/catch

## File Structure

```
├── lib/
│   ├── Fingerprint.js    # Main fingerprint functionality
│   ├── BlackBox.js       # Encoding/decoding logic
│   └── Identity.js       # Identity management with persistence
├── index.js              # Main entry point
├── test.js               # Comprehensive test suite
├── package.json          # Node.js dependencies
└── README.md            # This file
```

## Original C++ Files Ported

This implementation is based on the following original files:
- `Launcher/src/auth/fingerprint.h/cpp`
- `Launcher/src/auth/blackbox.h/cpp` 
- `Launcher/src/auth/identity.h/cpp`
- `Launcher/src/syncnetworkaccessmanager.h/cpp`

## License

Same as the original project.
