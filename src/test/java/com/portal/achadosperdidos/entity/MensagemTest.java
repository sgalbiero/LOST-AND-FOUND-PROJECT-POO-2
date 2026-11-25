package com.portal.achadosperdidos.entity;

import com.portal.achadosperdidos.enums.RoleUsuario;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class MensagemTest {

    @Test
    void aceitaMensagemDaEquipeDeApoio() {
        Conversa conversa = conversa();
        Usuario mediador = new Usuario();
        mediador.setRole(RoleUsuario.ADMIN);
        Mensagem mensagem = mensagem(conversa, mediador);

        assertDoesNotThrow(mensagem::validarRemetente);
    }

    @Test
    void rejeitaTerceiroQueNaoEParticipanteNemMediador() {
        Mensagem mensagem = mensagem(conversa(), new Usuario());

        assertThrows(IllegalStateException.class, mensagem::validarRemetente);
    }

    private Conversa conversa() {
        Conversa conversa = new Conversa();
        conversa.setDonoItem(new Usuario());
        conversa.setInteressado(new Usuario());
        return conversa;
    }

    private Mensagem mensagem(Conversa conversa, Usuario remetente) {
        Mensagem mensagem = new Mensagem();
        mensagem.setConversa(conversa);
        mensagem.setRemetente(remetente);
        mensagem.setConteudo("Mensagem de teste");
        return mensagem;
    }
}
