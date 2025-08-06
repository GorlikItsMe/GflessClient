#include "gfless/common.h"
#include "testtools.h"
#include <nlohmann/json.hpp>

using namespace gfless;

json TestTools::getExampleIdentityJson() {
        json testFp = json::object();
        // This data is randomly generated for testing purposes
        // The values arent real, just placeholders
        testFp["v"] = 11;
        testFp["tz"] = "America/Los_Angeles";
        testFp["osType"] = "Windows";
        testFp["app"] = "Chrome";
        testFp["vendor"] = "Google Inc.";
        testFp["mem"] = 4;
        testFp["con"] = 4;
        testFp["lang"] = "en-US,en";
        testFp["plugins"] = "5fd924625f6ab16a19cc9807c7c506ae1813490e4ba675f843d5a10e0baacdb8"; // SHA256
        testFp["gpu"] = "Google Inc.,Google SwiftShader";
        testFp["fonts"] = "aebe62e61ad1d2c1b4290dd3800e8fd808cba781e4024af4fd3937046f0e7d1e"; // SHA256
        testFp["audioC"] = "cbd9caff4cdb458d784b885a404a0d7e375773379356c9fc766de3f8c22df85d"; // SHA256
        testFp["width"] = 1920;
        testFp["height"] = 1032;
        testFp["video"] = "f5c5fc31a0d33cd39b57999a95d061fde3cb35149ac1c75968e3c4ad7d01ccb3"; // SHA256
        testFp["audio"] = "78287572161948d0324fb6e95bdeb01b80376f4f8ba098bc5df31b6b0461c8d4"; // SHA256
        testFp["media"] = "bda31552afc63c03ba264914f72fe82443647682be3cabee6aa1e502f0d55790"; // SHA256
        testFp["permissions"] = "05a48af25771bdb8d5a8a3362bd203d2794b25fa128458266b0bb664354189ec"; // SHA256
        testFp["audioFP"] = 124.0034474653739;
        testFp["webglFP"] = "947fc00bc172b92d91bdae982ccac5449bfcf75387a8ef4fb2cea9063d021bbb"; // SHA256
        testFp["canvasFP"] = 1677023211;
        testFp["creation"] = "2025-08-06T16:17:32.319Z";
        testFp["uuid"] = "2dkxlcng40vrf0odjeqwg0qpg8m"; // idk
        testFp["d"] = 230;
        testFp["osVersion"] = 10;
        testFp["vector"] = Utils::base64Encode("put_random_characters_here 1704067200000");
        testFp["userAgent"] = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36";
        testFp["serverTimeInMS"] = "2025-08-06T17:17:33.000Z";
        testFp["request"] = NULL;
        return testFp;
}

std::string TestTools::createExampleIdentityFile() {
    // Create a temporary identity file for testing
    std::string testDir = "/tmp/gfless_test";
    std::filesystem::create_directories(testDir);
    std::string identityFile = testDir + "/identity.json";

    json testFp = TestTools::getExampleIdentityJson();

    std::ofstream file(identityFile);
    file << testFp.dump();
    file.close();
	return identityFile;
}

void TestTools::cleanupTestFolder() {
    // Clean up the test directory
    std::string testDir = "/tmp/gfless_test";
    if (std::filesystem::exists(testDir)) {
        std::filesystem::remove_all(testDir);
    }
}
