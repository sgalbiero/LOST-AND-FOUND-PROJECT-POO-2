package com.portal.achadosperdidos.controller;

import com.portal.achadosperdidos.dto.CategoriaDto;
import com.portal.achadosperdidos.service.CategoriaService;
import com.portal.achadosperdidos.service.UsuarioAtualService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {
    private final CategoriaService service;
    private final UsuarioAtualService usuarioAtual;

    @GetMapping
    public List<CategoriaDto.Response> listarAtivas() { return service.listarAtivas(); }

    @GetMapping("/admin")
    public List<CategoriaDto.Response> listarTodas(Authentication auth) {
        return service.listarTodas(usuarioAtual.id(auth));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaDto.Response criar(@Valid @RequestBody CategoriaDto.Request req, Authentication auth) {
        return service.criar(usuarioAtual.id(auth), req);
    }

    @PutMapping("/{id}")
    public CategoriaDto.Response atualizar(@PathVariable Long id, @Valid @RequestBody CategoriaDto.Request req,
                                            Authentication auth) {
        return service.atualizar(usuarioAtual.id(auth), id, req);
    }

    @PatchMapping("/{id}/ativo")
    public CategoriaDto.Response definirAtiva(@PathVariable Long id, @RequestParam boolean ativo,
                                               Authentication auth) {
        return service.definirAtiva(usuarioAtual.id(auth), id, ativo);
    }
}
