package com.portal.achadosperdidos.repository;

import com.portal.achadosperdidos.entity.Devolucao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DevolucaoRepository extends JpaRepository<Devolucao, Long> {

    boolean existsByItemId(Long itemId);

    Optional<Devolucao> findByItemId(Long itemId);
}
