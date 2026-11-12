package com.portal.achadosperdidos.repository;

import com.portal.achadosperdidos.entity.FotoItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FotoItemRepository extends JpaRepository<FotoItem, Long> {

    List<FotoItem> findByItemIdOrderByOrdemAsc(Long itemId);
}
