package com.portal.achadosperdidos.dto;

import com.portal.achadosperdidos.entity.Mediacao;
import com.portal.achadosperdidos.enums.StatusMediacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class MediacaoDto {

    private MediacaoDto() {
    }

    public record Solicitar(@NotBlank @Size(max = 2000) String motivo) {
    }

    public record Resolver(@NotBlank @Size(max = 2000) String parecer) {
    }

    public record Response(Long id, Long itemId, String itemTitulo, UsuarioDto.Resumo solicitante,
                           UsuarioDto.Resumo adminResponsavel, String motivo, StatusMediacao status,
                           LocalDateTime dataSolicitacao, LocalDateTime dataResolucao, String parecer) {
        public static Response de(Mediacao m) {
            return new Response(m.getId(), m.getItem().getId(), m.getItem().getTitulo(),
                    UsuarioDto.Resumo.de(m.getSolicitante()), UsuarioDto.Resumo.de(m.getAdminResponsavel()),
                    m.getMotivo(), m.getStatus(), m.getDataSolicitacao(), m.getDataResolucao(), m.getParecer());
        }
    }
}
