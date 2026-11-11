package com.portal.achadosperdidos.entity;

import com.portal.achadosperdidos.enums.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.*;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor
@Entity
@Table(name = "itens")
public class Item extends BaseEntity {

    @NotBlank @Size(max = 255)
    @Column(nullable = false)
    private String titulo;

    @NotBlank @Size(max = 300)
    @Column(nullable = false, length = 300)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "tipo_item")
    private TipoItem tipo;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "status_item")
    private StatusItem status = StatusItem.ABERTO;

    @PastOrPresent
    @Column(name = "data_ocorrencia", nullable = false)
    private LocalDate dataOcorrencia = LocalDate.now();

    @CreationTimestamp
    @Column(name = "data_publicacao", nullable = false, updatable = false)
    private LocalDateTime dataPublicacao;

    @UpdateTimestamp
    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @Column(name = "expira_em")
    private LocalDateTime expiraEm;

    /** Onde o item está agora (relevante para ENCONTRADO), ex.: "Portaria". */
    @Size(max = 255)
    @Column(name = "local_guarda")
    private String localGuarda;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "local_id", nullable = false)
    private Local local;

    // O mínimo de 1 foto deve ser validado no service.
    @Size(max = 3, message = "Um item pode ter no máximo 3 fotos")
    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    private List<FotoItem> fotos = new ArrayList<>();

    public void adicionarFoto(String url) {
        if (fotos.size() >= 3) {
            throw new IllegalStateException("Um item pode ter no máximo 3 fotos");
        }
        FotoItem foto = new FotoItem();
        foto.setUrl(url);
        foto.setOrdem((short) (fotos.size() + 1));
        foto.setItem(this);
        fotos.add(foto);
    }

    public void removerFoto(FotoItem foto) {
        fotos.remove(foto);
        short ordem = 1;
        for (FotoItem f : fotos) f.setOrdem(ordem++);
    }
}
