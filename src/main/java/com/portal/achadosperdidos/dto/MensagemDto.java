package com.portal.achadosperdidos.dto;

import com.portal.achadosperdidos.entity.Mensagem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class MensagemDto {

    private MensagemDto() {
    }

    public record Enviar(@NotBlank @Size(max = 2000) String conteudo) {
    }

    public record Response(Long id, Long conversaId, UsuarioDto.Resumo remetente,
                           String conteudo, LocalDateTime dataEnvio, boolean lida) {
        public static Response de(Mensagem m) {
            return new Response(m.getId(), m.getConversa().getId(), UsuarioDto.Resumo.de(m.getRemetente()),
                    m.getConteudo(), m.getDataEnvio(), m.isLida());
        }
    }
}
