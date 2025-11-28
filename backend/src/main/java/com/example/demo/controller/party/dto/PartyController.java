package com.example.demo.controller.party.dto;

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

    // 2. 파티 목록 조회
    @GetMapping
    public ApiResponse<List<PartyListResponse>> getPartyList() {
        return ApiResponse.success(partyService.getPartyList());
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

    // (선택) 상태 변경 API는 필요하면 나중에 추가 (PartyService에 updateStatus 구현 필요)
}
