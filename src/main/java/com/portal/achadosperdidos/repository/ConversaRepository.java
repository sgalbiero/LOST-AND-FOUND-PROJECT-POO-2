package com.portal.achadosperdidos.repository;

import com.portal.achadosperdidos.entity.Conversa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversaRepository extends JpaRepository<Conversa, Long> {

    Optional<Conversa> findByItemIdAndInteressadoId(Long itemId, Long interessadoId);

    @Query("""
            select c from Conversa c
              join fetch c.item
              join fetch c.donoItem
              join fetch c.interessado
            where c.id = :id
            """)
    Optional<Conversa> findDetalhadoById(@Param("id") Long id);

    @Query("""
            select c from Conversa c
              join fetch c.item
              join fetch c.donoItem
              join fetch c.interessado
            where c.donoItem.id = :usuarioId or c.interessado.id = :usuarioId
            order by c.dataCriacao desc
            """)
    List<Conversa> findDoUsuario(@Param("usuarioId") Long usuarioId);
}
