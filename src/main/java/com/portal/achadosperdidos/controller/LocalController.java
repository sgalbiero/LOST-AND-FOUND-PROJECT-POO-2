package com.portal.achadosperdidos.controller;

import com.portal.achadosperdidos.dto.LocalDto;
import com.portal.achadosperdidos.service.LocalService;
import com.portal.achadosperdidos.service.UsuarioAtualService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locais")
@RequiredArgsConstructor
public class LocalController {
    private final LocalService service;
    private final UsuarioAtualService usuarioAtual;

    @GetMapping
    public List<LocalDto.Response> listarAtivos() { return service.listarAtivos(); }

    @GetMapping("/admin")
    public List<LocalDto.Response> listarTodos(Authentication auth) {
        return service.listarTodos(usuarioAtual.id(auth));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LocalDto.Response criar(@Valid @RequestBody LocalDto.Request req, Authentication auth) {
        return service.criar(usuarioAtual.id(auth), req);
    }

    @PutMapping("/{id}")
    public LocalDto.Response atualizar(@PathVariable Long id, @Valid @RequestBody LocalDto.Request req,
                                       Authentication auth) {
        return service.atualizar(usuarioAtual.id(auth), id, req);
    }

    @PatchMapping("/{id}/ativo")
    public LocalDto.Response definirAtivo(@PathVariable Long id, @RequestParam boolean ativo,
                                          Authentication auth) {
        return service.definirAtivo(usuarioAtual.id(auth), id, ativo);
    }
}
