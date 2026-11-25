package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.dto.MensagemDto;
import com.portal.achadosperdidos.entity.Conversa;
import com.portal.achadosperdidos.exception.RegraNegocioException;
import com.portal.achadosperdidos.repository.MensagemRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MensagemServiceTest {
    @Mock MensagemRepository mensagens;
    @Mock ConversaService conversas;
    @Mock AcessoService acesso;
    @InjectMocks MensagemService service;

    @Test
    void bloqueiaEnvioEmConversaEncerradaMesmoParaMediador() {
        Conversa conversa = new Conversa();
        conversa.encerrarPelaEquipe();
        when(conversas.carregarComAcessoMensagensParaAtualizar(3L, 30L)).thenReturn(conversa);
        doThrow(new RegraNegocioException("Esta conversa já foi encerrada"))
                .when(conversas).exigirVinculoAtivo(conversa);

        assertThatThrownBy(() -> service.enviar(3L, 30L, new MensagemDto.Enviar("Nova mensagem")))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessageContaining("encerrada");
        verifyNoInteractions(mensagens, acesso);
    }
}
