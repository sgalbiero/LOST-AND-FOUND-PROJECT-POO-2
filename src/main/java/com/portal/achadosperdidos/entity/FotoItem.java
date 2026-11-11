package com.portal.achadosperdidos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor
@Entity
@Table(name = "fotos_item",
       uniqueConstraints = @UniqueConstraint(name = "uq_foto_item_ordem", columnNames = {"item_id", "ordem"}))
public class FotoItem extends BaseEntity {

    @NotBlank @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String url;

    @Min(1) @Max(3)
    @Column(nullable = false)
    private short ordem = 1;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;
}
