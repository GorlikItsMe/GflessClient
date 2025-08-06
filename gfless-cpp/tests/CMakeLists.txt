# Test executable
add_executable(gfless_tests
    test_utils.cpp
    test_crypto.cpp
    test_fingerprint.cpp
    test_blackbox.cpp
    test_integration.cpp
 "testtools.cpp" "testtools.h")

# Link test executable with the library and gtest
target_link_libraries(gfless_tests
    PRIVATE
    gfless
    gtest
    gtest_main
)

# Include test directory
target_include_directories(gfless_tests 
    PRIVATE 
    ${CMAKE_CURRENT_SOURCE_DIR}
)

# Add tests to CTest
include(GoogleTest)
gtest_discover_tests(gfless_tests)