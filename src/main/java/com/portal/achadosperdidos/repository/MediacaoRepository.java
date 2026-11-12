package com.portal.achadosperdidos.repository;

import com.portal.achadosperdidos.entity.Mediacao;
import com.portal.achadosperdidos.enums.StatusMediacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface MediacaoRepository extends JpaRepository<Mediacao, Long> {

    boolean existsByItemIdAndStatusNot(Long itemId, StatusMediacao status);

    @EntityGraph(attributePaths = {"item", "solicitante", "adminResponsavel"})
    Page<Mediacao> findByStatusIn(Collection<StatusMediacao> status, Pageable pageable);

    @EntityGraph(attributePaths = {"item", "solicitante", "adminResponsavel"})
    List<Mediacao> findBySolicitanteIdOrderByDataSolicitacaoDesc(Long solicitanteId);
}
