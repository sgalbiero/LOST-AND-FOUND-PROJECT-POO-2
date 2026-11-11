package com.portal.achadosperdidos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor
@Entity
@Table(name = "denuncias")
public class Denuncia extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "denunciante_id", nullable = false)
    private Usuario denunciante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mensagem_id")
    private Mensagem mensagem;

    @NotBlank
    @Column(nullable = false, columnDefinition = "text")
    private String motivo;

    @Column(nullable = false)
    private boolean resolvida = false;

    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    /** Espelha o CHECK do banco: exatamente um alvo (item OU mensagem). */
    @PrePersist
    @PreUpdate
    void validarAlvo() {
        if ((item == null) == (mensagem == null)) {
            throw new IllegalStateException("A denúncia deve ter exatamente um alvo: item ou mensagem");
        }
    }
}
