# Gfless Libraries

**Qt-free C++ and Node.js libraries for generating device fingerprints and blackbox data for authentication purposes.**

This project provides modern, dependency-light alternatives to the original Qt-based GflessClient authentication system. We offer both a pure C++ library and Node.js bindings, maintaining full compatibility with the original authentication protocols while eliminating Qt dependencies.

## 📦 Available Libraries

### [🔧 Gfless C++](./gfless-cpp/README.md)
- **Pure C++ implementation** using modern C++17 standards  
- **Qt-free** with minimal dependencies (libcurl, OpenSSL, nlohmann/json)
- **Cross-platform** support (Linux, macOS, Windows)
- **High performance** with optimized memory usage
- **Comprehensive testing** using Google Test

### [🚀 Gfless Node.js](./gfless-nodejs/README.md)  
- **TypeScript support** with full type definitions
- **Native performance** via N-API bindings to C++ library
- **Modern JavaScript API** with Promise support
- **npm package** for easy integration
- **Jest test suite** with comprehensive coverage

## 🎯 Features

Both libraries provide identical functionality:

- ✅ **Device Fingerprinting** - Generate unique device signatures
- ✅ **BlackBox Encoding** - Encode/decode authentication data  
- ✅ **Encrypted BlackBoxes** - Secure authentication for gaming platforms
- ✅ **Proxy Support** - SOCKS5 proxy configuration for network operations
- ✅ **Identity Management** - Persistent fingerprint storage and updates
- ✅ **Cross-Platform** - Linux, macOS, and Windows support

## 🚀 Quick Start

### C++ Library

```cpp
#include "gfless/gfless.h"

int main() {
    // Create an identity
    auto identity = gfless::createIdentity("identity.json");
    identity->update();
    
    // Generate encrypted blackbox for authentication
    auto encryptedBox = gfless::createEncryptedBlackBox(
        identity, "account123", "session456", "install789"
    );
    
    std::string authData = encryptedBox->encrypted();
    std::cout << "Authentication data: " << authData << std::endl;
    
    return 0;
}
```

### Node.js Library

```javascript
const { createIdentity, createEncryptedBlackBox } = require('gfless');

async function authenticate() {
    // Create an identity
    const identity = createIdentity('identity.json');
    identity.update();
    
    // Generate encrypted blackbox for authentication
    const encryptedBox = createEncryptedBlackBox(
        identity, 'account123', 'session456', 'install789'
    );
    
    const authData = encryptedBox.encrypted();
    console.log('Authentication data:', authData);
}

authenticate().catch(console.error);
```

## 📋 Requirements

### C++ Library
- **C++17** compatible compiler (GCC 7+, Clang 6+, MSVC 2019+)  
- **CMake** 3.16 or higher
- **System libraries**: libcurl, OpenSSL
- **JSON library**: nlohmann/json (auto-fetched if not found)

### Node.js Library  
- **Node.js** 16.0.0 or higher
- **Python** 3.7+ (for node-gyp)
- **C++ compiler** and system libraries (same as C++ library)

## 🛠 Installation

### Ubuntu/Debian

```bash
# Install system dependencies
sudo apt update
sudo apt install build-essential cmake pkg-config \
    libcurl4-openssl-dev libssl-dev nlohmann-json3-dev

# For C++ library
cd gfless-cpp
mkdir build && cd build
cmake .. && make -j$(nproc)

# For Node.js library  
cd gfless-nodejs
npm install
```

### macOS

```bash
# Install dependencies via Homebrew
brew install cmake curl openssl nlohmann-json

# For C++ library
cd gfless-cpp  
mkdir build && cd build
cmake .. && make -j$(sysctl -n hw.ncpu)

# For Node.js library
cd gfless-nodejs
npm install
```

### Windows

```powershell
# Install dependencies via vcpkg
vcpkg install curl openssl nlohmann-json

# For C++ library
cd gfless-cpp
mkdir build && cd build
cmake .. -DCMAKE_TOOLCHAIN_FILE=C:/vcpkg/scripts/buildsystems/vcpkg.cmake
cmake --build . --config Release

# For Node.js library
cd gfless-nodejs  
npm install
```

## 🧪 Testing

Both libraries include comprehensive test suites:

### C++ Tests (Google Test)
```bash
cd gfless-cpp/build
ctest -V

# Run specific test suites
./gfless_tests --gtest_filter="UtilsTest.*"
./gfless_tests --gtest_filter="IntegrationTest.*"
```

### Node.js Tests (Jest)
```bash
cd gfless-nodejs
npm test

# Run with coverage
npm run test:coverage

# Run specific tests
npm test -- utils.test.ts
```

