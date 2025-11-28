package com.example.demo.repository.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "shopping_items")
public class ShoppingItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "party_id")
    private Party party;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User proposer; // 제안한 사람

    private String name;   // 물건 이름 (예: 베이글)
    private int price;     // 예상 가격

    @Builder.Default
    private boolean confirmed = false; // 구매 확정 여부 (3인 이상 찬성 시 True)
}
