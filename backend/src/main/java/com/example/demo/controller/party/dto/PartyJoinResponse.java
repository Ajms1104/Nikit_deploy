package com.example.demo.controller.party.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PartyJoinResponse {
    private boolean joined;
    private String role; // GUEST
    private String message;
}