package com.portal.achadosperdidos.entity;

import com.portal.achadosperdidos.enums.RoleUsuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.*;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor
@Entity
@Table(name = "usuarios")
public class Usuario extends BaseEntity {

    @NotBlank @Size(max = 255)
    @Column(nullable = false)
    private String nome;

    // coluna CITEXT: comparação case-insensitive feita pelo banco
    @NotBlank @Email @Size(max = 255)
    @Column(nullable = false, unique = true, columnDefinition = "citext")
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Size(max = 50)
    private String telefone;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "role_usuario")
    private RoleUsuario role = RoleUsuario.ALUNO;

    @Column(nullable = false)
    private boolean ativo = true;

    @CreationTimestamp
    @Column(name = "data_cadastro", nullable = false, updatable = false)
    private LocalDateTime dataCadastro;

    @UpdateTimestamp
    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;
}
