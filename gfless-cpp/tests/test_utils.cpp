#include <gtest/gtest.h>
#include "gfless/common.h"

using namespace gfless;

class UtilsTest : public ::testing::Test {
protected:
    void SetUp() override {}
    void TearDown() override {}
};

TEST_F(UtilsTest, Base64EncodeDecodeTest) {
    std::string original = "Hello, World!";
    std::string encoded = Utils::base64Encode(original);
    std::string decoded = Utils::base64Decode(encoded);
    
    EXPECT_EQ(original, decoded);
    EXPECT_EQ(encoded, "SGVsbG8sIFdvcmxkIQ==");
}

TEST_F(UtilsTest, Base64EmptyStringTest) {
    std::string empty = "";
    std::string encoded = Utils::base64Encode(empty);
    std::string decoded = Utils::base64Decode(encoded);
    
    EXPECT_EQ(empty, decoded);
    EXPECT_EQ(encoded, "");
}

TEST_F(UtilsTest, UrlEncodeDecodeTest) {
    std::string original = "Hello World!@#$%^&*()";
    std::string encoded = Utils::urlEncode(original);
    std::string decoded = Utils::urlDecode(encoded);
    
    EXPECT_EQ(original, decoded);
    EXPECT_NE(original, encoded); // Should be different when encoded
}

TEST_F(UtilsTest, RandomStringTest) {
    std::string str1 = Utils::randomString(10);
    std::string str2 = Utils::randomString(10);
    
    EXPECT_EQ(str1.length(), 10);
    EXPECT_EQ(str2.length(), 10);
    EXPECT_NE(str1, str2); // Should be different (extremely unlikely to be same)
}

TEST_F(UtilsTest, RandomAsciiCharTest) {
    char c = Utils::randomAsciiChar();
    EXPECT_GE(c, 32);  // Printable ASCII range
    EXPECT_LE(c, 125);
}

TEST_F(UtilsTest, CurrentTimeTest) {
    int64_t time1 = Utils::getCurrentTimeMs();
    std::this_thread::sleep_for(std::chrono::milliseconds(10));
    int64_t time2 = Utils::getCurrentTimeMs();
    
    EXPECT_GT(time2, time1);
    EXPECT_LT(time2 - time1, 100); // Should be within reasonable range
}

TEST_F(UtilsTest, CurrentTimeISOTest) {
    std::string iso_time = Utils::getCurrentTimeISO();
    
    EXPECT_FALSE(iso_time.empty());
    EXPECT_GT(iso_time.length(), 20); // ISO time should be reasonably long
    EXPECT_NE(iso_time.find('T'), std::string::npos); // Should contain 'T'
    EXPECT_NE(iso_time.find('Z'), std::string::npos); // Should end with 'Z'
}