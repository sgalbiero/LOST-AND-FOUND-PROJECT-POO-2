package com.portal.achadosperdidos.dto;

import com.portal.achadosperdidos.entity.Conversa;

import java.time.LocalDateTime;

public final class ConversaDto {

    private ConversaDto() {
    }

    public record Response(Long id, Long itemId, String itemTitulo, UsuarioDto.Resumo donoItem,
                           UsuarioDto.Resumo interessado, LocalDateTime dataCriacao, long naoLidas) {
        public static Response de(Conversa c, long naoLidas) {
            return new Response(c.getId(), c.getItem().getId(), c.getItem().getTitulo(),
                    UsuarioDto.Resumo.de(c.getDonoItem()), UsuarioDto.Resumo.de(c.getInteressado()),
                    c.getDataCriacao(), naoLidas);
        }
    }
}
