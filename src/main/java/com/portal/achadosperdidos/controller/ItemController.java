package com.portal.achadosperdidos.controller;

import com.portal.achadosperdidos.dto.ItemDto;
import com.portal.achadosperdidos.enums.StatusItem;
import com.portal.achadosperdidos.enums.TipoItem;
import com.portal.achadosperdidos.service.ItemService;
import com.portal.achadosperdidos.service.UsuarioAtualService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/itens")
@RequiredArgsConstructor
public class ItemController {
    private final ItemService service;
    private final UsuarioAtualService usuarioAtual;

    @GetMapping
    public Page<ItemDto.Resumo> pesquisar(@RequestParam(required = false) String termo,
                                          @RequestParam(required = false) TipoItem tipo,
                                          @RequestParam(required = false) StatusItem status,
                                          @RequestParam(required = false) Long categoriaId,
                                          @RequestParam(required = false) Long localId,
                                          Pageable pageable) {
        return service.pesquisar(new ItemDto.Filtro(termo, tipo, status, categoriaId, localId), pageable);
    }

    @GetMapping("/{id}")
    public ItemDto.Detalhe buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @GetMapping("/meus")
    public Page<ItemDto.Resumo> listarMeus(Authentication auth, Pageable pageable) {
        return service.listarMeus(usuarioAtual.id(auth), pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ItemDto.Detalhe criar(@Valid @RequestBody ItemDto.Criar requisicao, Authentication auth) {
        return service.criar(usuarioAtual.id(auth), requisicao);
    }

    @PutMapping("/{id}")
    public ItemDto.Detalhe atualizar(@PathVariable Long id, @Valid @RequestBody ItemDto.Atualizar requisicao,
                                     Authentication auth) {
        return service.atualizar(usuarioAtual.id(auth), id, requisicao);
    }

    @PostMapping("/{id}/cancelamento")
    public ItemDto.Detalhe cancelar(@PathVariable Long id, Authentication auth) {
        return service.cancelar(usuarioAtual.id(auth), id);
    }
}
