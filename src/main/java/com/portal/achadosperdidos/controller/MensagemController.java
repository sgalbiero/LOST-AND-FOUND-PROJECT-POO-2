package com.portal.achadosperdidos.controller;

import com.portal.achadosperdidos.dto.MensagemDto;
import com.portal.achadosperdidos.service.MensagemService;
import com.portal.achadosperdidos.service.UsuarioAtualService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class MensagemController {
    private final MensagemService service;
    private final UsuarioAtualService usuarioAtual;

    @PostMapping("/api/conversas/{conversaId}/mensagens")
    @ResponseStatus(HttpStatus.CREATED)
    public MensagemDto.Response enviar(@PathVariable Long conversaId,
                                        @Valid @RequestBody MensagemDto.Enviar req,
                                        Authentication auth) {
        return service.enviar(usuarioAtual.id(auth), conversaId, req);
    }

    @GetMapping("/api/conversas/{conversaId}/mensagens")
    public Page<MensagemDto.Response> listar(@PathVariable Long conversaId, Authentication auth,
                                             Pageable pageable) {
        return service.listar(usuarioAtual.id(auth), conversaId, pageable);
    }

    @PostMapping("/api/conversas/{conversaId}/mensagens/leitura")
    public int marcarComoLidas(@PathVariable Long conversaId, Authentication auth) {
        return service.marcarComoLidas(usuarioAtual.id(auth), conversaId);
    }

    @GetMapping("/api/mensagens/nao-lidas/total")
    public long contarNaoLidas(Authentication auth) {
        return service.contarNaoLidas(usuarioAtual.id(auth));
    }
}
