# Gfless C++ Library

A Qt-free C++ library for generating device fingerprints and blackbox data for authentication purposes. This is a modern port of the original GflessClient authentication system, removing Qt dependencies and using standard C++ libraries.

## Features

- **Qt-Free**: Pure C++ implementation using modern C++17 standards
- **Cross-Platform**: Supports Linux, macOS, and Windows
- **Modern Dependencies**: Uses nlohmann/json, libcurl, and OpenSSL
- **Complete Port**: Includes Fingerprint, Identity, and BlackBox functionality
- **Proxy Support**: Built-in SOCKS5 proxy support for network operations
- **Thread-Safe**: Safe for use in multi-threaded applications
- **Comprehensive Testing**: Full test suite using Google Test

## Core Components

### BlackBox
- **Purpose**: Encodes and decodes fingerprint data for authentication
- **Features**: Base64 encoding, URL encoding, custom encoding algorithm
- **Classes**: `BlackBox` (basic), `EncryptedBlackBox` (for authentication)

### Fingerprint  
- **Purpose**: Generates and manages device fingerprints
- **Features**: Vector updates, server time synchronization, random timing
- **Data**: Device characteristics, timestamps, browser fingerprints

### Identity
- **Purpose**: Manages fingerprint persistence and updates
- **Features**: File-based storage, automatic updates, proxy configuration
- **Persistence**: JSON format for cross-platform compatibility

## Dependencies

### Required System Libraries
- **libcurl**: HTTP client functionality
- **OpenSSL**: Cryptographic operations (SHA512, etc.)
- **nlohmann/json**: JSON parsing and generation

### Build Dependencies
- **CMake** 3.16 or higher
- **C++17** compatible compiler (GCC 7+, Clang 6+, MSVC 2019+)
- **pkg-config** for dependency detection

## Installation

### Ubuntu/Debian
```bash
# Install dependencies
sudo apt update
sudo apt install build-essential cmake pkg-config libcurl4-openssl-dev libssl-dev nlohmann-json3-dev

# Clone and build
git clone <repository-url>
cd gfless-cpp
mkdir build && cd build
cmake ..
make -j$(nproc)

# Run tests
ctest

# Install (optional)
sudo make install
```

### macOS
```bash
# Install dependencies using Homebrew
brew install cmake curl openssl nlohmann-json

# Clone and build
git clone <repository-url>
cd gfless-cpp
mkdir build && cd build
cmake ..
make -j$(sysctl -n hw.ncpu)

# Run tests
ctest
```

### Windows (Visual Studio)
```powershell
# Install dependencies using vcpkg
vcpkg install curl openssl nlohmann-json

# Clone and build
git clone <repository-url>
cd gfless-cpp
mkdir build && cd build
cmake .. -DCMAKE_TOOLCHAIN_FILE=C:/vcpkg/scripts/buildsystems/vcpkg.cmake
cmake --build . --config Release

# Run tests
ctest -C Release
```

## Quick Start

### Basic Usage

```cpp
#include "gfless/gfless.h"

int main() {
    try {
        // Create an identity
        auto identity = gfless::createIdentity("identity.json");
        
        // Update with current data
        identity->update();
        
        // Create a blackbox
        gfless::json request = gfless::json::object();
        request["app"] = "my_application";
        
        auto blackBox = gfless::createBlackBox(identity, request);
        std::string encoded = blackBox->encoded();
        
        std::cout << "Encoded BlackBox: " << encoded << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

### Authentication Example

```cpp
#include "gfless/gfless.h"

