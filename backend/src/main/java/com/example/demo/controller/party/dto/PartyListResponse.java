package com.example.demo.controller.party.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartyListResponse {
    private Long partyId;
    private String martName;
    private String title;
    private String hostName;     // 방장 닉네임
    private String status;       // 모집중(RECRUITING) 등
    private LocalDateTime meetTime;
    private int currentMembers;  // 현재 인원
    private int maxMembers;      // 최대 인원
    private double distance;
}