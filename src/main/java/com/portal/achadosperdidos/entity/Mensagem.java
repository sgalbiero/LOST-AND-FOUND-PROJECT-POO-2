package com.portal.achadosperdidos.entity;

import com.portal.achadosperdidos.enums.RoleUsuario;
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
        boolean participante = conversa != null && conversa.participa(remetente);
        boolean equipeApoio = remetente != null && remetente.getRole() == RoleUsuario.ADMIN;
        if (conversa != null && !participante && !equipeApoio) {
            throw new IllegalStateException("Remetente não tem acesso a esta conversa");
        }
    }
}