int main() {
    try {
        // Create identity with proxy support
        auto identity = gfless::createIdentity(
            "auth_identity.json",
            "127.0.0.1",     // proxy IP
            "8080",          // proxy port  
            "username",      // proxy username
            "password",      // proxy password
            true             // enable proxy
        );
        
        // Update identity
        identity->update();
        
        // Create encrypted blackbox for authentication
        auto encryptedBox = gfless::createEncryptedBlackBox(
            identity,
            "account_id_123",           // account ID
            "session_id_456",           // game session ID
            "installation_id_789"       // installation ID
        );
        
        std::string encrypted = encryptedBox->encrypted();
        std::cout << "Encrypted BlackBox: " << encrypted << std::endl;
        
        // Use this encrypted blackbox for authentication requests
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

## API Reference

### Utility Functions

```cpp
// Time utilities
std::string time_iso = gfless::Utils::getCurrentTimeISO();
int64_t time_ms = gfless::Utils::getCurrentTimeMs();

// Random generation
std::string random = gfless::Utils::randomString(16);
char random_char = gfless::Utils::randomAsciiChar();

// Encoding utilities
std::string encoded = gfless::Utils::base64Encode("data");
std::string decoded = gfless::Utils::base64Decode(encoded);
std::string url_encoded = gfless::Utils::urlEncode("hello world");
std::string url_decoded = gfless::Utils::urlDecode(url_encoded);
```

### Cryptographic Functions

```cpp
// Hash functions
std::string hash = gfless::CryptoUtils::sha512Hex("input data");
std::string raw_hash = gfless::CryptoUtils::sha512("input data");

// XOR encryption (symmetric)
std::string encrypted = gfless::CryptoUtils::xorEncrypt("plaintext", "key");
std::string decrypted = gfless::CryptoUtils::xorDecrypt(encrypted, "key");

// Hex conversion
std::string hex = gfless::CryptoUtils::toHex("binary data");
std::string binary = gfless::CryptoUtils::fromHex(hex);
```

### BlackBox Operations

```cpp
// Static encode/decode
std::string data = R"(["field1", "field2", 123])";
std::string encoded = gfless::BlackBox::encode(data);
std::string decoded = gfless::BlackBox::decode(encoded);

// Instance-based operations
auto blackBox = gfless::createBlackBox(identity, request);
std::string result = blackBox->encoded();
```

## Project Structure

```
gfless-cpp/
├── CMakeLists.txt          # Build configuration
├── include/gfless/         # Public headers
│   ├── gfless.h           # Main include file
│   ├── common.h           # Common utilities
│   ├── fingerprint.h      # Fingerprint management
│   ├── identity.h         # Identity management
│   ├── blackbox.h         # BlackBox encoding
│   ├── http_client.h      # HTTP client
│   └── crypto_utils.h     # Cryptographic utilities
├── src/                   # Implementation files
│   ├── common.cpp
│   ├── fingerprint.cpp
│   ├── identity.cpp
│   ├── blackbox.cpp
│   ├── http_client.cpp
│   └── crypto_utils.cpp
├── tests/                 # Test suite
│   ├── CMakeLists.txt
│   ├── test_utils.cpp
│   ├── test_crypto.cpp
│   ├── test_fingerprint.cpp
│   ├── test_blackbox.cpp
│   └── test_integration.cpp
└── examples/             # Usage examples
    ├── basic_example.cpp
    └── encrypted_example.cpp
```

## Testing

The library includes a comprehensive test suite using Google Test:

```bash
# Build and run all tests
cd build
make -j$(nproc)
ctest -V

# Run specific test suites
./gfless_tests --gtest_filter="UtilsTest.*"
./gfless_tests --gtest_filter="CryptoTest.*"
./gfless_tests --gtest_filter="IntegrationTest.*"
```

## Integration with Build Systems

### CMake (Find Package)

```cmake
find_package(gfless REQUIRED)
target_link_libraries(your_target PRIVATE gfless::gfless)
```

### CMake (FetchContent)

```cmake
include(FetchContent)
FetchContent_Declare(
    gfless
    GIT_REPOSITORY https://github.com/your-org/gfless-cpp.git
    GIT_TAG main
)
FetchContent_MakeAvailable(gfless)

target_link_libraries(your_target PRIVATE gfless)
```

### Pkg-config

```bash
# Compile with pkg-config
g++ -std=c++17 main.cpp $(pkg-config --cflags --libs gfless)
```

## Performance Considerations

- **Memory Usage**: Minimal heap allocations, efficient string handling
- **Network Timeouts**: Configurable 30-second timeout for HTTP operations
- **Thread Safety**: All classes are thread-safe for read operations
- **File I/O**: Async-safe file operations for identity persistence

## Migration from Qt Version

The C++ library maintains API compatibility with the original Qt version while providing these improvements:

- **No Qt Dependencies**: Uses standard C++ and common libraries
- **Better Performance**: Optimized memory usage and faster operations
- **Modern C++**: C++17 features, smart pointers, RAII
- **Cross-Platform**: Works on more platforms without Qt installation
- **Smaller Footprint**: Significantly smaller binary size

## Troubleshooting

### Common Issues

1. **Missing Dependencies**
   ```bash
   # Ensure all dependencies are installed
   pkg-config --modversion libcurl openssl
   ```

2. **Compilation Errors**
   ```bash
   # Check C++17 support
   g++ --version
   # Minimum: GCC 7, Clang 6, MSVC 2019
   ```

3. **Runtime Errors**
   ```bash
   # Check library path
   ldd ./your_program
   export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
   ```

4. **Network Issues**
   ```cpp
   // Enable verbose HTTP logging
   // Set environment variable: CURL_VERBOSE=1
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style

- Follow C++17 best practices
- Use `snake_case` for variables and functions
- Use `PascalCase` for classes
- Include comprehensive documentation
- Maintain backward compatibility

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Based on the original GflessClient project and the reverse engineering work by:
- [morsisko](https://github.com/morsisko) - [Nostale-Auth](https://github.com/morsisko/NosTale-Auth)
- [stdLemon](https://github.com/stdLemon) - [nostale-auth](https://github.com/stdLemon/nostale-auth)

This Qt-free port was created to provide a modern, dependency-light alternative while maintaining full compatibility with the original authentication system.