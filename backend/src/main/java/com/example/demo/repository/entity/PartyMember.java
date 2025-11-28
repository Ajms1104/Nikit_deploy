package com.example.demo.repository.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "party_members") // DB 테이블명
public class PartyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어느 파티인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "party_id")
    private Party party;

    // 누가 참여했는지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // 역할이 무엇인지 ("HOST" 또는 "GUEST")
    private String role;

    // 결제 상태 (PENDING: 대기중, COMPLETED: 완료)
    @Builder.Default
    private String paymentStatus = "PENDING";

    // 상태 변경 편의 메서드
    public void completePayment() {
        this.paymentStatus = "COMPLETED";
    }
}