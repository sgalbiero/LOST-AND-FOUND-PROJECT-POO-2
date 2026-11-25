package com.portal.achadosperdidos.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ConversaTest {

    @Test
    void encerraSomenteDepoisDaConfirmacaoDosDoisParticipantes() {
        Usuario dono = usuario(1L);
        Usuario interessado = usuario(2L);
        Conversa conversa = new Conversa();
        conversa.setDonoItem(dono);
        conversa.setInteressado(interessado);

        conversa.solicitarEncerramento(1L);

        assertTrue(conversa.isEncerramentoDonoSolicitado());
        assertFalse(conversa.isEncerramentoInteressadoSolicitado());
        assertFalse(conversa.isEncerrada());

        conversa.solicitarEncerramento(2L);

        assertTrue(conversa.isEncerramentoInteressadoSolicitado());
        assertTrue(conversa.isEncerrada());
        assertNotNull(conversa.getDataEncerramento());
    }

    @Test
    void rejeitaConfirmacaoDeQuemNaoParticipa() {
        Conversa conversa = new Conversa();
        conversa.setDonoItem(usuario(1L));
        conversa.setInteressado(usuario(2L));

        assertThrows(IllegalArgumentException.class, () -> conversa.solicitarEncerramento(3L));
    }

    @Test
    void equipePodeEncerrarSemConfirmacaoDosParticipantes() {
        Conversa conversa = new Conversa();
        conversa.setDonoItem(usuario(1L));
        conversa.setInteressado(usuario(2L));

        conversa.encerrarPelaEquipe();

        assertTrue(conversa.isEncerrada());
        assertTrue(conversa.isEncerradaPelaEquipe());
        assertFalse(conversa.isEncerramentoDonoSolicitado());
        assertFalse(conversa.isEncerramentoInteressadoSolicitado());
    }

    private Usuario usuario(Long id) {
        Usuario usuario = mock(Usuario.class);
        when(usuario.getId()).thenReturn(id);
        return usuario;
    }
}
