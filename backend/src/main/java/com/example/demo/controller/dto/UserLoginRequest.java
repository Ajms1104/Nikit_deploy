package com.example.demo.controller.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor

//유저에게 요청할 정보
public class UserLoginRequest {
    private String email;
    private String nickname; // 닉네임이 오면 회원가입 시 사용, 없으면 기존 유저 로그인
    private Double lat;
    private Double lng;
}