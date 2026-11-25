package com.portal.achadosperdidos.controller;

import com.portal.achadosperdidos.dto.ConversaDto;
import com.portal.achadosperdidos.service.ConversaService;
import com.portal.achadosperdidos.service.UsuarioAtualService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversas")
@RequiredArgsConstructor
public class ConversaController {
    private final ConversaService service;
    private final UsuarioAtualService usuarioAtual;

    @PostMapping("/item/{itemId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ConversaDto.Response iniciar(@PathVariable Long itemId, Authentication auth) {
        return service.iniciar(usuarioAtual.id(auth), itemId);
    }

    @GetMapping
    public List<ConversaDto.Response> listar(Authentication auth) {
        return service.listarDoUsuario(usuarioAtual.id(auth));
    }

    @GetMapping("/equipe/ativas")
    public List<ConversaDto.Response> listarAbertasParaEquipe(Authentication auth) {
        return service.listarAbertasParaEquipe(usuarioAtual.id(auth));
    }

    @GetMapping("/{id}")
    public ConversaDto.Response buscar(@PathVariable Long id, Authentication auth) {
        return service.buscar(usuarioAtual.id(auth), id);
    }

    @PostMapping("/{id}/encerramento")
    public ConversaDto.Response solicitarEncerramento(@PathVariable Long id, Authentication auth) {
        return service.solicitarEncerramento(usuarioAtual.id(auth), id);
    }
}
