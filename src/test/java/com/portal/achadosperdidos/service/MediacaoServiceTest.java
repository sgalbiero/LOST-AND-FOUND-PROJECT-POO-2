package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.dto.MediacaoDto;
import com.portal.achadosperdidos.entity.Conversa;
import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.exception.RegraNegocioException;
import com.portal.achadosperdidos.repository.MediacaoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MediacaoServiceTest {
    @Mock MediacaoRepository mediacoes;
    @Mock AcessoService acesso;
    @Mock ConversaService conversaService;
    @InjectMocks MediacaoService service;

    @Test
    void naoPermiteSolicitarMediacaoEmConversaEncerrada() {
        Usuario dono = usuario(1L);
        Usuario interessado = usuario(2L);
        Item item = new Item();
        ReflectionTestUtils.setField(item, "id", 10L);
        item.setUsuario(dono);
        Conversa conversa = new Conversa();
        conversa.setItem(item);
        conversa.setDonoItem(dono);
        conversa.setInteressado(interessado);
        conversa.encerrarPelaEquipe();
        when(acesso.usuarioAtivo(2L)).thenReturn(interessado);
        when(conversaService.carregarComoParticipanteParaAtualizar(2L, 20L)).thenReturn(conversa);
        doThrow(new RegraNegocioException("Esta conversa já foi encerrada"))
                .when(conversaService).exigirVinculoAtivo(conversa);

        assertThatThrownBy(() -> service.solicitarDaConversa(2L, 20L, new MediacaoDto.Solicitar("Preciso de ajuda")))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessageContaining("encerrada");
        verifyNoInteractions(mediacoes);
    }

    private static Usuario usuario(Long id) {
        Usuario usuario = new Usuario();
        ReflectionTestUtils.setField(usuario, "id", id);
        usuario.setAtivo(true);
        return usuario;
    }
}
