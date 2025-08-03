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
        "src/nostale_types.cpp",
        "src/fingerprint_simple.cpp",
        "src/blackbox_simple.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "src"
      ],
      "libraries": [],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "defines": [ 
        "NAPI_DISABLE_CPP_EXCEPTIONS",
        "NOSTALE_BINDINGS_BUILD"
      ],
      "conditions": [
        ["OS=='win'", {
          "defines": [
            "_WIN32_WINNT=0x0601"
          ],
          "libraries": [
            "-lcurl",
            "-lssl",
            "-lcrypto"
          ]
        }],
        ["OS=='linux'", {
          "cflags_cc": [
            "-std=c++17"
          ],
          "libraries": [
            "-lcurl",
            "-lssl",
            "-lcrypto"
          ]
        }],
        ["OS=='mac'", {
          "cflags_cc": [
            "-std=c++17"
          ],
          "libraries": [
            "-lcurl",
            "-lssl",
            "-lcrypto"
          ]
        }]
      ]
    }
  ]
}