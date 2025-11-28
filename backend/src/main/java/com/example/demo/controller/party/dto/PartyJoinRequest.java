package com.example.demo.controller.party.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PartyJoinRequest {
    private Long userId; // 참여하려는 유저 ID
}