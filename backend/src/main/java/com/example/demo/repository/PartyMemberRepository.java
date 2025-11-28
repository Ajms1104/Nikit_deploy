package com.example.demo.repository;

import com.example.demo.repository.entity.PartyMember;
import com.example.demo.repository.entity.Party;
import com.example.demo.repository.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PartyMemberRepository extends JpaRepository<PartyMember, Long> {
    // 특정 파티의 멤버들 찾기
    List<PartyMember> findByParty(Party party);

    // 이미 참여했는지 확인용
    Optional<PartyMember> findByPartyAndUser(Party party, User user);

    // 현재 파티 인원 수 세기
    int countByParty(Party party);
}