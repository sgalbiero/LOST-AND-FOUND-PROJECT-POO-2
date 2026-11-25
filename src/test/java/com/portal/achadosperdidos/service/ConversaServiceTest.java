package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.entity.Conversa;
import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.entity.Mediacao;
import com.portal.achadosperdidos.entity.Reivindicacao;
import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.enums.StatusItem;
import com.portal.achadosperdidos.enums.StatusMediacao;
import com.portal.achadosperdidos.exception.RegraNegocioException;
import com.portal.achadosperdidos.repository.ConversaRepository;
import com.portal.achadosperdidos.repository.ItemRepository;
import com.portal.achadosperdidos.repository.MediacaoRepository;
import com.portal.achadosperdidos.repository.MensagemRepository;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ConversaServiceTest {
    @Mock ConversaRepository conversas;
    @Mock MensagemRepository mensagens;
    @Mock ItemRepository itens;
    @Mock ReivindicacaoRepository reivindicacoes;
    @Mock MediacaoRepository mediacoes;
    @Mock AcessoService acesso;
    @Mock CicloNegociacaoService cicloNegociacao;
    @InjectMocks ConversaService service;

    @Test
    void exigeReivindicacaoAntesDeIniciarConversa() {
        Usuario dono = usuario(1L);
        Usuario interessado = usuario(2L);
        Item item = item(10L, dono, StatusItem.ABERTO);
        when(acesso.usuarioAtivo(2L)).thenReturn(interessado);
        when(itens.findByIdParaAtualizar(10L)).thenReturn(Optional.of(item));
        when(reivindicacoes.findByItemIdAndReivindicanteId(10L, 2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.iniciar(2L, 10L))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessageContaining("Reivindique o item");
    }

    @Test
    void permiteConversaParaReivindicacaoPendenteEnquantoItemEstaAberto() {
        Usuario dono = usuario(1L);
        Usuario interessado = usuario(2L);
        Item item = item(10L, dono, StatusItem.ABERTO);
        Reivindicacao reivindicacao = reivindicacao(20L, item, interessado, false);
        when(acesso.usuarioAtivo(2L)).thenReturn(interessado);
        when(itens.findByIdParaAtualizar(10L)).thenReturn(Optional.of(item));
        when(reivindicacoes.findByItemIdAndReivindicanteId(10L, 2L)).thenReturn(Optional.of(reivindicacao));
        when(conversas.findByItemIdAndInteressadoId(10L, 2L)).thenReturn(Optional.empty());
        when(conversas.save(any())).thenAnswer(invocation -> {
            Conversa conversa = invocation.getArgument(0);
            ReflectionTestUtils.setField(conversa, "id", 30L);
            return conversa;
        });

        var resposta = service.iniciar(2L, 10L);

        assertThat(resposta.id()).isEqualTo(30L);
        assertThat(resposta.interessado().id()).isEqualTo(2L);
    }

    @Test
    void encerramentoPelaEquipeSemDevolucaoReabreItemEFinalizaReivindicacaoAceita() {
        Usuario dono = usuario(1L);
        Usuario interessado = usuario(2L);
        Usuario admin = usuario(3L);
        Item item = item(10L, dono, StatusItem.EM_NEGOCIACAO);
        Conversa conversa = conversa(30L, item, dono, interessado);
        Mediacao mediacao = new Mediacao();
        mediacao.setConversa(conversa);
        mediacao.setAdminResponsavel(admin);
        mediacao.setStatus(StatusMediacao.EM_ANDAMENTO);
        when(acesso.usuarioAtivo(3L)).thenReturn(admin);
        when(acesso.isAdmin(admin)).thenReturn(true);
        when(conversas.findItemIdById(30L)).thenReturn(Optional.of(10L));
        when(conversas.findDetalhadoParaAtualizarById(30L)).thenReturn(Optional.of(conversa));
        when(itens.findByIdParaAtualizar(10L)).thenReturn(Optional.of(item));
        when(mediacoes.findFirstByConversaIdOrderByDataSolicitacaoDesc(30L))
                .thenReturn(Optional.of(mediacao));

        var resultado = service.solicitarEncerramento(3L, 30L);

        assertThat(conversa.isEncerrada()).isTrue();
        assertThat(conversa.isEncerradaPelaEquipe()).isTrue();
        assertThat(resultado.mediacao().status()).isEqualTo(StatusMediacao.EM_ANDAMENTO);
        verify(cicloNegociacao).encerrarPelaEquipeSemDevolucao(item, conversa);
    }

    @Test
    void listaConversaEncerradaComoHistoricoDoMediadorResponsavel() {
        Usuario dono = usuario(1L);
        Usuario interessado = usuario(2L);
        Usuario admin = usuario(3L);
        Item item = item(10L, dono, StatusItem.ABERTO);
        Conversa conversa = conversa(30L, item, dono, interessado);
        conversa.encerrarPelaEquipe();
        Mediacao mediacao = new Mediacao();
        mediacao.setConversa(conversa);
        mediacao.setAdminResponsavel(admin);
        mediacao.setStatus(StatusMediacao.RESOLVIDO);
        when(acesso.usuarioAtivo(3L)).thenReturn(admin);
        when(acesso.isAdmin(admin)).thenReturn(true);
        when(mediacoes.findByAdminResponsavelIdOrderByDataSolicitacaoDesc(3L))
                .thenReturn(List.of(mediacao));

        var resultado = service.listarDoUsuario(3L);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).id()).isEqualTo(30L);
        assertThat(resultado.get(0).dataEncerramento()).isNotNull();
        assertThat(resultado.get(0).mediacao().status()).isEqualTo(StatusMediacao.RESOLVIDO);
    }

    @Test
    void permiteAoMediadorResponsavelLerConversaEncerrada() {
        Usuario dono = usuario(1L);
        Usuario interessado = usuario(2L);
        Usuario admin = usuario(3L);
        Item item = item(10L, dono, StatusItem.ABERTO);
        Conversa conversa = conversa(30L, item, dono, interessado);
        conversa.encerrarPelaEquipe();
        when(acesso.usuarioAtivo(3L)).thenReturn(admin);
        when(acesso.isAdmin(admin)).thenReturn(true);
        when(conversas.findDetalhadoById(30L)).thenReturn(Optional.of(conversa));
        when(mediacoes.existsByConversaIdAndAdminResponsavelId(30L, 3L)).thenReturn(true);

        var resultado = service.buscar(3L, 30L);

        assertThat(resultado.id()).isEqualTo(30L);
        assertThat(resultado.dataEncerramento()).isNotNull();
    }

    private static Usuario usuario(Long id) {
        Usuario usuario = new Usuario();
        ReflectionTestUtils.setField(usuario, "id", id);
        usuario.setNome("Usuário " + id);
        usuario.setAtivo(true);
        return usuario;
    }

    private static Item item(Long id, Usuario dono, StatusItem status) {
        Item item = new Item();
        ReflectionTestUtils.setField(item, "id", id);
        item.setTitulo("Objeto");
        item.setUsuario(dono);
        item.setStatus(status);
        return item;
    }

    private static Reivindicacao reivindicacao(Long id, Item item, Usuario interessado, boolean aceita) {
        Reivindicacao reivindicacao = new Reivindicacao();
        ReflectionTestUtils.setField(reivindicacao, "id", id);
        reivindicacao.setItem(item);
        reivindicacao.setReivindicante(interessado);
        reivindicacao.setJustificativa("Característica reservada");
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
}
