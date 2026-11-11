package com.portal.achadosperdidos.entity;

import com.portal.achadosperdidos.enums.StatusMediacao;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.*;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * "Uma única mediação em aberto por item" é garantida pelo índice parcial
 * uq_mediacao_aberta_por_item no banco.
 */
@Getter @Setter @NoArgsConstructor
@Entity
@Table(name = "mediacoes")
public class Mediacao extends BaseEntity {

    @NotBlank
    @Column(nullable = false, columnDefinition = "text")
    private String motivo;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "status_mediacao")
    private StatusMediacao status = StatusMediacao.PENDENTE;

    @CreationTimestamp
    @Column(name = "data_solicitacao", nullable = false, updatable = false)
    private LocalDateTime dataSolicitacao;

    @Column(name = "data_resolucao")
    private LocalDateTime dataResolucao;

    @Column(columnDefinition = "text")
    private String parecer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solicitante_id", nullable = false)
    private Usuario solicitante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_responsavel_id")
    private Usuario adminResponsavel;

    public void assumir(Usuario admin) {
        if (status != StatusMediacao.PENDENTE) {
            throw new IllegalStateException("Mediação não está pendente");
        }
        this.adminResponsavel = admin;
        this.status = StatusMediacao.EM_ANDAMENTO;
    }

    public void resolver(String parecer) {
        if (parecer == null || parecer.isBlank()) {
            throw new IllegalArgumentException("Parecer é obrigatório para resolver a mediação");
        }
        this.parecer = parecer;
        this.dataResolucao = LocalDateTime.now();
        this.status = StatusMediacao.RESOLVIDO;
    }
}
