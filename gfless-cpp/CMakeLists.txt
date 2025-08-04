cmake_minimum_required(VERSION 3.16)
project(gfless-cpp VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(PkgConfig REQUIRED)
find_package(OpenSSL REQUIRED)

# Find libcurl
find_package(CURL REQUIRED)

# Try to find nlohmann/json
find_package(nlohmann_json QUIET)
if(NOT nlohmann_json_FOUND)
    # Fallback: include nlohmann/json as header-only
    include(FetchContent)
    FetchContent_Declare(
        nlohmann_json
        GIT_REPOSITORY https://github.com/nlohmann/json.git
        GIT_TAG v3.11.3
    )
    FetchContent_MakeAvailable(nlohmann_json)
endif()

# Include directories
include_directories(include)

# Source files
set(SOURCES
    src/common.cpp
    src/fingerprint.cpp
    src/identity.cpp
    src/blackbox.cpp
    src/http_client.cpp
    src/crypto_utils.cpp
)

# Create library
add_library(gfless STATIC ${SOURCES})

# Link libraries
target_link_libraries(gfless 
    PRIVATE 
    OpenSSL::SSL 
    OpenSSL::Crypto
    CURL::libcurl
)

if(nlohmann_json_FOUND)
    target_link_libraries(gfless PRIVATE nlohmann_json::nlohmann_json)
else()
    target_link_libraries(gfless PRIVATE nlohmann_json)
endif()

# Set include directories for the target
target_include_directories(gfless 
    PUBLIC 
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)

# Enable testing
enable_testing()
option(BUILD_TESTING "Build tests" ON)

if(BUILD_TESTING)
    # Find Google Test
    find_package(GTest QUIET)
    if(NOT GTest_FOUND)
        include(FetchContent)
        FetchContent_Declare(
            googletest
            GIT_REPOSITORY https://github.com/google/googletest.git
            GIT_TAG v1.14.0
        )
        FetchContent_MakeAvailable(googletest)
    endif()
    
    add_subdirectory(tests)
endif()

# Examples
option(BUILD_EXAMPLES "Build examples" ON)
if(BUILD_EXAMPLES)
    add_subdirectory(examples)
endif()

# Installation
install(TARGETS gfless
    EXPORT gfless-targets
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
    RUNTIME DESTINATION bin
)

install(DIRECTORY include/ DESTINATION include)

install(EXPORT gfless-targets
    FILE gfless-config.cmake
    DESTINATION lib/cmake/gfless
)