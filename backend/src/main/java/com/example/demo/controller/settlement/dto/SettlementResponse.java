package com.example.demo.controller.settlement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SettlementResponse {
    private Long userId;
    private String nickname;
    private int totalAmount; // 내가 낼 총액
    private List<BillDetail> details; // 상세 내역

    @Getter
    @Builder
    @AllArgsConstructor
    public static class BillDetail {
        private String itemName;
        private int amount; // 그 물건에 대해 내가 낼 돈 (N/1 된 가격)
    }
}
