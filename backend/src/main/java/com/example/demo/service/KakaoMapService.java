package com.example.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KakaoMapService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    @Value("${kakao.api.base-url}")
    private String kakaoBaseUrl;

    // 키워드로 장소 검색
    public Map<String, Object> searchPlaces(String keyword) {
        try {
            URI uri = UriComponentsBuilder
                .fromUriString(kakaoBaseUrl + "/v2/local/search/keyword.json")
                .queryParam("query", keyword)
                .build()
                .toUri();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoApiKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response =
                restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode root = objectMapper.readTree(response.getBody());
                Map<String, Object> result = new HashMap<>();
                result.put("places", root.get("documents"));
                return result;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new HashMap<>();
    }
}