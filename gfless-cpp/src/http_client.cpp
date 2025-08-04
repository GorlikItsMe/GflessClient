#include "gfless/http_client.h"
#include <algorithm>
#include <iostream>

namespace gfless {

HttpClient::HttpClient() 
    : curl_(nullptr)
    , proxy_enabled_(false)
    , proxy_port_(0) {
    
    curl_global_init(CURL_GLOBAL_DEFAULT);
    curl_ = curl_easy_init();
    
    if (!curl_) {
        throw std::runtime_error("Failed to initialize libcurl");
    }
}

HttpClient::~HttpClient() {
    if (curl_) {
        curl_easy_cleanup(curl_);
    }
    curl_global_cleanup();
}

void HttpClient::setProxy(const std::string& host, int port, 
                         const std::string& username, 
                         const std::string& password) {
    proxy_enabled_ = true;
    proxy_host_ = host;
    proxy_port_ = port;
    proxy_username_ = username;
    proxy_password_ = password;
}

HttpResponse HttpClient::get(const std::string& url, 
                           const std::map<std::string, std::string>& headers) {
    HttpResponse response;
    
    setupCurl(headers);
    
    curl_easy_setopt(curl_, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl_, CURLOPT_HTTPGET, 1L);
    curl_easy_setopt(curl_, CURLOPT_WRITEFUNCTION, writeCallback);
    curl_easy_setopt(curl_, CURLOPT_WRITEDATA, &response.body);
    curl_easy_setopt(curl_, CURLOPT_HEADERFUNCTION, headerCallback);
    curl_easy_setopt(curl_, CURLOPT_HEADERDATA, &response.headers);
    
    CURLcode res = curl_easy_perform(curl_);
    
    if (res != CURLE_OK) {
        response.success = false;
        response.error_message = curl_easy_strerror(res);
    } else {
        curl_easy_getinfo(curl_, CURLINFO_RESPONSE_CODE, &response.status_code);
        response.success = (response.status_code >= 200 && response.status_code < 300);
    }
    
    return response;
}

HttpResponse HttpClient::post(const std::string& url, 
                            const std::string& data,
                            const std::map<std::string, std::string>& headers) {
    HttpResponse response;
    
    setupCurl(headers);
    
    curl_easy_setopt(curl_, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl_, CURLOPT_POSTFIELDS, data.c_str());
    curl_easy_setopt(curl_, CURLOPT_POSTFIELDSIZE, data.length());
    curl_easy_setopt(curl_, CURLOPT_WRITEFUNCTION, writeCallback);
    curl_easy_setopt(curl_, CURLOPT_WRITEDATA, &response.body);
    curl_easy_setopt(curl_, CURLOPT_HEADERFUNCTION, headerCallback);
    curl_easy_setopt(curl_, CURLOPT_HEADERDATA, &response.headers);
    
    CURLcode res = curl_easy_perform(curl_);
    
    if (res != CURLE_OK) {
        response.success = false;
        response.error_message = curl_easy_strerror(res);
    } else {
        curl_easy_getinfo(curl_, CURLINFO_RESPONSE_CODE, &response.status_code);
        response.success = (response.status_code >= 200 && response.status_code < 300);
    }
    
    return response;
}

std::string HttpClient::getServerDate(const std::string& url) {
    auto response = get(url);
    
    if (response.success) {
        auto it = response.headers.find("date");
        if (it != response.headers.end()) {
            std::string date = it->second;
            // Replace "GMT" with "UTC" to match original Qt behavior
            size_t pos = date.find("GMT");
            if (pos != std::string::npos) {
                date.replace(pos, 3, "UTC");
            }
            return date;
        }
    }
    
    return "";
}

size_t HttpClient::writeCallback(void* contents, size_t size, size_t nmemb, std::string* response) {
    size_t total_size = size * nmemb;
    response->append(static_cast<char*>(contents), total_size);
    return total_size;
}

size_t HttpClient::headerCallback(void* contents, size_t size, size_t nmemb, 
                                std::map<std::string, std::string>* headers) {
    size_t total_size = size * nmemb;
    std::string header(static_cast<char*>(contents), total_size);
    
    // Remove trailing \r\n
    while (!header.empty() && (header.back() == '\r' || header.back() == '\n')) {
        header.pop_back();
    }
    
    size_t colon_pos = header.find(':');
    if (colon_pos != std::string::npos) {
        std::string key = header.substr(0, colon_pos);
        std::string value = header.substr(colon_pos + 1);
        
        // Trim whitespace
        key.erase(0, key.find_first_not_of(" \t"));
        key.erase(key.find_last_not_of(" \t") + 1);
        value.erase(0, value.find_first_not_of(" \t"));
        value.erase(value.find_last_not_of(" \t") + 1);
        
        // Convert key to lowercase for case-insensitive lookup
        std::transform(key.begin(), key.end(), key.begin(), ::tolower);
        
        (*headers)[key] = value;
    }
    
    return total_size;
}

void HttpClient::setupCurl(const std::map<std::string, std::string>& headers) {
    // Reset curl handle
    curl_easy_reset(curl_);
    
    // Set common options
    curl_easy_setopt(curl_, CURLOPT_FOLLOWLOCATION, 1L);
    curl_easy_setopt(curl_, CURLOPT_TIMEOUT, 30L);
    curl_easy_setopt(curl_, CURLOPT_USERAGENT, "gfless-cpp/1.0");
    
    // Setup proxy if enabled
    if (proxy_enabled_) {
        setupProxy();
    }
    
    // Setup headers
    struct curl_slist* header_list = nullptr;
    for (const auto& header : headers) {
        std::string header_str = header.first + ": " + header.second;
        header_list = curl_slist_append(header_list, header_str.c_str());
    }
    
    if (header_list) {
        curl_easy_setopt(curl_, CURLOPT_HTTPHEADER, header_list);
    }
}

void HttpClient::setupProxy() {
    std::string proxy_url = proxy_host_ + ":" + std::to_string(proxy_port_);
    curl_easy_setopt(curl_, CURLOPT_PROXY, proxy_url.c_str());
    curl_easy_setopt(curl_, CURLOPT_PROXYTYPE, CURLPROXY_SOCKS5);
    
    if (!proxy_username_.empty()) {
        std::string userpwd = proxy_username_ + ":" + proxy_password_;
        curl_easy_setopt(curl_, CURLOPT_PROXYUSERPWD, userpwd.c_str());
    }
}

} // namespace gfless