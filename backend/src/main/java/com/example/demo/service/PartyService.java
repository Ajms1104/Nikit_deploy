package com.example.demo.service;

import com.example.demo.controller.party.dto.*;
import com.example.demo.global.util.DistanceCalculator;
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
    private final StoreRepository storeRepository;
    private final DistanceCalculator distanceCalculator;

    // 1. 파티 생성 (복구됨)
    @Transactional
    public PartyIdResponse createParty(PartyCreateRequest request) {
        User host = userRepository.findById(request.getHostId())
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        Party party = Party.builder()
            .host(host)
            .martName(request.getMartName())
            .title(request.getTitle())
            .meetTime(request.getMeetTime())
            .meetPlace(request.getMeetPlace())
            .maxMembers(request.getMaxMembers())
            .status("RECRUITING")
            .build();
        partyRepository.save(party);

        partyMemberRepository.save(PartyMember.builder()
            .party(party)
            .user(host)
            .role("HOST")
            .build());

        return new PartyIdResponse(party.getId());
    }

    // 2. 파티 목록 조회 (위치 기반 로직 포함)
    @Transactional(readOnly = true)
    public List<PartyListResponse> getPartyList(Double myLat, Double myLng) {
        List<Party> allParties = partyRepository.findAllByOrderByIdDesc();

        if (myLat == null || myLng == null) {
            return allParties.stream()
                .map(party -> toListResponse(party, 0.0))
                .collect(Collectors.toList());
        }

        return allParties.stream()
            .map(party -> {
                // 마트 이름으로 좌표 찾기
                Optional<Store> storeOpt = storeRepository.findByName(party.getMartName());
                double distance = 0.0;

                if (storeOpt.isPresent()) {
                    Store store = storeOpt.get();
                    distance = distanceCalculator.calculateDistance(myLat, myLng, store.getLat(), store.getLng());
                } else {
                    // DB에 없는 마트면 하드코딩된 좌표라도 쓰거나 0 처리
                    // (급할 땐 하드코딩이 최고)
                    if(party.getMartName().contains("코스트코 부산")) distance = distanceCalculator.calculateDistance(myLat, myLng, 35.1742, 129.1118);
                    else if(party.getMartName().contains("서면")) distance = distanceCalculator.calculateDistance(myLat, myLng, 35.1645, 129.0505);
                    else if(party.getMartName().contains("명지")) distance = distanceCalculator.calculateDistance(myLat, myLng, 35.0935, 128.9042);
                }

                return toListResponse(party, distance);
            })
            .filter(dto -> dto.getDistance() <= 20.0) // 10km 이내
            .sorted((p1, p2) -> Double.compare(p1.getDistance(), p2.getDistance())) // 거리순 정렬
            .collect(Collectors.toList());
    }

    // 3. 파티 상세 조회 (복구됨)
    @Transactional(readOnly = true)
    public PartyDetailResponse getPartyDetail(Long partyId) {
        Party party = partyRepository.findById(partyId)
            .orElseThrow(() -> new IllegalArgumentException("파티 없음"));

        List<PartyMember> members = partyMemberRepository.findByParty(party);

        List<PartyDetailResponse.MemberDto> memberDtos = members.stream()
            .map(pm -> PartyDetailResponse.MemberDto.builder()
                .userId(pm.getUser().getId())
                .nickname(pm.getUser().getNickname())
                .role(pm.getRole())
                .build())
            .collect(Collectors.toList());

        return PartyDetailResponse.builder()
            .partyId(party.getId())
            .martName(party.getMartName())
            .title(party.getTitle())
            .meetPlace(party.getMeetPlace())
            .meetTime(party.getMeetTime())
            .status(party.getStatus())
            .members(memberDtos)
            .build();
    }

    // 4. 파티 참여 (복구됨)
    @Transactional
    public PartyJoinResponse joinParty(Long partyId, PartyJoinRequest request) {
        Party party = partyRepository.findById(partyId)
            .orElseThrow(() -> new IllegalArgumentException("파티 없음"));
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        if (partyMemberRepository.findByPartyAndUser(party, user).isPresent()) {
            return new PartyJoinResponse(false, "ALREADY_JOINED", "이미 참여했습니다.");
        }

        int currentCount = partyMemberRepository.countByParty(party);
        if (currentCount >= party.getMaxMembers()) {
            return new PartyJoinResponse(false, "FULL", "정원 초과");
        }

        partyMemberRepository.save(PartyMember.builder()
            .party(party)
            .user(user)
            .role("GUEST")
            .build());

        return new PartyJoinResponse(true, "GUEST", "참여 완료");
    }

    // DTO 변환 헬퍼
    private PartyListResponse toListResponse(Party party, double distance) {
        int currentMembers = partyMemberRepository.countByParty(party);
        double roundedDistance = Math.round(distance * 10) / 10.0;

        return PartyListResponse.builder()
            .partyId(party.getId())
            .title(party.getTitle())
            .martName(party.getMartName())
            .hostName(party.getHost().getNickname())
            .meetTime(party.getMeetTime())
            .currentMembers(currentMembers)
            .maxMembers(party.getMaxMembers())
            .distance(roundedDistance)
            .build();
    }
}