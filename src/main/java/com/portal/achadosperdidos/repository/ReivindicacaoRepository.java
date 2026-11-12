package com.portal.achadosperdidos.repository;

import com.portal.achadosperdidos.entity.Reivindicacao;
import com.portal.achadosperdidos.enums.StatusReivindicacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReivindicacaoRepository extends JpaRepository<Reivindicacao, Long> {

    /** Projeção leve: permite bloquear o item ANTES de carregar a reivindicação (evita estado obsoleto). */
    @Query("select r.item.id from Reivindicacao r where r.id = :id")
    Optional<Long> findItemIdById(@Param("id") Long id);

    boolean existsByItemIdAndReivindicanteId(Long itemId, Long reivindicanteId);

    Optional<Reivindicacao> findByItemIdAndStatus(Long itemId, StatusReivindicacao status);

    List<Reivindicacao> findAllByItemIdAndStatus(Long itemId, StatusReivindicacao status);

    @EntityGraph(attributePaths = {"item", "reivindicante"})
    List<Reivindicacao> findByItemIdOrderByDataCriacaoAsc(Long itemId);

    @EntityGraph(attributePaths = {"item", "reivindicante"})
    Page<Reivindicacao> findByReivindicanteId(Long reivindicanteId, Pageable pageable);
}
