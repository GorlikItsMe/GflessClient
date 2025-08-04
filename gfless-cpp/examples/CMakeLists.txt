# Basic example
add_executable(basic_example basic_example.cpp)
target_link_libraries(basic_example PRIVATE gfless)

# Encrypted blackbox example
add_executable(encrypted_example encrypted_example.cpp)
target_link_libraries(encrypted_example PRIVATE gfless)