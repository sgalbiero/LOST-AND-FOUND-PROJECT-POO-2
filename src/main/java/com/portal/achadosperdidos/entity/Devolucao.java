package com.portal.achadosperdidos.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor
@Entity
@Table(name = "devolucoes")
public class Devolucao extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false, unique = true)
    private Item item;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reivindicacao_id", nullable = false, unique = true)
    private Reivindicacao reivindicacao;

    /** Quem registrou a devolução (dono do item ou admin). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "confirmado_por", nullable = false)
    private Usuario confirmadoPor;

    @CreationTimestamp
    @Column(name = "data_devolucao", nullable = false, updatable = false)
    private LocalDateTime dataDevolucao;

    @Column(columnDefinition = "text")
    private String observacao;
}
