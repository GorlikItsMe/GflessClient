#pragma once
#include "gfless/common.h"
#include "testtools.h"
#include <nlohmann/json.hpp>

using namespace gfless;

class TestTools {
public:
    static json getExampleIdentityJson();
	static std::string createExampleIdentityFile();
	static void cleanupTestFolder();
};

