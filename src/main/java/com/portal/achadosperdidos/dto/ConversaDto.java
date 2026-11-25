package com.portal.achadosperdidos.dto;

import com.portal.achadosperdidos.entity.Conversa;
import com.portal.achadosperdidos.entity.Mediacao;
import com.portal.achadosperdidos.enums.StatusMediacao;

import java.time.LocalDateTime;

public final class ConversaDto {

    private ConversaDto() {
    }

    public record MediacaoResumo(Long id, StatusMediacao status, UsuarioDto.Resumo responsavel) {
        public static MediacaoResumo de(Mediacao mediacao) {
            return mediacao == null ? null : new MediacaoResumo(mediacao.getId(), mediacao.getStatus(),
                    UsuarioDto.Resumo.de(mediacao.getAdminResponsavel()));
        }
    }

    public record Response(Long id, Long itemId, String itemTitulo, UsuarioDto.Resumo donoItem,
                           UsuarioDto.Resumo interessado, LocalDateTime dataCriacao, long naoLidas,
                           boolean encerramentoDonoSolicitado, boolean encerramentoInteressadoSolicitado,
                           LocalDateTime dataEncerramento, boolean encerradaPelaEquipe,
                           MediacaoResumo mediacao) {
        public static Response de(Conversa c, long naoLidas) {
            return de(c, naoLidas, null);
        }

        public static Response de(Conversa c, long naoLidas, Mediacao mediacao) {
            return new Response(c.getId(), c.getItem().getId(), c.getItem().getTitulo(),
                    UsuarioDto.Resumo.de(c.getDonoItem()), UsuarioDto.Resumo.de(c.getInteressado()),
                    c.getDataCriacao(), naoLidas, c.isEncerramentoDonoSolicitado(),
                    c.isEncerramentoInteressadoSolicitado(), c.getDataEncerramento(),
                    c.isEncerradaPelaEquipe(), MediacaoResumo.de(mediacao));
        }
    }
}
