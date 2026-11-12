package com.portal.achadosperdidos.repository;

import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.enums.StatusItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {

    /** Listagem filtrada: já traz categoria e local (as fotos vêm em lote via @BatchSize). */
    @Override
    @EntityGraph(attributePaths = {"categoria", "local"})
    Page<Item> findAll(Specification<Item> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"categoria", "local"})
    Page<Item> findByUsuarioId(Long usuarioId, Pageable pageable);

    @Query("""
            select i from Item i
              join fetch i.categoria
              join fetch i.local
              join fetch i.usuario
            where i.id = :id
            """)
    Optional<Item> findDetalhadoById(@Param("id") Long id);

    /** Bloqueio pessimista: evita duas transições concorrentes de status sobre o mesmo item. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Item i where i.id = :id")
    Optional<Item> findByIdParaAtualizar(@Param("id") Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Item i
               set i.status = :novo, i.atualizadoEm = :agora
             where i.status = :atual
               and i.expiraEm is not null
               and i.expiraEm < :agora
            """)
    int expirarVencidos(@Param("atual") StatusItem atual,
                        @Param("novo") StatusItem novo,
                        @Param("agora") LocalDateTime agora);
}
