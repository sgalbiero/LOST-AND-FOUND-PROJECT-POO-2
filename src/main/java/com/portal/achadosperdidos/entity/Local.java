package com.portal.achadosperdidos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor
@Entity
@Table(name = "locais")
public class Local extends BaseEntity {

    @NotBlank @Size(max = 255)
    @Column(nullable = false, unique = true)
    private String nome;

    @Column(columnDefinition = "text")
    private String descricao;

    @Column(nullable = false)
    private boolean ativo = true;
}
