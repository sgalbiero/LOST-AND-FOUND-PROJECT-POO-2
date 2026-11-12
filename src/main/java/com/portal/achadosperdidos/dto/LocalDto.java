package com.portal.achadosperdidos.dto;

import com.portal.achadosperdidos.entity.Local;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class LocalDto {

    private LocalDto() {
    }

    public record Request(@NotBlank @Size(max = 255) String nome, String descricao) {
    }

    public record Response(Long id, String nome, String descricao, boolean ativo) {
        public static Response de(Local l) {
            return new Response(l.getId(), l.getNome(), l.getDescricao(), l.isAtivo());
        }
    }
}
