package com.portal.achadosperdidos.repository;

import com.portal.achadosperdidos.entity.Conversa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;

public interface ConversaRepository extends JpaRepository<Conversa, Long> {

    @Query("select c.item.id from Conversa c where c.id = :id")
    Optional<Long> findItemIdById(@Param("id") Long id);

    Optional<Conversa> findByItemIdAndInteressadoId(Long itemId, Long interessadoId);

    List<Conversa> findAllByItemId(Long itemId);

    @Query("""
            select c from Conversa c
              join fetch c.item
              join fetch c.donoItem
              join fetch c.interessado
            where c.id = :id
            """)
    Optional<Conversa> findDetalhadoById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select c from Conversa c
              join fetch c.item
              join fetch c.donoItem
              join fetch c.interessado
            where c.id = :id
            """)
    Optional<Conversa> findDetalhadoParaAtualizarById(@Param("id") Long id);

    @Query("""
            select c from Conversa c
              join fetch c.item
              join fetch c.donoItem
              join fetch c.interessado
            where c.donoItem.id = :usuarioId or c.interessado.id = :usuarioId
            order by c.ultimaAtividade desc
            """)
    List<Conversa> findDoUsuario(@Param("usuarioId") Long usuarioId);

    @Query("""
            select c from Conversa c
              join fetch c.item
              join fetch c.donoItem
              join fetch c.interessado
            where c.dataEncerramento is null
            order by c.dataCriacao desc
            """)
    List<Conversa> findAbertasParaEquipe();
}
