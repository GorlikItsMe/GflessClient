cmake_minimum_required(VERSION 3.18)
project(gfless_node_addon LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Node.js addon settings
add_definitions(-DNAPI_DISABLE_CPP_EXCEPTIONS)

# cmake-js integration
# Provides CMAKE_JS_INC and CMAKE_JS_LIB
if(NOT DEFINED CMAKE_JS_INC)
  message(STATUS "CMAKE_JS_INC not set; assuming local build via cmake-js")
endif()

# Find Qt6 or Qt5
find_package(QT NAMES Qt6 Qt5 REQUIRED COMPONENTS Core Network)
find_package(Qt${QT_VERSION_MAJOR} REQUIRED COMPONENTS Core Network)

# ZLIB
find_package(ZLIB REQUIRED)

# Qt resources (certs)
set(QRC_FILE ${CMAKE_CURRENT_SOURCE_DIR}/../Launcher/resources.qrc)
if(${QT_VERSION_MAJOR} EQUAL 6)
  qt_add_resources(APP_RESOURCES ${QRC_FILE})
else()
  qt5_add_resources(APP_RESOURCES ${QRC_FILE})
endif()

# Include paths
include_directories(
  ${CMAKE_JS_INC}
  ${CMAKE_CURRENT_SOURCE_DIR}
  ${CMAKE_CURRENT_SOURCE_DIR}/../Launcher/src
  ${CMAKE_CURRENT_SOURCE_DIR}/../Launcher/src/auth
  ${CMAKE_CURRENT_SOURCE_DIR}/node_modules/node-addon-api
)

# Sources from Launcher core (no GUI)
set(LAUNCHER_CORE_SOURCES
  ${CMAKE_CURRENT_SOURCE_DIR}/../Launcher/src/auth/nostaleauth.cpp
  ${CMAKE_CURRENT_SOURCE_DIR}/../Launcher/src/auth/blackbox.cpp
  ${CMAKE_CURRENT_SOURCE_DIR}/../Launcher/src/auth/fingerprint.cpp
  ${CMAKE_CURRENT_SOURCE_DIR}/../Launcher/src/auth/identity.cpp
  ${CMAKE_CURRENT_SOURCE_DIR}/../Launcher/src/syncnetworkaccessmanager.cpp
)

# Node addon binding
set(BINDING_SOURCES
  ${CMAKE_CURRENT_SOURCE_DIR}/binding.cpp
)

add_library(gfless MODULE
  ${BINDING_SOURCES}
  ${LAUNCHER_CORE_SOURCES}
  ${APP_RESOURCES}
)

# Ensure correct .node filename
set_target_properties(gfless PROPERTIES PREFIX "" SUFFIX ".node")

# Define macro for conditional code paths in core sources
target_compile_definitions(gfless PRIVATE GFLESS_NODE_BINDING=1)

# Link with Node and Qt
# CMAKE_JS_LIB is provided by cmake-js
if(DEFINED CMAKE_JS_LIB AND CMAKE_JS_LIB)
  target_link_libraries(gfless PRIVATE ${CMAKE_JS_LIB})
endif()

target_link_libraries(gfless PRIVATE Qt${QT_VERSION_MAJOR}::Core Qt${QT_VERSION_MAJOR}::Network ZLIB::ZLIB)

# Enable automoc for Qt meta-object code
set_target_properties(gfless PROPERTIES AUTOMOC ON AUTORCC ON AUTOUIC ON)

# Export compile defs for Qt