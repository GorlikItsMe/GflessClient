cmake_minimum_required(VERSION 3.16)
project(gfless-cpp VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Set runtime library to static for compatibility with node-addon-api
if(MSVC)
    set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
endif()

# Find required packages
find_package(OpenSSL REQUIRED)
find_package(CURL REQUIRED)

# Try to find nlohmann/json, fallback to FetchContent if not found
find_package(nlohmann_json 3.12.0 QUIET)
if(NOT nlohmann_json_FOUND)
    include(FetchContent)
    FetchContent_Declare(
        nlohmann_json
        GIT_REPOSITORY https://github.com/nlohmann/json.git
        GIT_TAG v3.11.3
    )
    FetchContent_MakeAvailable(nlohmann_json)
endif()

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
target_link_libraries(gfless PRIVATE 
    OpenSSL::SSL 
    OpenSSL::Crypto 
    CURL::libcurl
    nlohmann_json::nlohmann_json
)

# Set include directories for the target
target_include_directories(gfless 
    PUBLIC 
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)

# Also expose nlohmann/json include directories
if(TARGET nlohmann_json::nlohmann_json)
    target_include_directories(gfless PUBLIC $<TARGET_PROPERTY:nlohmann_json::nlohmann_json,INTERFACE_INCLUDE_DIRECTORIES>)
endif()

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

# Install the export
install(EXPORT gfless-targets
    FILE gfless-config.cmake
    DESTINATION lib/cmake/gfless
)