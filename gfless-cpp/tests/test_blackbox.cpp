#include <gtest/gtest.h>
#include "gfless/gfless.h"
#include <fstream>
#include <filesystem>

using namespace gfless;

class BlackBoxTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Create a temporary identity file for testing
        testIdentityFile = "/tmp/test_identity.json";
        
        json testFp = json::object();
        testFp["v"] = 7;
        testFp["creation"] = "2024-01-01T00:00:00.000Z";
        testFp["vector"] = Utils::base64Encode("test_vector_data 1704067200000");
        testFp["d"] = 200;
        testFp["uuid"] = "test-uuid";
        testFp["userAgent"] = "test-agent";
        
        std::ofstream file(testIdentityFile);
        file << testFp.dump();
        file.close();
        
        identity = createIdentity(testIdentityFile);
    }
    
    void TearDown() override {
        // Clean up test file
        if (std::filesystem::exists(testIdentityFile)) {
            std::filesystem::remove(testIdentityFile);
        }
    }
    
    std::string testIdentityFile;
    std::shared_ptr<Identity> identity;
};

TEST_F(BlackBoxTest, ConstructorTest) {
    json request = json::object();
    request["test"] = "value";
    
    auto blackBox = createBlackBox(identity, request);
    
    EXPECT_NE(blackBox, nullptr);
    EXPECT_EQ(identity->getFingerprint().getJson()["request"]["test"], "value");
}

TEST_F(BlackBoxTest, EncodedTest) {
    auto blackBox = createBlackBox(identity);
    std::string encoded = blackBox->encoded();
    
    EXPECT_FALSE(encoded.empty());
    EXPECT_EQ(encoded.substr(0, 4), "tra:"); // Should start with "tra:"
}

TEST_F(BlackBoxTest, EncodeDecodeRoundTripTest) {
    std::string testData = "[1,2,3,\"test\"]";
    
    std::string encoded = BlackBox::encode(testData);
    std::string decoded = BlackBox::decode(encoded);
    
    EXPECT_FALSE(encoded.empty());
    EXPECT_FALSE(decoded.empty());
    EXPECT_EQ(encoded.substr(0, 4), "tra:");
}

TEST_F(BlackBoxTest, EncryptedBlackBoxTest) {
    std::string accountId = "test-account";
    std::string gsid = "test-session-12345";
    std::string installationId = "test-installation";
    
    auto encryptedBox = createEncryptedBlackBox(identity, accountId, gsid, installationId);
    std::string encrypted = encryptedBox->encrypted();
    
    EXPECT_FALSE(encrypted.empty());
    EXPECT_NE(encrypted.find("="), std::string::npos); // Base64 might have padding
}

TEST_F(BlackBoxTest, EncryptedBlackBoxRequestTest) {
    std::string accountId = "test-account";
    std::string gsid = "test-session-12345";
    std::string installationId = "test-installation";
    
    auto encryptedBox = createEncryptedBlackBox(identity, accountId, gsid, installationId);
    
    json fingerprint = identity->getFingerprint().getJson();
    json request = fingerprint["request"];
    
    EXPECT_FALSE(request.empty());
    EXPECT_EQ(request["installation"], installationId);
    EXPECT_EQ(request["session"], "test-session"); // Should extract before last dash
    EXPECT_TRUE(request.contains("features"));
    EXPECT_TRUE(request["features"].is_array());
}