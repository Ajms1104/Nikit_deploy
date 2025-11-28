package com.example.demo.repository;

import com.example.demo.repository.entity.ShoppingItem;
import com.example.demo.repository.entity.Party;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShoppingItemRepository extends JpaRepository<ShoppingItem, Long> {
    List<ShoppingItem> findByParty(Party party);
}
