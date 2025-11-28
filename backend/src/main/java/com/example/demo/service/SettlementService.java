package com.example.demo.service;

import com.example.demo.controller.settlement.dto.*;
import com.example.demo.repository.*;
import com.example.demo.repository.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final PartyRepository partyRepository;
    private final ShoppingItemRepository itemRepository;
    private final PartyMemberRepository memberRepository; // ★ 여기 이름이 'memberRepository' 입니다
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;

    // 1. 정산 계산 로직
    @Transactional
    public List<SettlementResponse> calculate(Long partyId, SettlementRequest request) {
        Party party = partyRepository.findById(partyId)
            .orElseThrow(() -> new IllegalArgumentException("파티 없음"));

        // 파티 멤버들 가져오기
        List<PartyMember> members = memberRepository.findByParty(party);

        // 유저별 최종 청구서를 담을 Map 초기화
        Map<Long, SettlementResponse> billMap = new HashMap<>();
        for (PartyMember pm : members) {
            billMap.put(pm.getUser().getId(), SettlementResponse.builder()
                .userId(pm.getUser().getId())
                .nickname(pm.getUser().getNickname())
                .totalAmount(0)
                .details(new ArrayList<>())
                .build());
        }

        // 실제 가격 업데이트 및 정산 로직 수행
        for (SettlementRequest.ItemPriceUpdate update : request.getItems()) {
            ShoppingItem item = itemRepository.findById(update.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("아이템 없음"));

            item.setPrice(update.getRealPrice());
            itemRepository.save(item);

            List<User> agreedUsers = getAgreedUsers(item, members);

            if (agreedUsers.isEmpty()) continue;

            int splitPrice = item.getPrice() / agreedUsers.size();

            for (User u : agreedUsers) {
                SettlementResponse bill = billMap.get(u.getId());

                bill = SettlementResponse.builder()
                    .userId(bill.getUserId())
                    .nickname(bill.getNickname())
                    .totalAmount(bill.getTotalAmount() + splitPrice)
                    .details(bill.getDetails())
                    .build();

                bill.getDetails().add(new SettlementResponse.BillDetail(item.getName(), splitPrice));
                billMap.put(u.getId(), bill);
            }
        }

        return new ArrayList<>(billMap.values());
    }

    // 2. 송금 완료 처리 (Mock) - ★ 수정된 부분
    @Transactional
    public void completePayment(Long partyId, Long userId) {
        Party party = partyRepository.findById(partyId)
            .orElseThrow(() -> new IllegalArgumentException("파티 없음"));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        // ★ 수정됨: memberRepository 로 이름 통일
        PartyMember member = memberRepository.findByPartyAndUser(party, user)
            .orElseThrow(() -> new IllegalArgumentException("이 파티의 멤버가 아닙니다."));

        member.completePayment();
    }

    // 찬성한 유저 리스트 추출 헬퍼 메서드
    private List<User> getAgreedUsers(ShoppingItem item, List<PartyMember> members) {
        List<User> agreedUsers = new ArrayList<>();

        for (PartyMember pm : members) {
            User user = pm.getUser();
            boolean isAgreed = voteRepository.findByItemAndUser(item, user)
                .map(Vote::isAgree)
                .orElse(true);

            if (isAgreed) {
                agreedUsers.add(user);
            }
        }
        return agreedUsers;
    }
}