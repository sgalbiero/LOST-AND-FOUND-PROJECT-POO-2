package com.portal.achadosperdidos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor
@Entity
@Table(name = "categorias")
public class Categoria extends BaseEntity {

    @NotBlank @Size(max = 255)
    @Column(nullable = false, unique = true)
    private String nome;

    @Column(nullable = false)
    private boolean ativo = true;
}
