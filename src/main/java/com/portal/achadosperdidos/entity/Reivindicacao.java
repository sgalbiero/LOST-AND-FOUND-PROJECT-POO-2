package com.portal.achadosperdidos.entity;

import com.portal.achadosperdidos.enums.StatusReivindicacao;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.*;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Regra "no máximo uma ACEITA por item" é garantida pelo índice parcial
 * uq_reiv_aceita_por_item no banco (JPA não consegue expressá-lo).
 */
@Getter @Setter @NoArgsConstructor
@Entity
@Table(name = "reivindicacoes",
       uniqueConstraints = @UniqueConstraint(name = "uq_reiv_item_user", columnNames = {"item_id", "reivindicante_id"}))
public class Reivindicacao extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reivindicante_id", nullable = false)
    private Usuario reivindicante;

    /** Prova de posse / característica identificadora. */
    @NotBlank
    @Column(nullable = false, columnDefinition = "text")
    private String justificativa;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "status_reivindicacao")
    private StatusReivindicacao status = StatusReivindicacao.PENDENTE;

    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_resposta")
    private LocalDateTime dataResposta;

    public void aceitar() {
        exigirPendente();
        this.status = StatusReivindicacao.ACEITA;
        this.dataResposta = LocalDateTime.now();
    }

    public void recusar() {
        exigirPendente();
        this.status = StatusReivindicacao.RECUSADA;
        this.dataResposta = LocalDateTime.now();
    }

    public void cancelar() {
        exigirPendente();
        this.status = StatusReivindicacao.CANCELADA;
        this.dataResposta = LocalDateTime.now();
    }

    private void exigirPendente() {
        if (status != StatusReivindicacao.PENDENTE) {
            throw new IllegalStateException("Reivindicação já foi respondida: " + status);
        }
    }
}
