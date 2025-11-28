package com.example.demo.repository;

import com.example.demo.repository.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {
    // 파티에 저장된 martName(문자열)으로 Store 정보를 찾기 위해 필요
    Optional<Store> findByName(String name);
}