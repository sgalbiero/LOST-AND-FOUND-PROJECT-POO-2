package com.portal.achadosperdidos.dto;

import com.portal.achadosperdidos.entity.Denuncia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class DenunciaDto {

    private DenunciaDto() {
    }

    public record Criar(@NotBlank @Size(max = 1000) String motivo) {
    }

    public record Response(Long id, UsuarioDto.Resumo denunciante, Long itemId, Long mensagemId,
                           String motivo, boolean resolvida, LocalDateTime dataCriacao) {
        public static Response de(Denuncia d) {
            return new Response(d.getId(), UsuarioDto.Resumo.de(d.getDenunciante()),
                    d.getItem() != null ? d.getItem().getId() : null,
                    d.getMensagem() != null ? d.getMensagem().getId() : null,
                    d.getMotivo(), d.isResolvida(), d.getDataCriacao());
        }
    }
}
