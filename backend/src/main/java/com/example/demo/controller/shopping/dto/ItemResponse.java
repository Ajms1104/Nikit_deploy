package com.example.demo.controller.shopping.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ItemResponse {
    private Long itemId;
    private String name;
    private int price;
    private int agreeCount;    // 찬성 수
    private boolean confirmed; // 확정 여부
}
