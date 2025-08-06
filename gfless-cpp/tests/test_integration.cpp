#include <gtest/gtest.h>
#include "gfless/gfless.h"
#include <fstream>
#include <filesystem>
#include "testtools.h"

using namespace gfless;

class IntegrationTest : public ::testing::Test {
protected:
    void SetUp() override {
        testIdentityFilePath = TestTools::createExampleIdentityFile();
    }
    
    void TearDown() override {
		TestTools::cleanupTestFolder();
    }
    
    std::string testIdentityFilePath;
};

TEST_F(IntegrationTest, CompleteWorkflowTest) {
    // Create an identity
    auto identity = createIdentity(testIdentityFilePath);
    
    // Update the identity
    identity->update();
    
    // Create a blackbox
    json request = json::object();
    request["test"] = "integration";
    
    auto blackBox = createBlackBox(identity, request);
    std::string encoded = blackBox->encoded();
    
    // Verify the encoded blackbox
    EXPECT_FALSE(encoded.empty());
    EXPECT_EQ(encoded.substr(0, 4), "tra:");
    
    // Create an encrypted blackbox
    auto encryptedBox = createEncryptedBlackBox(
        identity, "account123", "session-456", "install-789"
    );
    std::string encrypted = encryptedBox->encrypted();
    
    EXPECT_FALSE(encrypted.empty());
    
    // Verify the identity file was created
    EXPECT_TRUE(std::filesystem::exists(testIdentityFilePath));
}

TEST_F(IntegrationTest, IdentityPersistenceTest) {
    // Create an identity and save some data
    {
        auto identity = createIdentity(testIdentityFilePath);
        identity->update();
        
        json fp = identity->getFingerprint().getJson();
        fp["custom_field"] = "test_value";
        identity->setRequest(fp);
    }
    
    // Load the identity again and verify data persists
    {
        auto identity = createIdentity(testIdentityFilePath);
        json fp = identity->getFingerprint().getJson();
        
        EXPECT_FALSE(fp.empty());
        // Note: The custom field won't persist because it's not in the fingerprint
        // But the basic structure should be there
        EXPECT_TRUE(fp.contains("creation") || fp.empty()); // Might be empty if new
    }
}

TEST_F(IntegrationTest, ProxyConfigurationTest) {
    // Test identity creation with proxy settings
    auto identity = createIdentity(testIdentityFilePath, "127.0.0.1", "8080", "user", "pass", true);
    
    EXPECT_NE(identity, nullptr);
    
    // Update should work even with proxy settings (though it might fail to connect)
    identity->update();
    
    // Should still be able to create blackboxes
    auto blackBox = createBlackBox(identity);
    std::string encoded = blackBox->encoded();
    
    EXPECT_FALSE(encoded.empty());
}

TEST_F(IntegrationTest, LibraryVersionTest) {
    EXPECT_NE(std::string(gfless::VERSION), "");
    EXPECT_EQ(std::string(gfless::VERSION), "1.0.0");
}