package com.example.demo.controller.settlement.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class SettlementRequest {

    // 호스트가 품목별 실제 가격을 수정해서 보낼 수 있음
    private List<ItemPriceUpdate> items;

    @Getter
    @Setter
    public static class ItemPriceUpdate {

        private Long itemId;
        private int realPrice; // 영수증에 찍힌 실제 가격
    }
}
