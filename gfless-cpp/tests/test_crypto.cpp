#include <gtest/gtest.h>
#include "gfless/crypto_utils.h"

using namespace gfless;

class CryptoTest : public ::testing::Test {
protected:
    void SetUp() override {}
    void TearDown() override {}
};

TEST_F(CryptoTest, SHA512Test) {
    std::string input = "Hello, World!";
    std::string hash = CryptoUtils::sha512(input);
    std::string hashHex = CryptoUtils::sha512Hex(input);
    
    EXPECT_EQ(hash.length(), 64); // SHA512 produces 64 bytes
    EXPECT_EQ(hashHex.length(), 128); // Hex representation is 2 chars per byte
    EXPECT_FALSE(hashHex.empty());
    
    // Hash should be deterministic
    std::string hash2 = CryptoUtils::sha512(input);
    EXPECT_EQ(hash, hash2);
}

TEST_F(CryptoTest, SHA512EmptyStringTest) {
    std::string empty = "";
    std::string hash = CryptoUtils::sha512Hex(empty);
    
    EXPECT_FALSE(hash.empty());
    EXPECT_EQ(hash.length(), 128);
}

TEST_F(CryptoTest, XOREncryptDecryptTest) {
    std::string plaintext = "This is a secret message!";
    std::string key = "mySecretKey123";
    
    std::string encrypted = CryptoUtils::xorEncrypt(plaintext, key);
    std::string decrypted = CryptoUtils::xorDecrypt(encrypted, key);
    
    EXPECT_EQ(plaintext, decrypted);
    EXPECT_NE(plaintext, encrypted); // Should be different when encrypted
}

TEST_F(CryptoTest, XOREncryptEmptyKeyTest) {
    std::string plaintext = "test";
    std::string emptyKey = "";
    
    EXPECT_THROW(CryptoUtils::xorEncrypt(plaintext, emptyKey), std::invalid_argument);
}

TEST_F(CryptoTest, ToHexFromHexTest) {
    std::string original = "Hello World";
    std::string hex = CryptoUtils::toHex(original);
    std::string decoded = CryptoUtils::fromHex(hex);
    
    EXPECT_EQ(original, decoded);
    EXPECT_NE(original, hex);
    EXPECT_EQ(hex.length(), original.length() * 2); // Each byte becomes 2 hex chars
}

TEST_F(CryptoTest, FromHexInvalidLengthTest) {
    std::string invalidHex = "abc"; // Odd number of characters
    
    EXPECT_THROW(CryptoUtils::fromHex(invalidHex), std::invalid_argument);
}