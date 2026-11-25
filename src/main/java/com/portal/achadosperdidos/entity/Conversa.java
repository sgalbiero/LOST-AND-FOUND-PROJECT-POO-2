package com.portal.achadosperdidos.entity;

import com.portal.achadosperdidos.enums.MotivoEncerramentoConversa;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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

    @CreationTimestamp
    @Column(name = "ultima_atividade", nullable = false)
    private LocalDateTime ultimaAtividade;

    @Column(name = "encerramento_dono_solicitado", nullable = false)
    private boolean encerramentoDonoSolicitado;

    @Column(name = "encerramento_interessado_solicitado", nullable = false)
    private boolean encerramentoInteressadoSolicitado;

    @Column(name = "data_encerramento")
    private LocalDateTime dataEncerramento;

    @Column(name = "encerrada_pela_equipe", nullable = false)
    private boolean encerradaPelaEquipe;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "motivo_encerramento", columnDefinition = "motivo_encerramento_conversa")
    private MotivoEncerramentoConversa motivoEncerramento;

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

    public boolean participaPorId(Long usuarioId) {
        return usuarioId != null
                && ((donoItem != null && usuarioId.equals(donoItem.getId()))
                || (interessado != null && usuarioId.equals(interessado.getId())));
    }

    public void solicitarEncerramento(Long usuarioId) {
        if (!participaPorId(usuarioId)) {
            throw new IllegalArgumentException("Usuário não participa da conversa");
        }
        if (usuarioId.equals(donoItem.getId())) {
            encerramentoDonoSolicitado = true;
        } else {
            encerramentoInteressadoSolicitado = true;
        }
        ultimaAtividade = LocalDateTime.now();
        if (encerramentoDonoSolicitado && encerramentoInteressadoSolicitado && dataEncerramento == null) {
            dataEncerramento = ultimaAtividade;
            motivoEncerramento = MotivoEncerramentoConversa.SEM_DEVOLUCAO;
        }
    }

    public boolean isEncerrada() {
        return dataEncerramento != null;
    }

    public void registrarAtividade() {
        ultimaAtividade = LocalDateTime.now();
    }

    public void encerrarPelaEquipe() {
        encerradaPelaEquipe = true;
        encerrarPorSistema(MotivoEncerramentoConversa.SEM_DEVOLUCAO);
    }

    public void encerrarPorSistema(MotivoEncerramentoConversa motivo) {
        if (dataEncerramento == null) {
            dataEncerramento = LocalDateTime.now();
            ultimaAtividade = dataEncerramento;
            motivoEncerramento = motivo;
        } else if (motivoEncerramento == null) {
            motivoEncerramento = motivo;
        }
    }
}
