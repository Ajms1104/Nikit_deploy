package com.example.demo.controller.party.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartyDetailResponse {
    private Long partyId;
    private String martName;
    private String title;
    private String meetPlace;
    private LocalDateTime meetTime;
    private String status;

    // 참여 중인 멤버 리스트
    private List<MemberDto> members;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class MemberDto {
        private Long userId;
        private String nickname;
        private String role; // HOST, GUEST
    }
}