package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.dto.ReivindicacaoDto;
import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.entity.Reivindicacao;
import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.enums.StatusItem;
import com.portal.achadosperdidos.enums.StatusReivindicacao;
import com.portal.achadosperdidos.repository.ItemRepository;
import com.portal.achadosperdidos.repository.ReivindicacaoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReivindicacaoServiceTest {
    @Mock ReivindicacaoRepository reivindicacoes;
    @Mock ItemRepository itens;
    @Mock AcessoService acesso;
    @InjectMocks ReivindicacaoService service;

    @Test
    void criarMantemItemAbertoAteReivindicacaoSerAceita() {
        Usuario dono = usuario(1L, "Dono");
        Usuario interessado = usuario(2L, "Interessado");
        Item item = item(10L, dono, StatusItem.ABERTO);

        when(acesso.usuarioAtivo(2L)).thenReturn(interessado);
        when(itens.findById(10L)).thenReturn(Optional.of(item));
        when(reivindicacoes.existsByItemIdAndReivindicanteId(10L, 2L)).thenReturn(false);
        when(reivindicacoes.save(any())).thenAnswer(invocacao -> {
            Reivindicacao r = invocacao.getArgument(0);
            ReflectionTestUtils.setField(r, "id", 20L);
            return r;
        });

        service.criar(2L, 10L, new ReivindicacaoDto.Criar("  É meu objeto  "));

        assertThat(item.getStatus()).isEqualTo(StatusItem.ABERTO);
        verify(itens, never()).save(any());
    }

    @Test
    void cancelarAceitaReabreItemEmNegociacao() {
        Usuario dono = usuario(1L, "Dono");
        Usuario interessado = usuario(2L, "Interessado");
        Item item = item(10L, dono, StatusItem.EM_NEGOCIACAO);
        Reivindicacao reivindicacao = new Reivindicacao();
        ReflectionTestUtils.setField(reivindicacao, "id", 20L);
        reivindicacao.setItem(item);
        reivindicacao.setReivindicante(interessado);
        reivindicacao.aceitar();

        when(acesso.usuarioAtivo(2L)).thenReturn(interessado);
        when(reivindicacoes.findItemIdById(20L)).thenReturn(Optional.of(10L));
        when(itens.findByIdParaAtualizar(10L)).thenReturn(Optional.of(item));
        when(reivindicacoes.findById(20L)).thenReturn(Optional.of(reivindicacao));

        service.cancelar(2L, 20L);

        assertThat(reivindicacao.getStatus()).isEqualTo(StatusReivindicacao.CANCELADA);
        assertThat(item.getStatus()).isEqualTo(StatusItem.ABERTO);
    }

    private static Usuario usuario(Long id, String nome) {
        Usuario usuario = new Usuario();
        ReflectionTestUtils.setField(usuario, "id", id);
        usuario.setNome(nome);
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
}
