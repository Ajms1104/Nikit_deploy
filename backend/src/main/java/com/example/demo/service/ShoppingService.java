package com.example.demo.service;


import com.example.demo.controller.shopping.dto.ItemAddRequest;
import com.example.demo.controller.shopping.dto.ItemResponse;
import com.example.demo.controller.shopping.dto.VoteRequest;
import com.example.demo.repository.*;
import com.example.demo.repository.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShoppingService {
    private final ShoppingItemRepository itemRepository;
    private final VoteRepository voteRepository;
    private final PartyRepository partyRepository;
    private final UserRepository userRepository;

    // 1. 물건 추가
    @Transactional
    public ItemResponse addItem(Long partyId, ItemAddRequest request) {
        Party party = partyRepository.findById(partyId)
            .orElseThrow(() -> new IllegalArgumentException("파티 없음"));
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        ShoppingItem item = ShoppingItem.builder()
            .party(party)
            .proposer(user)
            .name(request.getName())
            .price(request.getPrice())
            .confirmed(false) // 처음엔 미확정
            .build();
        itemRepository.save(item);

        // 제안자는 자동으로 '찬성' 투표 처리 (UX 향상)
        voteRepository.save(Vote.builder().item(item).user(user).agree(true).build());

        return ItemResponse.builder()
            .itemId(item.getId())
            .name(item.getName())
            .price(item.getPrice())
            .agreeCount(1)
            .confirmed(false)
            .build();
    }

    // 2. 쇼핑 리스트 조회
    @Transactional(readOnly = true)
    public List<ItemResponse> getShoppingList(Long partyId) {
        Party party = partyRepository.findById(partyId)
            .orElseThrow(() -> new IllegalArgumentException("파티 없음"));

        return itemRepository.findByParty(party).stream()
            .map(item -> {
                int agreeCount = voteRepository.countByItemAndAgreeTrue(item);
                return ItemResponse.builder()
                    .itemId(item.getId())
                    .name(item.getName())
                    .price(item.getPrice())
                    .agreeCount(agreeCount)
                    .confirmed(item.isConfirmed())
                    .build();
            })
            .collect(Collectors.toList());
    }

    // 3. 투표 하기 (핵심 로직)
    @Transactional
    public ItemResponse voteItem(Long itemId, VoteRequest request) {
        ShoppingItem item = itemRepository.findById(itemId)
            .orElseThrow(() -> new IllegalArgumentException("아이템 없음"));
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        // 기존 투표 확인 (있으면 수정, 없으면 생성)
        Vote vote = voteRepository.findByItemAndUser(item, user)
            .orElseGet(() -> Vote.builder().item(item).user(user).build());

        vote.setAgree(request.isAgree()); // 투표 상태 업데이트
        voteRepository.save(vote);

        // ★ 로직: 찬성 표가 3표 이상이면 확정(Confirmed) 처리
        int agreeCount = voteRepository.countByItemAndAgreeTrue(item);
        if (agreeCount >= 3) {
            item.setConfirmed(true);
        } else {
            item.setConfirmed(false); // 취소하면 다시 미확정으로 갈 수도 있음
        }

        return ItemResponse.builder()
            .itemId(item.getId())
            .name(item.getName())
            .price(item.getPrice())
            .agreeCount(agreeCount)
            .confirmed(item.isConfirmed())
            .build();
    }

}
