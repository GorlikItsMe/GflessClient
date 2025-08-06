#include <gtest/gtest.h>
#include "gfless/gfless.h"
#include <fstream>
#include <filesystem>
#include <testtools.h>

using namespace gfless;

class BlackBoxTest : public ::testing::Test {
protected:
    void SetUp() override {
        testIdentityFilePath = TestTools::createExampleIdentityFile();        
        identity = createIdentity(testIdentityFilePath);

		exampleIdentityJson = TestTools::getExampleIdentityJson().dump();
    }
    
    void TearDown() override {
        // Clean up test file
        TestTools::cleanupTestFolder();
    }
    
    std::string testIdentityFilePath;
    std::shared_ptr<Identity> identity;
    std::string exampleIdentityJson;
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
    std::string testData = exampleIdentityJson;
	EXPECT_FALSE(testData.empty());

    auto fingerprintObj = json::parse(testData);

    std::string encoded = BlackBox::encode(fingerprintObj);
    EXPECT_FALSE(encoded.empty());
    EXPECT_EQ(encoded.substr(0, 4), "tra:");

    std::string decoded = BlackBox::decode(encoded);    
    EXPECT_FALSE(decoded.empty());
}

TEST_F(BlackBoxTest, EncryptedBlackBoxTest) {
    std::string accountId = "test-account";
    std::string gsid = "test-session-12345";
    std::string installationId = "test-installation";
    
    auto encryptedBox = createEncryptedBlackBox(identity, accountId, gsid, installationId);
    std::string encrypted = encryptedBox->encrypted();
    
    EXPECT_FALSE(encrypted.empty());
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