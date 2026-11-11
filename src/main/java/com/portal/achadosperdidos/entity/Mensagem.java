package com.portal.achadosperdidos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor
@Entity
@Table(name = "mensagens")
public class Mensagem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversa_id", nullable = false)
    private Conversa conversa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "remetente_id", nullable = false)
    private Usuario remetente;

    @NotBlank
    @Column(nullable = false, columnDefinition = "text")
    private String conteudo;

    @CreationTimestamp
    @Column(name = "data_envio", nullable = false, updatable = false)
    private LocalDateTime dataEnvio;

    @Column(nullable = false)
    private boolean lida = false;

    @PrePersist
    void validarRemetente() {
        if (conversa != null && !conversa.participa(remetente)) {
            throw new IllegalStateException("Remetente não participa desta conversa");
        }
    }
}
