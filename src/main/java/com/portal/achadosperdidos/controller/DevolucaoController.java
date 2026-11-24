package com.portal.achadosperdidos.controller;

import com.portal.achadosperdidos.dto.DevolucaoDto;
import com.portal.achadosperdidos.service.DevolucaoService;
import com.portal.achadosperdidos.service.UsuarioAtualService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/itens/{itemId}/devolucao")
@RequiredArgsConstructor
public class DevolucaoController {
    private final DevolucaoService service;
    private final UsuarioAtualService usuarioAtual;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DevolucaoDto.Response registrar(@PathVariable Long itemId,
                                            @Valid @RequestBody(required = false) DevolucaoDto.Registrar req,
                                            Authentication auth) {
        return service.registrar(usuarioAtual.id(auth), itemId, req);
    }

    @GetMapping
    public DevolucaoDto.Response buscar(@PathVariable Long itemId, Authentication auth) {
        return service.buscarPorItem(usuarioAtual.id(auth), itemId);
    }
}
