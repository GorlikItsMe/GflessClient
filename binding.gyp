{
  "targets": [
    {
      "target_name": "nostale_auth",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [
        "src/binding.cpp",
        "src/fingerprint_wrapper.cpp",
        "src/blackbox_wrapper.cpp",
        "src/identity_wrapper.cpp",
        "Launcher/src/auth/fingerprint.cpp",
        "Launcher/src/auth/blackbox.cpp",
        "Launcher/src/auth/identity.cpp",
        "Launcher/src/syncnetworkaccessmanager.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "Launcher/src",
        "Launcher/src/auth",
        "src",
        "<!@(pkg-config --cflags-only-I Qt5Core Qt5Network | sed s/-I//g)",
      ],
      "libraries": [
        "<!@(pkg-config --libs Qt5Core Qt5Network)"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "defines": [ 
        "NAPI_DISABLE_CPP_EXCEPTIONS",
        "QT_NO_DEBUG_OUTPUT"
      ],
      "conditions": [
        ["OS=='win'", {
          "include_dirs": [
            "$(QTDIR)/include",
            "$(QTDIR)/include/QtCore",
            "$(QTDIR)/include/QtNetwork"
          ],
          "libraries": [
            "-l$(QTDIR)/lib/Qt5Core",
            "-l$(QTDIR)/lib/Qt5Network"
          ],
          "defines": [
            "_WIN32_WINNT=0x0601"
          ]
        }],
        ["OS=='linux'", {
          "cflags_cc": [
            "-std=c++17",
            "<!@(pkg-config --cflags Qt5Core Qt5Network)"
          ]
        }],
        ["OS=='mac'", {
          "cflags_cc": [
            "-std=c++17"
          ],
          "include_dirs": [
            "/usr/local/opt/qt5/include",
            "/usr/local/opt/qt5/include/QtCore",
            "/usr/local/opt/qt5/include/QtNetwork"
          ],
          "libraries": [
            "-L/usr/local/opt/qt5/lib",
            "-lQt5Core",
            "-lQt5Network"
          ]
        }]
      ]
    }
  ]
}