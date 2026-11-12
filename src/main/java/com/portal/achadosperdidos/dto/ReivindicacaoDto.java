package com.portal.achadosperdidos.dto;

import com.portal.achadosperdidos.entity.Reivindicacao;
import com.portal.achadosperdidos.enums.StatusReivindicacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class ReivindicacaoDto {

    private ReivindicacaoDto() {
    }

    public record Criar(@NotBlank @Size(max = 1000) String justificativa) {
    }

    public record Response(Long id, Long itemId, String itemTitulo, UsuarioDto.Resumo reivindicante,
                           String justificativa, StatusReivindicacao status,
                           LocalDateTime dataCriacao, LocalDateTime dataResposta) {
        public static Response de(Reivindicacao r) {
            return new Response(r.getId(), r.getItem().getId(), r.getItem().getTitulo(),
                    UsuarioDto.Resumo.de(r.getReivindicante()), r.getJustificativa(),
                    r.getStatus(), r.getDataCriacao(), r.getDataResposta());
        }
    }
}
