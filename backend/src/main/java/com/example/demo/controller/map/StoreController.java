package com.example.demo.controller.map;

import com.example.demo.global.common.ApiResponse;
import com.example.demo.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    // 내 주변 매장 목록 (가까운 순)
    @GetMapping("/nearby")
    public ApiResponse<List<StoreService.StoreResponse>> getNearbyStores(
        @RequestParam(required = false) Double lat,
        @RequestParam(required = false) Double lng) {
        return ApiResponse.success(storeService.getNearbyStores(lat, lng));
    }
}