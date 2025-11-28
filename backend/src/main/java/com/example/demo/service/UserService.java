package com.example.demo.service;

import com.example.demo.controller.dto.UserLoginRequest;
import com.example.demo.controller.dto.UserLoginResponse;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    /*로그인 (이메일이 없으면 자동 회원가입)*/
    @Transactional
    public UserLoginResponse login(UserLoginRequest request) {
        // 1. DB에서 이메일로 조회, 없으면 새로 생성(save)
        User user = userRepository.findByEmail(request.getEmail())
            .orElseGet(() -> userRepository.save(User.builder()
                .email(request.getEmail())
                .nickname(request.getNickname())
                .isHost(false) // 기본은 게스트
                .build()));

        // 2. Entity -> ResponseDto 변환
        return UserLoginResponse.builder()
            .userId(user.getId())
            .nickname(user.getNickname())
            .isHost(user.isHost())
            .region(user.getRegion())
            .build();
    }

    /*호스트 등업*/
    @Transactional
    public void promoteHost(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다. id=" + userId));

        user.setHost(true); // Dirty Checking으로 자동 update 쿼리 발생
    }

}
