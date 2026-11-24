package com.portal.achadosperdidos.controller;

import com.portal.achadosperdidos.dto.ReivindicacaoDto;
import com.portal.achadosperdidos.service.ReivindicacaoService;
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
@RequiredArgsConstructor
public class ReivindicacaoController {
    private final ReivindicacaoService service;
    private final UsuarioAtualService usuarioAtual;

    @PostMapping("/api/itens/{itemId}/reivindicacoes")
    @ResponseStatus(HttpStatus.CREATED)
    public ReivindicacaoDto.Response criar(@PathVariable Long itemId,
                                            @Valid @RequestBody ReivindicacaoDto.Criar req,
                                            Authentication auth) {
        return service.criar(usuarioAtual.id(auth), itemId, req);
    }

    @GetMapping("/api/itens/{itemId}/reivindicacoes")
    public List<ReivindicacaoDto.Response> listarPorItem(@PathVariable Long itemId, Authentication auth) {
        return service.listarPorItem(usuarioAtual.id(auth), itemId);
    }

    @GetMapping("/api/reivindicacoes/minhas")
    public Page<ReivindicacaoDto.Response> listarMinhas(Authentication auth, Pageable pageable) {
        return service.listarMinhas(usuarioAtual.id(auth), pageable);
    }

    @GetMapping("/api/reivindicacoes/recebidas")
    public Page<ReivindicacaoDto.Response> listarRecebidas(Authentication auth, Pageable pageable) {
        return service.listarRecebidas(usuarioAtual.id(auth), pageable);
    }

    @PostMapping("/api/reivindicacoes/{id}/aceite")
    public ReivindicacaoDto.Response aceitar(@PathVariable Long id, Authentication auth) {
        return service.aceitar(usuarioAtual.id(auth), id);
    }

    @PostMapping("/api/reivindicacoes/{id}/recusa")
    public ReivindicacaoDto.Response recusar(@PathVariable Long id, Authentication auth) {
        return service.recusar(usuarioAtual.id(auth), id);
    }

    @PostMapping("/api/reivindicacoes/{id}/cancelamento")
    public ReivindicacaoDto.Response cancelar(@PathVariable Long id, Authentication auth) {
        return service.cancelar(usuarioAtual.id(auth), id);
    }
}
