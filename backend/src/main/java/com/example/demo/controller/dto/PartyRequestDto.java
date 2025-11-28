package com.example.demo.controller.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class PartyRequestDto {
    private String martName;
    private String title;
    private String meetTime;   // ISO 문자열 ("2025-11-30T14:00:00")
    private String meetPlace;
    private Integer maxMembers;
}
