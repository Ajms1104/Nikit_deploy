package com.example.demo.controller.party.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PartyStatusUpdateRequest {
    private String status; // RECRUITING, SHOPPING, SETTLEMENT, DONE
}
