package com.example.demo.controller.party.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class PartyCreateRequest {
    private Long hostId;       // 방장(호스트) ID
    private String martName;   // 코스트코 부산점
    private String title;      // "베이글 나누실 분"
    private LocalDateTime meetTime; // 2024-11-30T14:00:00
    private String meetPlace;  // "1층 입구"
    private Integer maxMembers; // 4
}