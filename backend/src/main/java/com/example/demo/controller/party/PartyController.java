package com.example.demo.controller.party;

import com.example.demo.controller.party.dto.*;
import com.example.demo.global.common.ApiResponse;
import com.example.demo.service.PartyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parties")
@RequiredArgsConstructor
public class PartyController {

    private final PartyService partyService;

    // 1. 파티 생성
    @PostMapping
    public ApiResponse<PartyIdResponse> createParty(@RequestBody PartyCreateRequest request) {
        return ApiResponse.success(partyService.createParty(request));
    }

    // 2. 파티 목록 조회 (위치 정보 파라미터 추가됨!)
    @GetMapping
    public ApiResponse<List<PartyListResponse>> getPartyList(
        @RequestParam(required = false) Double lat,
        @RequestParam(required = false) Double lng) {
        // 이제 좌표를 서비스로 넘깁니다.
        return ApiResponse.success(partyService.getPartyList(lat, lng));
    }

    // 3. 파티 상세 조회
    @GetMapping("/{partyId}")
    public ApiResponse<PartyDetailResponse> getPartyDetail(@PathVariable Long partyId) {
        return ApiResponse.success(partyService.getPartyDetail(partyId));
    }

    // 4. 파티 참여
    @PostMapping("/{partyId}/join")
    public ApiResponse<PartyJoinResponse> joinParty(@PathVariable Long partyId,
        @RequestBody PartyJoinRequest request) {
        return ApiResponse.success(partyService.joinParty(partyId, request));
    }
}