#include <gtest/gtest.h>
#include "gfless/fingerprint.h"

using namespace gfless;

class FingerprintTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Create a test fingerprint with some basic data
        testFp = json::object();
        testFp["v"] = 7;
        testFp["creation"] = "2024-01-01T00:00:00.000Z";
        testFp["vector"] = Utils::base64Encode("test_vector_data 1704067200000");
        testFp["d"] = 200;
    }
    
    void TearDown() override {}
    
    json testFp;
};

TEST_F(FingerprintTest, ConstructorTest) {
    Fingerprint fp(testFp);
    
    json result = fp.getJson();
    EXPECT_EQ(result["v"], 7);
    EXPECT_EQ(result["creation"], "2024-01-01T00:00:00.000Z");
}

TEST_F(FingerprintTest, ToStringTest) {
    Fingerprint fp(testFp);
    
    std::string jsonStr = fp.toString();
    EXPECT_FALSE(jsonStr.empty());
    
    // Should be valid JSON
    json parsed = json::parse(jsonStr);
    EXPECT_EQ(parsed["v"], 7);
}

TEST_F(FingerprintTest, UpdateCreationTest) {
    Fingerprint fp(testFp);
    
    std::string oldCreation = fp.getJson()["creation"];
    std::this_thread::sleep_for(std::chrono::milliseconds(10));
    
    fp.updateCreation();
    std::string newCreation = fp.getJson()["creation"];
    
    EXPECT_NE(oldCreation, newCreation);
    EXPECT_FALSE(newCreation.empty());
}

TEST_F(FingerprintTest, UpdateTimingsTest) {
    Fingerprint fp(testFp);
    
    fp.updateTimings();
    int timing = fp.getJson()["d"];
    
    EXPECT_GE(timing, 150);
    EXPECT_LE(timing, 300);
}

TEST_F(FingerprintTest, UpdateVectorTest) {
    Fingerprint fp(testFp);
    
    std::string oldVector = fp.getJson()["vector"];
    fp.updateVector();
    std::string newVector = fp.getJson()["vector"];
    
    EXPECT_FALSE(newVector.empty());
    // Vector should contain timestamp, so it should be different
    EXPECT_NE(oldVector, newVector);
}

TEST_F(FingerprintTest, SetRequestTest) {
    Fingerprint fp(testFp);
    
    json request = json::object();
    request["test"] = "value";
    
    fp.setRequest(request);
    
    json result = fp.getJson();
    EXPECT_EQ(result["request"]["test"], "value");
}