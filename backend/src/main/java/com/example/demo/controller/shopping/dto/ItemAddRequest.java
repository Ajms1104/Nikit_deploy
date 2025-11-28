package com.example.demo.controller.shopping.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ItemAddRequest {
    private Long userId; // 제안자 ID
    private String name; // 품목명
    private int price;   // 예상 가격
}
