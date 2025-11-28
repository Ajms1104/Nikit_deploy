package com.example.demo.service;

import com.example.demo.controller.party.dto.PartyListResponse; // DTO 재활용 혹은 새로 생성
import com.example.demo.global.util.DistanceCalculator;
import com.example.demo.repository.StoreRepository;
import com.example.demo.repository.entity.Store;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final DistanceCalculator distanceCalculator;

    // 내 주변 매장 조회 (가까운 순 정렬)
    @Transactional(readOnly = true)
    public List<StoreResponse> getNearbyStores(Double lat, Double lng) {
        List<Store> allStores = storeRepository.findAll();

        if (lat == null || lng == null) {
            return allStores.stream()
                .map(store -> new StoreResponse(store, 0.0))
                .collect(Collectors.toList());
        }

        return allStores.stream()
            .map(store -> {
                double dist = distanceCalculator.calculateDistance(lat, lng, store.getLat(), store.getLng());
                return new StoreResponse(store, dist);
            })
            .sorted((s1, s2) -> Double.compare(s1.getDistance(), s2.getDistance()))
            .collect(Collectors.toList());
    }

    // 간단한 내부 DTO
    @Getter
    public static class StoreResponse {
        private String name;
        private double distance;

        public StoreResponse(Store store, double distance) {
            this.name = store.getName();
            this.distance = Math.round(distance * 10) / 10.0;
        }
    }
}