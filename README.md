# NosTale Authentication Node.js Qt-based Bindings

This project provides Node.js **native C++ bindings** for the NosTale authentication functionality, using the **original Qt-based code** from `Launcher/src/auth/*` files. This approach creates Node.js wrappers around the existing C++/Qt classes without rewriting any authentication logic.

## Features

- **🎯 Uses Original Code**: Directly wraps the existing Qt-based `Fingerprint`, `BlackBox`, and `Identity` classes
- **🚀 Native Performance**: No JavaScript rewrites - uses the exact same algorithms as the original launcher
- **📦 Complete Integration**: Supports all original features including proxy configuration and file persistence
- **🔄 Qt Event Loop**: Properly initializes Qt environment for Node.js integration

## Dependencies

### Required Software
- **Node.js** 16+ with node-gyp support
- **Qt5** development libraries (Core and Network modules)
- **C++ Compiler** (Visual Studio on Windows, GCC/Clang on Linux/macOS)
- **pkg-config** (for finding Qt libraries on Linux/macOS)

### Installing Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential qt5-default libqt5core5a libqt5network5 qtbase5-dev pkg-config
```

**CentOS/RHEL/Fedora:**
```bash
sudo yum install qt5-qtbase-devel qt5-qtnetwork qt5-qtcore pkg-config gcc-c++
# or on newer versions:
sudo dnf install qt5-qtbase-devel qt5-qtnetwork qt5-qtcore pkg-config gcc-c++
```

**macOS (with Homebrew):**
```bash
brew install qt5 pkg-config
export PATH="/usr/local/opt/qt5/bin:$PATH"
export PKG_CONFIG_PATH="/usr/local/opt/qt5/lib/pkgconfig:$PKG_CONFIG_PATH"
```

**Windows:**
1. Install Visual Studio 2019/2022 with C++ tools
2. Install Qt5 from https://www.qt.io/download-open-source
3. Set environment variable `QTDIR` to your Qt installation path (e.g., `C:\Qt\5.15.2\msvc2019_64`)

## Installation

```bash
npm install
```

This will automatically build the C++ addon using node-gyp and link against Qt libraries.

## Quick Start

```javascript
const { Fingerprint, BlackBox, Identity } = require('./index');

// Create a new fingerprint (uses original Qt Fingerprint class)
const fingerprint = new Fingerprint();
console.log('Fingerprint created:', fingerprint.getJson());

// Update fingerprint components
fingerprint.updateVector();
fingerprint.updateCreation();
fingerprint.updateTimings();
fingerprint.updateServerTime(); // Uses Qt networking for real server time

// Create identity with file persistence (uses original Qt Identity class)
const identity = new Identity('./my_identity.json');
identity.update();

// Set request data
const request = '{"features":[12345],"installation":"test-id","session":"test-session"}';
identity.setRequest(request);

// Create BlackBox with identity (uses original Qt BlackBox class)
const blackBox = new BlackBox(identity, request);
const encoded = blackBox.encoded();
console.log('Encoded BlackBox:', encoded);

// Static BlackBox methods
const testData = '["test","data","array"]';
const staticEncoded = BlackBox.encodeStatic(testData);
const decoded = BlackBox.decode(staticEncoded);
```

## Running Tests

```bash
npm test
```

This will run a comprehensive test that demonstrates:
- Fingerprint creation using original Qt code
- Identity management with file persistence
- BlackBox encoding with full Qt integration
- Qt event loop initialization

## API Reference

### Fingerprint

Wraps the original Qt `Fingerprint` class from `Launcher/src/auth/fingerprint.h/cpp`.

```javascript
const fingerprint = new Fingerprint();
// OR with existing data and proxy config
const fingerprint = new Fingerprint(existingFpData, {
    ip: "127.0.0.1",
    port: "1080", 
    username: "user",
    password: "pass",
    useProxy: true
});

// Get fingerprint as JavaScript object
const data = fingerprint.getJson();

// Get fingerprint as JSON string
const jsonString = fingerprint.toString();

// Update methods (calls original Qt methods)
fingerprint.updateVector();      // Updates vector with current time
fingerprint.updateCreation();    // Updates creation timestamp  
fingerprint.updateTimings();     // Updates timing delays
fingerprint.updateServerTime();  // Fetches real server time via Qt networking

