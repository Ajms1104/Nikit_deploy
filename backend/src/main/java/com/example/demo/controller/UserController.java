package com.example.demo.controller;

import com.example.demo.controller.dto.UserLoginRequest;
import com.example.demo.controller.dto.UserLoginResponse;
import com.example.demo.global.common.ApiResponse;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 로그인 및 자동 회원가입
    @PostMapping("/login")
    public ApiResponse<UserLoginResponse> login(@RequestBody UserLoginRequest request) {
        UserLoginResponse response = userService.login(request);
        return ApiResponse.success(response);
    }

    // 호스트 뱃지 신청
    @PostMapping("/{userId}/host")
    public ApiResponse<String> registerHost(@PathVariable Long userId) {
        userService.promoteHost(userId);
        return ApiResponse.success("호스트 등업이 완료되었습니다.");
    }
}
