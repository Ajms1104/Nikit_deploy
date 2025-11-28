package com.example.demo.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor

// 유저 로그인 이후 돌려줄 내용
public class UserLoginResponse {
    private Long userId;
    private String nickname;
    private boolean isHost;     // 호스트 뱃지 보유 여부
    private String region;      // 인증된 동네
}
