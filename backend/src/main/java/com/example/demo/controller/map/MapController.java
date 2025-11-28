package com.example.demo.controller.map;

import com.example.demo.global.common.ApiResponse;
import com.example.demo.service.KakaoMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/map")
@RequiredArgsConstructor
public class MapController {

    private final KakaoMapService kakaoMapService;

    // 1. 키워드 검색 (프론트에서 "코스트코" 검색할 때 사용)
    @GetMapping("/search")
    public ApiResponse<Map<String, Object>> search(@RequestParam String keyword) {
        return ApiResponse.success(kakaoMapService.searchPlaces(keyword));
    }
}