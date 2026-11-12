package com.portal.achadosperdidos.dto;

import com.portal.achadosperdidos.entity.Devolucao;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class DevolucaoDto {

    private DevolucaoDto() {
    }

    public record Registrar(@Size(max = 1000) String observacao) {
    }

    public record Response(Long id, Long itemId, Long reivindicacaoId, UsuarioDto.Resumo confirmadoPor,
                           LocalDateTime dataDevolucao, String observacao) {
        public static Response de(Devolucao d) {
            return new Response(d.getId(), d.getItem().getId(), d.getReivindicacao().getId(),
                    UsuarioDto.Resumo.de(d.getConfirmadoPor()), d.getDataDevolucao(), d.getObservacao());
        }
    }
}
