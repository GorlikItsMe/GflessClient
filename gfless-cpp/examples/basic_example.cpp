#include "gfless/gfless.h"
#include <iostream>

int main() {
    std::cout << "Gfless C++ Library Example\n";
    std::cout << "Version: " << gfless::VERSION << "\n\n";
    
    try {
        // Create an identity (this will create identity.json if it doesn't exist)
        auto identity = gfless::createIdentity("identity.json");
        
        // Update the identity with current timestamps
        identity->update();
        
        // Create a basic blackbox
        gfless::json request = gfless::json::object();
        request["app"] = "example";
        request["version"] = "1.0";
        
        auto blackBox = gfless::createBlackBox(identity, request);
        std::string encoded = blackBox->encoded();
        
        std::cout << "Generated BlackBox:\n";
        std::cout << encoded << "\n\n";
        
        // Demonstrate decode functionality
        std::string testData = R"(["test", 123, true])";
        std::string encodedTest = gfless::BlackBox::encode(testData);
        std::string decodedTest = gfless::BlackBox::decode(encodedTest);
        
        std::cout << "Encode/Decode Test:\n";
        std::cout << "Original: " << testData << "\n";
        std::cout << "Encoded:  " << encodedTest << "\n";
        std::cout << "Decoded:  " << decodedTest << "\n\n";
        
        // Display some utility functions
        std::cout << "Utility Functions:\n";
        std::cout << "Current time (ISO): " << gfless::Utils::getCurrentTimeISO() << "\n";
        std::cout << "Current time (ms):  " << gfless::Utils::getCurrentTimeMs() << "\n";
        std::cout << "Random string:      " << gfless::Utils::randomString(16) << "\n";
        
        std::cout << "\nExample completed successfully!\n";
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}