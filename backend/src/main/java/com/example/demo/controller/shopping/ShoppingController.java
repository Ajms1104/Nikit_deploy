package com.example.demo.controller.shopping;

import com.example.demo.controller.shopping.dto.ItemAddRequest;
import com.example.demo.controller.shopping.dto.ItemResponse;
import com.example.demo.controller.shopping.dto.VoteRequest;
import com.example.demo.global.common.ApiResponse;
import com.example.demo.service.ShoppingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parties/{partyId}/items")
@RequiredArgsConstructor
public class ShoppingController {

    private final ShoppingService shoppingService;

    // 1. 쇼핑 리스트 조회
    @GetMapping
    public ApiResponse<List<ItemResponse>> getList(@PathVariable Long partyId) {
        return ApiResponse.success(shoppingService.getShoppingList(partyId));
    }

    // 2. 물건 추가
    @PostMapping
    public ApiResponse<ItemResponse> addItem(@PathVariable Long partyId,
        @RequestBody ItemAddRequest request) {
        return ApiResponse.success(shoppingService.addItem(partyId, request));
    }

    // 3. 투표 하기 (URL: /api/v1/parties/{partyId}/items/{itemId}/vote)
    @PostMapping("/{itemId}/vote")
    public ApiResponse<ItemResponse> voteItem(@PathVariable Long partyId,
        @PathVariable Long itemId,
        @RequestBody VoteRequest request) {
        return ApiResponse.success(shoppingService.voteItem(itemId, request));
    }
}