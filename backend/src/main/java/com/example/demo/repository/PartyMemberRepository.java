package com.example.demo.repository;

import com.example.demo.repository.entity.Party;
import com.example.demo.repository.entity.PartyMember;
import com.example.demo.repository.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PartyMemberRepository extends JpaRepository<PartyMember, Long> {

    // 1. 특정 파티에 참여한 멤버 목록 조회 (상세 조회용)
    // SQL: SELECT * FROM party_members WHERE party_id = ?
    List<PartyMember> findByParty(Party party);

    // 2. 이미 참여했는지 중복 확인용 (참여하기 로직용)
    // SQL: SELECT * FROM party_members WHERE party_id = ? AND user_id = ?
    Optional<PartyMember> findByPartyAndUser(Party party, User user);

    // 3. 현재 파티 인원수 세기 (정원 초과 확인용)
    // SQL: SELECT count(*) FROM party_members WHERE party_id = ?
    int countByParty(Party party);
}
