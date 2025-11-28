package com.example.demo.repository;

import com.example.demo.repository.entity.Vote;
import com.example.demo.repository.entity.ShoppingItem;
import com.example.demo.repository.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    // 내가 이 아이템에 투표했는지 확인
    Optional<Vote> findByItemAndUser(ShoppingItem item, User user);

    // 찬성 표 개수 세기 (로직용)
    int countByItemAndAgreeTrue(ShoppingItem item);
}