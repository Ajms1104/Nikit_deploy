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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final PartyRepository partyRepository;
    private final ShoppingItemRepository itemRepository;
    private final PartyMemberRepository memberRepository;
    private final VoteRepository voteRepository;

    @Transactional
    public List<SettlementResponse> calculate(Long partyId, SettlementRequest request) {
        Party party = partyRepository.findById(partyId)
            .orElseThrow(() -> new IllegalArgumentException("파티 없음"));

        // 1. 파티 멤버들 가져오기
        List<PartyMember> members = memberRepository.findByParty(party);

        // 2. 유저별 최종 청구서를 담을 Map 초기화 (Key: UserId, Value: ResponseBuilder)
        Map<Long, SettlementResponse> billMap = new HashMap<>();
        for (PartyMember pm : members) {
            billMap.put(pm.getUser().getId(), SettlementResponse.builder()
                .userId(pm.getUser().getId())
                .nickname(pm.getUser().getNickname())
                .totalAmount(0)
                .details(new ArrayList<>()) // 빈 리스트 생성
                .build());
        }

        // 3. 실제 가격 업데이트 및 정산 로직 수행
        for (SettlementRequest.ItemPriceUpdate update : request.getItems()) {
            ShoppingItem item = itemRepository.findById(update.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("아이템 없음"));

            // 실제 가격으로 업데이트 (영수증 반영)
            item.setPrice(update.getRealPrice());
            itemRepository.save(item); // (선택) DB에 실제 가격 저장

            // ★ 핵심 로직: 이 아이템에 '찬성(True)'한 사람 찾기
            // (Vote가 없으면 기본적으로 찬성으로 간주하거나, Vote 테이블을 꼭 생성하게 유도)
            List<User> agreedUsers = getAgreedUsers(item, members);

            if (agreedUsers.isEmpty()) continue; // 아무도 안 샀으면 패스

            // 1/N 가격 계산 (10원 단위 절삭은 생략)
            int splitPrice = item.getPrice() / agreedUsers.size();

            // 찬성한 사람들의 청구서에 금액 추가
            for (User u : agreedUsers) {
                SettlementResponse bill = billMap.get(u.getId());

                // 총액 누적
                bill = SettlementResponse.builder()
                    .userId(bill.getUserId())
                    .nickname(bill.getNickname())
                    .totalAmount(bill.getTotalAmount() + splitPrice)
                    .details(bill.getDetails())
                    .build();

                // 상세 내역 추가
                bill.getDetails().add(new SettlementResponse.BillDetail(item.getName(), splitPrice));

                // Map 업데이트
                billMap.put(u.getId(), bill);
            }
        }

        return new ArrayList<>(billMap.values());
    }

    // 찬성한 유저 리스트 추출 헬퍼 메서드
    private List<User> getAgreedUsers(ShoppingItem item, List<PartyMember> members) {
        List<User> agreedUsers = new ArrayList<>();

        for (PartyMember pm : members) {
            User user = pm.getUser();
            // 투표 조회: 투표 기록이 없거나(null), agree가 true면 찬성으로 간주
            // (MVP에서는 명시적 반대(false)만 제외)
            boolean isAgreed = voteRepository.findByItemAndUser(item, user)
                .map(Vote::isAgree)
                .orElse(true); // 투표 안 했으면 기본 찬성

            if (isAgreed) {
                agreedUsers.add(user);
            }
        }
        return agreedUsers;
    }
}
