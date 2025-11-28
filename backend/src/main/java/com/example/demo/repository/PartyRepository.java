package com.example.demo.repository;

import com.example.demo.repository.entity.Party;
import com.example.demo.repository.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartyRepository extends JpaRepository<Party, Long> {

    // 1. 전체 파티 조회 (최신순 정렬)
    // SQL: SELECT * FROM parties ORDER BY id DESC;
    List<Party> findAllByOrderByIdDesc();

    // 2. (옵션) 특정 상태인 파티만 조회 (예: "RECRUITING" 인 것만 보여주기)
    // SQL: SELECT * FROM parties WHERE status = ? ORDER BY id DESC;
    List<Party> findByStatusOrderByIdDesc(String status);

    // 3. (옵션) 특정 마트(코스트코 부산점)의 파티만 조회
    List<Party> findByMartNameOrderByIdDesc(String martName);

    // 4. (옵션) 내가 만든 파티 조회 (마이페이지용)
    List<Party> findByHost(User host);
}
