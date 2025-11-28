package com.example.demo.repository.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter // 해커톤 편의상 허용
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "parties") // DB 테이블 이름 지정

public class Party {
    @Id // ★중요: jakarta.persistence.Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ★ 핵심 추가: 방장(Host)과의 연관관계 (N:1)
    // DB에는 host_id 라는 컬럼으로 저장됩니다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id")
    private User host;

    // 코스트코 / 트레이더스 지점명
    private String martName;

    // 모임 제목
    private String title;

    // 만나는 시간
    private LocalDateTime meetTime;

    // 만나는 장소
    private String meetPlace;

    // 최대 인원 (보통 4명)
    private Integer maxMembers;

    // ★ 상태 필드 추가 (모집중 / 쇼핑중 / 정산중 / 완료)
    // 빌더 패턴 쓸 때 기본값을 넣으려면 @Builder.Default 필요
    @Builder.Default
    private String status = "RECRUITING";
}
