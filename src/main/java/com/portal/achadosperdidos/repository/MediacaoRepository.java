package com.portal.achadosperdidos.repository;

import com.portal.achadosperdidos.entity.Mediacao;
import com.portal.achadosperdidos.enums.StatusMediacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface MediacaoRepository extends JpaRepository<Mediacao, Long> {

    @Query("select m.conversa.id from Mediacao m where m.id = :id")
    Optional<Long> findConversaIdById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from Mediacao m where m.id = :id")
    Optional<Mediacao> findByIdParaAtualizar(@Param("id") Long id);

    boolean existsByConversaIdAndStatusIn(Long conversaId, Collection<StatusMediacao> status);

    List<Mediacao> findAllByItemIdAndStatusIn(Long itemId, Collection<StatusMediacao> status);

    List<Mediacao> findAllByConversaIdAndStatusIn(Long conversaId, Collection<StatusMediacao> status);

    @EntityGraph(attributePaths = {"item", "conversa", "conversa.donoItem", "conversa.interessado", "solicitante", "adminResponsavel"})
    Page<Mediacao> findByStatusIn(Collection<StatusMediacao> status, Pageable pageable);

    @EntityGraph(attributePaths = {"item", "conversa", "conversa.donoItem", "conversa.interessado", "solicitante", "adminResponsavel"})
    List<Mediacao> findBySolicitanteIdOrderByDataSolicitacaoDesc(Long solicitanteId);

    @EntityGraph(attributePaths = {"item", "conversa", "conversa.donoItem", "conversa.interessado", "solicitante", "adminResponsavel"})
    Optional<Mediacao> findFirstByConversaIdAndStatusInOrderByDataSolicitacaoDesc(
            Long conversaId, Collection<StatusMediacao> status);

    @EntityGraph(attributePaths = {"item", "conversa", "conversa.donoItem", "conversa.interessado", "solicitante", "adminResponsavel"})
    List<Mediacao> findByAdminResponsavelIdAndStatusOrderByDataSolicitacaoDesc(Long adminId, StatusMediacao status);

    boolean existsByConversaIdAndAdminResponsavelIdAndStatus(Long conversaId, Long adminId, StatusMediacao status);
}
