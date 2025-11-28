package com.example.demo.service;

import com.example.demo.controller.party.dto.*;
import com.example.demo.repository.*;
import com.example.demo.repository.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartyService {

    private final PartyRepository partyRepository;
    private final PartyMemberRepository partyMemberRepository;
    private final UserRepository userRepository;

    // 1. 파티 생성
    @Transactional
    public PartyIdResponse createParty(PartyCreateRequest request) {
        User host = userRepository.findById(request.getHostId())
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        // 파티 엔티티 생성
        Party party = Party.builder()
            .host(host)
            .martName(request.getMartName())
            .title(request.getTitle())
            .meetTime(request.getMeetTime())
            .meetPlace(request.getMeetPlace())
            .maxMembers(request.getMaxMembers())
            // 초기 상태는 RECRUITING (모집중) 이라고 가정 (Entity에 default 없으면 여기서 set)
            // .status("RECRUITING")
            .build();
        partyRepository.save(party);

        // 방장을 멤버(HOST)로 추가
        partyMemberRepository.save(PartyMember.builder()
            .party(party)
            .user(host)
            .role("HOST")
            .build());

        return new PartyIdResponse(party.getId());
    }

    // 2. 파티 목록 조회
    @Transactional(readOnly = true)
    public List<PartyListResponse> getPartyList() {
        return partyRepository.findAllByOrderByIdDesc().stream()
            .map(party -> {
                int currentMembers = partyMemberRepository.countByParty(party);
                return PartyListResponse.builder()
                    .partyId(party.getId())
                    .title(party.getTitle())
                    .martName(party.getMartName())
                    .hostName(party.getHost().getNickname())
                    // .status(party.getStatus()) // Entity 필드 추가 필요
                    .meetTime(party.getMeetTime())
                    .currentMembers(currentMembers)
                    .maxMembers(party.getMaxMembers())
                    .build();
            })
            .collect(Collectors.toList());
    }

    // 3. 파티 상세 조회
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
            // .status(party.getStatus())
            .members(memberDtos)
            .build();
    }

    // 4. 파티 참여
    @Transactional
    public PartyJoinResponse joinParty(Long partyId, PartyJoinRequest request) {
        Party party = partyRepository.findById(partyId)
            .orElseThrow(() -> new IllegalArgumentException("파티 없음"));
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        // 이미 참여했는지 확인
        if (partyMemberRepository.findByPartyAndUser(party, user).isPresent()) {
            return new PartyJoinResponse(false, "ALREADY_JOINED", "이미 참여한 파티입니다.");
        }

        // 인원 꽉 찼는지 확인
        int currentCount = partyMemberRepository.countByParty(party);
        if (currentCount >= party.getMaxMembers()) {
            return new PartyJoinResponse(false, "FULL", "정원이 초과되었습니다.");
        }

        // 멤버 추가 (GUEST)
        partyMemberRepository.save(PartyMember.builder()
            .party(party)
            .user(user)
            .role("GUEST")
            .build());

        return new PartyJoinResponse(true, "GUEST", "파티 참여 완료");
    }
}