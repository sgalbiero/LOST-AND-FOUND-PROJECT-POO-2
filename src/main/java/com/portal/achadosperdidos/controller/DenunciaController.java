package com.portal.achadosperdidos.controller;

import com.portal.achadosperdidos.dto.DenunciaDto;
import com.portal.achadosperdidos.service.DenunciaService;
import com.portal.achadosperdidos.service.UsuarioAtualService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/denuncias")
@RequiredArgsConstructor
public class DenunciaController {
    private final DenunciaService service;
    private final UsuarioAtualService usuarioAtual;

    @PostMapping("/item/{itemId}")
    @ResponseStatus(HttpStatus.CREATED)
    public DenunciaDto.Response denunciarItem(@PathVariable Long itemId,
                                               @Valid @RequestBody DenunciaDto.Criar req,
                                               Authentication auth) {
        return service.denunciarItem(usuarioAtual.id(auth), itemId, req);
    }

    @PostMapping("/mensagem/{mensagemId}")
    @ResponseStatus(HttpStatus.CREATED)
    public DenunciaDto.Response denunciarMensagem(@PathVariable Long mensagemId,
                                                   @Valid @RequestBody DenunciaDto.Criar req,
                                                   Authentication auth) {
        return service.denunciarMensagem(usuarioAtual.id(auth), mensagemId, req);
    }

    @GetMapping
    public Page<DenunciaDto.Response> listar(@RequestParam(defaultValue = "false") boolean resolvidas,
                                             Authentication auth, Pageable pageable) {
        return service.listar(usuarioAtual.id(auth), resolvidas, pageable);
    }

    @PostMapping("/{id}/resolucao")
    public DenunciaDto.Response resolver(@PathVariable Long id, Authentication auth) {
        return service.resolver(usuarioAtual.id(auth), id);
    }
}
