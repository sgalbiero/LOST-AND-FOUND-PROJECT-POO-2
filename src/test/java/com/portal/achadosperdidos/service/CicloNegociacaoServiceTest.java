package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.entity.Conversa;
import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.entity.Mediacao;
import com.portal.achadosperdidos.entity.Reivindicacao;
import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.enums.MotivoEncerramentoConversa;
import com.portal.achadosperdidos.enums.StatusItem;
import com.portal.achadosperdidos.enums.StatusMediacao;
import com.portal.achadosperdidos.enums.StatusReivindicacao;
import com.portal.achadosperdidos.repository.ConversaRepository;
import com.portal.achadosperdidos.repository.MediacaoRepository;
import com.portal.achadosperdidos.repository.ReivindicacaoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CicloNegociacaoServiceTest {
    @Mock ConversaRepository conversas;
    @Mock MediacaoRepository mediacoes;
    @Mock ReivindicacaoRepository reivindicacoes;
    @InjectMocks CicloNegociacaoService service;

    @Test
    void aceiteMantemSomenteConversaDoEscolhidoAtiva() {
        Usuario dono = usuario(1L);
        Usuario escolhido = usuario(2L);
        Usuario outro = usuario(3L);
        Item item = item(10L, dono, StatusItem.EM_NEGOCIACAO);
        Reivindicacao aceita = reivindicacao(20L, item, escolhido, true);
        Conversa conversaEscolhida = conversa(30L, item, dono, escolhido);
        Conversa conversaDescartada = conversa(31L, item, dono, outro);
        Mediacao mediacao = mediacao(40L);
        when(conversas.findAllByItemId(10L)).thenReturn(List.of(conversaEscolhida, conversaDescartada));
        when(mediacoes.findAllByConversaIdAndStatusIn(eq(31L), any())).thenReturn(List.of(mediacao));

        service.reivindicacaoAceita(aceita);

        assertThat(conversaEscolhida.isEncerrada()).isFalse();
        assertThat(conversaDescartada.getMotivoEncerramento())
                .isEqualTo(MotivoEncerramentoConversa.OUTRO_REIVINDICANTE_ACEITO);
        assertThat(mediacao.getStatus()).isEqualTo(StatusMediacao.CANCELADA);
    }

    @Test
    void encerramentoSemDevolucaoCancelaAceiteEReabreItem() {
        Usuario dono = usuario(1L);
        Usuario interessado = usuario(2L);
        Item item = item(10L, dono, StatusItem.EM_NEGOCIACAO);
        Reivindicacao aceita = reivindicacao(20L, item, interessado, true);
        Conversa conversa = conversa(30L, item, dono, interessado);
        when(reivindicacoes.findByItemIdAndReivindicanteId(10L, 2L)).thenReturn(Optional.of(aceita));
        when(mediacoes.findAllByConversaIdAndStatusIn(eq(30L), any())).thenReturn(List.of());

        service.encerrarSemDevolucao(item, conversa);

        assertThat(aceita.getStatus()).isEqualTo(StatusReivindicacao.CANCELADA);
        assertThat(item.getStatus()).isEqualTo(StatusItem.ABERTO);
        assertThat(conversa.getMotivoEncerramento()).isEqualTo(MotivoEncerramentoConversa.SEM_DEVOLUCAO);
    }

    @Test
    void encerramentoPelaEquipePreservaMediacaoParaHistorico() {
        Usuario dono = usuario(1L);
        Usuario interessado = usuario(2L);
        Item item = item(10L, dono, StatusItem.EM_NEGOCIACAO);
        Reivindicacao aceita = reivindicacao(20L, item, interessado, true);
        Conversa conversa = conversa(30L, item, dono, interessado);
        when(reivindicacoes.findByItemIdAndReivindicanteId(10L, 2L)).thenReturn(Optional.of(aceita));

        service.encerrarPelaEquipeSemDevolucao(item, conversa);

        assertThat(aceita.getStatus()).isEqualTo(StatusReivindicacao.CANCELADA);
        assertThat(item.getStatus()).isEqualTo(StatusItem.ABERTO);
        assertThat(conversa.getMotivoEncerramento()).isEqualTo(MotivoEncerramentoConversa.SEM_DEVOLUCAO);
        verifyNoInteractions(mediacoes);
    }

    private static Usuario usuario(Long id) {
        Usuario usuario = new Usuario();
        ReflectionTestUtils.setField(usuario, "id", id);
        usuario.setNome("Usuário " + id);
        return usuario;
    }

    private static Item item(Long id, Usuario dono, StatusItem status) {
        Item item = new Item();
        ReflectionTestUtils.setField(item, "id", id);
        item.setUsuario(dono);
        item.setStatus(status);
        return item;
    }

    private static Reivindicacao reivindicacao(Long id, Item item, Usuario interessado, boolean aceita) {
        Reivindicacao reivindicacao = new Reivindicacao();
        ReflectionTestUtils.setField(reivindicacao, "id", id);
        reivindicacao.setItem(item);
        reivindicacao.setReivindicante(interessado);
        if (aceita) reivindicacao.aceitar();
        return reivindicacao;
    }

    private static Conversa conversa(Long id, Item item, Usuario dono, Usuario interessado) {
        Conversa conversa = new Conversa();
        ReflectionTestUtils.setField(conversa, "id", id);
        conversa.setItem(item);
        conversa.setDonoItem(dono);
        conversa.setInteressado(interessado);
        return conversa;
    }

    private static Mediacao mediacao(Long id) {
        Mediacao mediacao = new Mediacao();
        ReflectionTestUtils.setField(mediacao, "id", id);
        return mediacao;
    }
}