// Set request data (converts to QJsonObject)
fingerprint.setRequest('{"features":[12345]}');
```

### Identity

Wraps the original Qt `Identity` class from `Launcher/src/auth/identity.h/cpp`.

```javascript
// Create identity with file persistence
const identity = new Identity('./identity.json');
// OR with proxy configuration
const identity = new Identity('./identity.json', {
    ip: "127.0.0.1",
    port: "1080",
    username: "user", 
    password: "pass",
    useProxy: true
});

// Update all fingerprint components
identity.update();

// Get the underlying fingerprint data
const fingerprintData = identity.getFingerprint();

// Set request data
identity.setRequest('{"features":[12345]}');

// Save to file (automatic on destruction, but can call manually)
identity.save();
```

### BlackBox

Wraps the original Qt `BlackBox` class from `Launcher/src/auth/blackbox.h/cpp`.

```javascript
// Create BlackBox with Identity
const blackBox = new BlackBox(identity, requestJsonString);
const encoded = blackBox.encoded();

// Static methods (use original Qt algorithms)
const encoded = BlackBox.encodeStatic(jsonArrayString);
const decoded = BlackBox.decode(encodedBlackBox);
```

## Architecture

### Qt Integration Layer
- **Qt Application Initialization**: Automatically creates `QCoreApplication` for Node.js
- **Qt Event Loop**: Properly handles Qt's event system within Node.js
- **Memory Management**: Uses smart pointers to manage Qt object lifecycles

### Binding Layer
- **fingerprint_wrapper.h/cpp**: Node.js wrapper for Qt `Fingerprint` class
- **blackbox_wrapper.h/cpp**: Node.js wrapper for Qt `BlackBox` class  
- **identity_wrapper.h/cpp**: Node.js wrapper for Qt `Identity` class
- **binding.cpp**: Main entry point that initializes all wrappers

### Original Qt Classes (Used Directly)
- **Launcher/src/auth/fingerprint.h/cpp**: Core fingerprint generation
- **Launcher/src/auth/blackbox.h/cpp**: BlackBox encoding/decoding algorithms
- **Launcher/src/auth/identity.h/cpp**: Identity management with file persistence
- **Launcher/src/syncnetworkaccessmanager.h/cpp**: Synchronous Qt networking

## File Structure

```
├── src/
│   ├── binding.cpp              # Main Node.js addon entry point
│   ├── fingerprint_wrapper.h/cpp # Node.js wrapper for Qt Fingerprint
│   ├── blackbox_wrapper.h/cpp   # Node.js wrapper for Qt BlackBox
│   └── identity_wrapper.h/cpp   # Node.js wrapper for Qt Identity
├── Launcher/src/auth/           # Original Qt-based authentication code
│   ├── fingerprint.h/cpp        # ← Used directly (original code)
│   ├── blackbox.h/cpp           # ← Used directly (original code)
│   ├── identity.h/cpp           # ← Used directly (original code)
│   └── syncnetworkaccessmanager.h/cpp # ← Used directly (original code)
├── binding.gyp                  # Build configuration with Qt linking
├── index.js                     # JavaScript entry point
├── test.js                      # Test suite
├── package.json                 # Node.js dependencies
└── README.md                    # This file
```

## Key Advantages

✅ **Zero Code Duplication**: Uses the exact same C++/Qt code as the original launcher  
✅ **Identical Behavior**: 100% compatibility with original authentication algorithms  
✅ **Full Feature Support**: All proxy settings, file persistence, and networking features work  
✅ **Maintainability**: Updates to original code automatically available in bindings  
✅ **Performance**: Native Qt performance with no JavaScript overhead  

## Troubleshooting

### Common Build Issues

**Qt not found:**
```bash
# Linux: Check Qt installation
pkg-config --modversion Qt5Core Qt5Network

# macOS: Check Qt path
brew list qt5

# Windows: Check QTDIR environment variable
echo %QTDIR%
```

**Compilation errors:**
- Ensure you have C++17 support
- Check that Qt development headers are installed
- Verify pkg-config can find Qt modules

**Runtime errors:**
- Qt libraries must be in system PATH/LD_LIBRARY_PATH
- Some features require proper Qt plugin paths

### Environment Setup

**Linux:**
```bash
export LD_LIBRARY_PATH="/usr/lib/x86_64-linux-gnu/qt5:$LD_LIBRARY_PATH"
```

**macOS:**
```bash
export DYLD_LIBRARY_PATH="/usr/local/opt/qt5/lib:$DYLD_LIBRARY_PATH"
```

**Windows:**
```cmd
set PATH=%QTDIR%\bin;%PATH%
```

## License

Same as the original project.
