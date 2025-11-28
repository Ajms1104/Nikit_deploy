package com.example.demo.service;

import com.example.demo.controller.party.dto.*;
import com.example.demo.global.util.DistanceCalculator; // 아까 만든 계산기
import com.example.demo.repository.*;
import com.example.demo.repository.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartyService {

    private final PartyRepository partyRepository;
    private final PartyMemberRepository partyMemberRepository;
    private final UserRepository userRepository;

    // ▼ 추가된 의존성 (여기가 중요!)
    private final StoreRepository storeRepository;
    private final DistanceCalculator distanceCalculator;

    // ... createParty, joinParty 등 다른 메서드는 그대로 두세요 ...

    // [수정됨] 파티 목록 조회 (위치 기반 필터링)
    @Transactional(readOnly = true)
    public List<PartyListResponse> getPartyList(Double myLat, Double myLng) {
        List<Party> allParties = partyRepository.findAllByOrderByIdDesc();

        // 1. 위치 정보가 안 넘어왔으면? -> 그냥 거리 0으로 해서 다 보여줌
        if (myLat == null || myLng == null) {
            return allParties.stream()
                .map(party -> toListResponse(party, 0.0))
                .collect(Collectors.toList());
        }

        // 2. 위치 정보가 있으면? -> 거리 계산 & 10km 이내 필터링
        return allParties.stream()
            .map(party -> {
                // 파티의 martName으로 DB에서 Store 정보(좌표)를 찾음
                Optional<Store> storeOpt = storeRepository.findByName(party.getMartName());

                double distance = 0.0;
                if (storeOpt.isPresent()) {
                    Store store = storeOpt.get();
                    // 내 위치 vs 매장 위치 거리 계산
                    distance = distanceCalculator.calculateDistance(myLat, myLng, store.getLat(), store.getLng());
                }

                return toListResponse(party, distance);
            })
            .filter(dto -> dto.getDistance() <= 10.0) // ★ 10km 이내만 통과! (거리를 늘리고 싶으면 여기 수정)
            .sorted((p1, p2) -> Double.compare(p1.getDistance(), p2.getDistance())) // 가까운 순 정렬
            .collect(Collectors.toList());
    }

    // DTO 변환 헬퍼 메서드 (중복 코드 제거용)
    private PartyListResponse toListResponse(Party party, double distance) {
        int currentMembers = partyMemberRepository.countByParty(party);

        // 거리 소수점 1자리까지만 (예: 2.5 km)
        double roundedDistance = Math.round(distance * 10) / 10.0;

        return PartyListResponse.builder()
            .partyId(party.getId())
            .title(party.getTitle())
            .martName(party.getMartName())
            .hostName(party.getHost().getNickname())
            .meetTime(party.getMeetTime())
            .currentMembers(currentMembers)
            .maxMembers(party.getMaxMembers())
            .distance(roundedDistance) // DTO에 distance 필드 추가 필요!
            .build();
    }
}
