package com.portal.achadosperdidos.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor
@Entity
@Table(name = "conversas",
       uniqueConstraints = @UniqueConstraint(name = "uq_conv", columnNames = {"item_id", "interessado_id"}))
public class Conversa extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    /** Quem publicou o item. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dono_item_id", nullable = false)
    private Usuario donoItem;

    /** Quem entrou em contato. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "interessado_id", nullable = false)
    private Usuario interessado;

    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @OneToMany(mappedBy = "conversa", cascade = CascadeType.REMOVE)
    @OrderBy("dataEnvio ASC")
    private List<Mensagem> mensagens = new ArrayList<>();

    @PrePersist
    @PreUpdate
    void validar() {
        if (donoItem != null && interessado != null && donoItem.equals(interessado)) {
            throw new IllegalStateException("Dono e interessado devem ser usuários diferentes");
        }
    }

    public boolean participa(Usuario u) {
        return u != null && (u.equals(donoItem) || u.equals(interessado));
    }
}
