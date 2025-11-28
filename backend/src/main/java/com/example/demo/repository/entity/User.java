package com.example.demo.repository.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users") // user는 DB 예약어일 수 있어서 users로 지정
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String nickname;
    private String password; // 해커톤이라 암호화 패스

    private boolean isHost; // 호스트 뱃지 여부
    private String region;  // 인증된 동네 (예: 부산 남구)
}