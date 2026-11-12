package com.portal.achadosperdidos.repository;

import com.portal.achadosperdidos.entity.Mensagem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MensagemRepository extends JpaRepository<Mensagem, Long> {

    @EntityGraph(attributePaths = {"remetente", "conversa"})
    Page<Mensagem> findByConversaId(Long conversaId, Pageable pageable);

    long countByConversaIdAndLidaFalseAndRemetenteIdNot(Long conversaId, Long usuarioId);

    @Query("""
            select count(m) from Mensagem m
            where m.lida = false
              and m.remetente.id <> :usuarioId
              and (m.conversa.donoItem.id = :usuarioId or m.conversa.interessado.id = :usuarioId)
            """)
    long contarNaoLidasDoUsuario(@Param("usuarioId") Long usuarioId);

    /** Marca como lidas as mensagens recebidas (enviadas pela outra pessoa) na conversa. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Mensagem m set m.lida = true
            where m.conversa.id = :conversaId
              and m.remetente.id <> :usuarioId
              and m.lida = false
            """)
    int marcarComoLidas(@Param("conversaId") Long conversaId, @Param("usuarioId") Long usuarioId);
}