## 📚 Documentation

### API Documentation
- [📖 C++ API Reference](./gfless-cpp/README.md#api-reference)
- [📖 Node.js API Reference](./gfless-nodejs/README.md#api-reference)

### Examples
- [🔧 C++ Examples](./gfless-cpp/examples/)
- [🚀 Node.js Examples](./gfless-nodejs/examples/)

### Key Components

#### BlackBox
Handles encoding and decoding of fingerprint data for authentication:
- **Basic BlackBox**: Standard encoding for general use
- **Encrypted BlackBox**: Secure encoding for authentication with gaming platforms

#### Fingerprint  
Manages device characteristics and browser fingerprints:
- Device information (OS, hardware, etc.)
- Browser characteristics (plugins, fonts, canvas fingerprint)
- Dynamic data (timestamps, vectors, server synchronization)

#### Identity
Handles fingerprint persistence and lifecycle:
- File-based storage in JSON format
- Automatic updates with current timestamps
- Proxy configuration for network operations

## 🔄 Migration from Qt Version

These libraries provide direct replacements for the original Qt-based GflessClient:

| Original Qt | Pure C++ | Node.js |
|-------------|----------|---------|
| Heavy Qt dependencies | Standard C++ libraries | npm package |
| Large binary size | Minimal footprint | Native performance |
| Platform limitations | Broader compatibility | JavaScript ecosystem |

### Migration Benefits

- **🚫 No Qt Dependencies** - Use standard, widely-available libraries
- **📦 Smaller Footprint** - Significantly reduced binary and runtime size  
- **⚡ Better Performance** - Optimized memory usage and faster operations
- **🔧 Modern C++** - C++17 features, smart pointers, RAII patterns
- **🌐 Broader Platform Support** - Works on more systems without Qt installation

## 🏗 Project Structure

```
gfless/
├── README.md                    # This file
├── gfless-cpp/                  # C++ library
│   ├── README.md               # C++ documentation
│   ├── CMakeLists.txt          # Build configuration
│   ├── include/gfless/         # Public headers
│   ├── src/                    # Implementation
│   ├── tests/                  # Test suite  
│   └── examples/               # Usage examples
├── gfless-nodejs/              # Node.js library
│   ├── README.md              # Node.js documentation  
│   ├── package.json           # npm configuration
│   ├── binding.gyp            # Native addon build
│   ├── src/                   # TypeScript + C++ source
│   ├── tests/                 # Jest test suite
│   └── examples/              # Usage examples
└── Launcher/                   # Original Qt source (reference)
    └── src/auth/              # Original implementation
        ├── blackbox.cpp
        ├── fingerprint.cpp
        └── identity.cpp
```

## 🤝 Contributing

We welcome contributions to both libraries! Please:

1. **Fork** the repository
2. **Create** a feature branch  
3. **Add tests** for new functionality
4. **Ensure** all tests pass
5. **Follow** the coding standards for each library
6. **Submit** a pull request

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd gfless

# Set up C++ library
cd gfless-cpp
mkdir build && cd build  
cmake .. && make
cd ../..

# Set up Node.js library
cd gfless-nodejs
npm install && npm run build
cd ..

# Run all tests
cd gfless-cpp/build && ctest
cd ../../gfless-nodejs && npm test
```

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

This project is based on the original **GflessClient** and the excellent reverse engineering work by:

- **[morsisko](https://github.com/morsisko)** - [Nostale-Auth](https://github.com/morsisko/NosTale-Auth), [Nostale-Gfless](https://github.com/morsisko/NosTale-Gfless)  
- **[stdLemon](https://github.com/stdLemon)** - [nostale-auth](https://github.com/stdLemon/nostale-auth)

### Acknowledgments

- Original **GflessClient** for providing the foundation
- **Gameforge** reverse engineering community for protocol analysis
- **NosTale** community for testing and feedback
- Contributors to **nlohmann/json**, **libcurl**, and **OpenSSL** projects

## ⚠️ Disclaimer

These libraries are created for **educational and research purposes**. Users are responsible for ensuring compliance with relevant terms of service and applicable laws. The authors do not encourage or support any activities that violate terms of service or applicable regulations.

## 📞 Support

- **🐛 Bug Reports**: [GitHub Issues](../../issues)
- **💬 Discussions**: [GitHub Discussions](../../discussions)  
- **📧 Contact**: See individual library READMEs for specific support

---

**Choose your preferred library and start building! Both C++ and Node.js libraries provide the same powerful authentication capabilities without the Qt overhead.**
