package com.portal.achadosperdidos.controller;

import com.portal.achadosperdidos.dto.MediacaoDto;
import com.portal.achadosperdidos.service.MediacaoService;
import com.portal.achadosperdidos.service.UsuarioAtualService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mediacoes")
@RequiredArgsConstructor
public class MediacaoController {
    private final MediacaoService service;
    private final UsuarioAtualService usuarioAtual;

    @PostMapping("/item/{itemId}")
    @ResponseStatus(HttpStatus.CREATED)
    public MediacaoDto.Response solicitar(@PathVariable Long itemId,
                                           @Valid @RequestBody MediacaoDto.Solicitar req,
                                           Authentication auth) {
        return service.solicitar(usuarioAtual.id(auth), itemId, req);
    }

    @PostMapping("/conversa/{conversaId}")
    @ResponseStatus(HttpStatus.CREATED)
    public MediacaoDto.Response solicitarDaConversa(@PathVariable Long conversaId,
                                                     @Valid @RequestBody MediacaoDto.Solicitar req,
                                                     Authentication auth) {
        return service.solicitarDaConversa(usuarioAtual.id(auth), conversaId, req);
    }

    @PostMapping("/{id}/atribuicao")
    public MediacaoDto.Response assumir(@PathVariable Long id, Authentication auth) {
        return service.assumir(usuarioAtual.id(auth), id);
    }

    @PostMapping("/{id}/resolucao")
    public MediacaoDto.Response resolver(@PathVariable Long id, @Valid @RequestBody MediacaoDto.Resolver req,
                                         Authentication auth) {
        return service.resolver(usuarioAtual.id(auth), id, req);
    }

    @GetMapping("/abertas")
    public Page<MediacaoDto.Response> listarAbertas(Authentication auth, Pageable pageable) {
        return service.listarAbertas(usuarioAtual.id(auth), pageable);
    }

    @GetMapping("/minhas")
    public List<MediacaoDto.Response> listarMinhas(Authentication auth) {
        return service.listarMinhas(usuarioAtual.id(auth));
    }
}
