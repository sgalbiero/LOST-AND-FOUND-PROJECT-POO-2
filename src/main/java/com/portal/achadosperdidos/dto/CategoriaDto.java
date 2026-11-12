package com.portal.achadosperdidos.dto;

import com.portal.achadosperdidos.entity.Categoria;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class CategoriaDto {

    private CategoriaDto() {
    }

    public record Request(@NotBlank @Size(max = 255) String nome) {
    }

    public record Response(Long id, String nome, boolean ativo) {
        public static Response de(Categoria c) {
            return new Response(c.getId(), c.getNome(), c.isAtivo());
        }
    }
}
