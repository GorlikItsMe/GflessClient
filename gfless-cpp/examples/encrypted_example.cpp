#include "gfless/gfless.h"
#include <iostream>

int main() {
    std::cout << "Gfless Encrypted BlackBox Example\n";
    std::cout << "Version: " << gfless::VERSION << "\n\n";
    
    try {
        // Create an identity with proxy settings (optional)
        auto identity = gfless::createIdentity(
            "encrypted_identity.json",
            "127.0.0.1",     // proxy IP (example)
            "8080",          // proxy port
            "username",      // proxy username
            "password",      // proxy password
            false            // disable proxy for this example
        );
        
        // Update the identity
        identity->update();
        
        // Authentication parameters (these would come from your login process)
        std::string accountId = "example_account_123";
        std::string gsid = "gameforge_session_id_456789";
        std::string installationId = "installation_id_abc123";
        
        // Create an encrypted blackbox for authentication
        auto encryptedBox = gfless::createEncryptedBlackBox(
            identity, accountId, gsid, installationId
        );
        
        std::string encrypted = encryptedBox->encrypted();
        
        std::cout << "Generated Encrypted BlackBox:\n";
        std::cout << encrypted << "\n\n";
        
        // Show the fingerprint data
        gfless::json fingerprint = identity->getFingerprint().getJson();
        std::cout << "Fingerprint data:\n";
        std::cout << "Creation time: " << fingerprint.value("creation", "N/A") << "\n";
        std::cout << "Version: " << fingerprint.value("v", 0) << "\n";
        std::cout << "Timing delay: " << fingerprint.value("d", 0) << "ms\n";
        
        if (fingerprint.contains("request")) {
            gfless::json request = fingerprint["request"];
            std::cout << "\nRequest data:\n";
            std::cout << "Installation: " << request.value("installation", "N/A") << "\n";
            std::cout << "Session: " << request.value("session", "N/A") << "\n";
            
            if (request.contains("features") && request["features"].is_array()) {
                std::cout << "Features: " << request["features"].size() << " items\n";
            }
        }
        
        // Demonstrate crypto utilities
        std::cout << "\nCrypto Utilities:\n";
        std::string testMessage = "Hello, Gameforge!";
        std::string hash = gfless::CryptoUtils::sha512Hex(testMessage);
        std::cout << "SHA512 of '" << testMessage << "':\n";
        std::cout << hash.substr(0, 32) << "...\n"; // Show first 32 chars
        
        std::cout << "\nEncrypted example completed successfully!\n";
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}