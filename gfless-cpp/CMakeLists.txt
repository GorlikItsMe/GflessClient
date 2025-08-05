cmake_minimum_required(VERSION 3.16)
project(gfless-cpp VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages - make pkg-config optional on Windows
if(WIN32)
    # On Windows, try to find packages without pkg-config first
    find_package(OpenSSL QUIET)
    find_package(CURL QUIET)
    
    # If not found, try with pkg-config (optional)
    find_package(PkgConfig QUIET)
    if(PkgConfig_FOUND)
        if(NOT OpenSSL_FOUND)
            find_package(OpenSSL REQUIRED)
        endif()
        if(NOT CURL_FOUND)
            find_package(CURL REQUIRED)
        endif()
    endif()
else()
    # On Unix-like systems, use pkg-config
    find_package(PkgConfig REQUIRED)
    find_package(OpenSSL REQUIRED)
    find_package(CURL REQUIRED)
endif()

# If OpenSSL not found, try alternative methods
if(NOT OpenSSL_FOUND)
    # Try to find OpenSSL manually
    find_path(OPENSSL_INCLUDE_DIR openssl/ssl.h
        PATHS
        "C:/OpenSSL-Win64/include"
        "C:/OpenSSL-Win32/include"
        "C:/Program Files/OpenSSL-Win64/include"
        "C:/Program Files/OpenSSL-Win32/include"
    )
    find_library(OPENSSL_SSL_LIBRARY
        NAMES libssl ssl
        PATHS
        "C:/OpenSSL-Win64/lib"
        "C:/OpenSSL-Win32/lib"
        "C:/Program Files/OpenSSL-Win64/lib"
        "C:/Program Files/OpenSSL-Win32/lib"
    )
    find_library(OPENSSL_CRYPTO_LIBRARY
        NAMES libcrypto crypto
        PATHS
        "C:/OpenSSL-Win64/lib"
        "C:/OpenSSL-Win32/lib"
        "C:/Program Files/OpenSSL-Win64/lib"
        "C:/Program Files/OpenSSL-Win32/lib"
    )
    
    if(OPENSSL_INCLUDE_DIR AND OPENSSL_SSL_LIBRARY AND OPENSSL_CRYPTO_LIBRARY)
        set(OpenSSL_FOUND TRUE)
        set(OpenSSL_INCLUDE_DIRS ${OPENSSL_INCLUDE_DIR})
        set(OpenSSL_LIBRARIES ${OPENSSL_SSL_LIBRARY} ${OPENSSL_CRYPTO_LIBRARY})
    endif()
endif()

# If CURL not found, try alternative methods
if(NOT CURL_FOUND)
    # Try to find CURL manually
    find_path(CURL_INCLUDE_DIR curl/curl.h
        PATHS
        "C:/curl/include"
        "C:/Program Files/curl/include"
        "C:/ProgramData/chocolatey/lib/curl/tools/curl-8.15.0_1-win64-mingw/include"
    )
    find_library(CURL_LIBRARY
        NAMES libcurl curl
        PATHS
        "C:/curl/lib"
        "C:/Program Files/curl/lib"
        "C:/ProgramData/chocolatey/lib/curl/tools/curl-8.15.0_1-win64-mingw/lib"
    )
    
    if(CURL_INCLUDE_DIR AND CURL_LIBRARY)
        set(CURL_FOUND TRUE)
        set(CURL_INCLUDE_DIRS ${CURL_INCLUDE_DIR})
        set(CURL_LIBRARIES ${CURL_LIBRARY})
    endif()
endif()

# Check if we have the required dependencies
if(NOT OpenSSL_FOUND)
    message(FATAL_ERROR "OpenSSL not found. Please install OpenSSL or provide the path.")
endif()

if(NOT CURL_FOUND)
    message(FATAL_ERROR "CURL not found. Please install CURL or provide the path.")
endif()

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

# Link libraries - handle both CMake targets and manual libraries
if(OpenSSL_FOUND AND TARGET OpenSSL::SSL)
    target_link_libraries(gfless PRIVATE OpenSSL::SSL OpenSSL::Crypto)
elseif(OpenSSL_FOUND)
    target_include_directories(gfless PRIVATE ${OpenSSL_INCLUDE_DIRS})
    target_link_libraries(gfless PRIVATE ${OpenSSL_LIBRARIES})
endif()

if(CURL_FOUND AND TARGET CURL::libcurl)
    target_link_libraries(gfless PRIVATE CURL::libcurl)
elseif(CURL_FOUND)
    target_include_directories(gfless PRIVATE ${CURL_INCLUDE_DIRS})
    target_link_libraries(gfless PRIVATE ${CURL_LIBRARIES})
endif()

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

# Only install the export if nlohmann_json is not fetched
if(nlohmann_json_FOUND)
    install(EXPORT gfless-targets
        FILE gfless-config.cmake
        DESTINATION lib/cmake/gfless
    )
endif()