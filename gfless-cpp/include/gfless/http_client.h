#pragma once

#include "common.h"
#include <curl/curl.h>

namespace gfless {

struct HttpResponse {
    long status_code = 0;
    std::string body;
    std::map<std::string, std::string> headers;
    bool success = false;
    std::string error_message;
};

class HttpClient {
public:
    HttpClient();
    ~HttpClient();
    
    // Disable copy constructor and assignment operator
    HttpClient(const HttpClient&) = delete;
    HttpClient& operator=(const HttpClient&) = delete;
    
    // Set proxy configuration
    void setProxy(const std::string& host, int port, 
                 const std::string& username = "", 
                 const std::string& password = "");
    
    // HTTP methods
    HttpResponse get(const std::string& url, 
                    const std::map<std::string, std::string>& headers = {});
    
    HttpResponse post(const std::string& url, 
                     const std::string& data,
                     const std::map<std::string, std::string>& headers = {});
    
    // Get server date from response headers
    std::string getServerDate(const std::string& url);
    
private:
    CURL* curl_;
    bool proxy_enabled_;
    std::string proxy_host_;
    int proxy_port_;
    std::string proxy_username_;
    std::string proxy_password_;
    
    // Callback functions for libcurl
    static size_t writeCallback(void* contents, size_t size, size_t nmemb, std::string* response);
    static size_t headerCallback(void* contents, size_t size, size_t nmemb, std::map<std::string, std::string>* headers);
    
    // Helper methods
    void setupCurl(const std::map<std::string, std::string>& headers);
    void setupProxy();
};

} // namespace gfless