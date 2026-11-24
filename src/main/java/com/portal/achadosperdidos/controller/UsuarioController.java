package com.portal.achadosperdidos.controller;

import com.portal.achadosperdidos.dto.UsuarioDto;
import com.portal.achadosperdidos.enums.RoleUsuario;
import com.portal.achadosperdidos.service.UsuarioAtualService;
import com.portal.achadosperdidos.service.UsuarioService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {
    private final UsuarioService service;
    private final UsuarioAtualService usuarioAtual;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioDto.Detalhe cadastrar(@Valid @RequestBody UsuarioDto.Cadastro requisicao) {
        return service.cadastrar(requisicao);
    }

    @GetMapping("/me")
    public UsuarioDto.Detalhe buscarAtual(Authentication auth) {
        Long id = usuarioAtual.id(auth);
        return service.buscarPorId(id, id);
    }

    @GetMapping("/{id}")
    public UsuarioDto.Detalhe buscar(@PathVariable Long id, Authentication auth) {
        return service.buscarPorId(usuarioAtual.id(auth), id);
    }

    @PutMapping("/me")
    public UsuarioDto.Detalhe atualizar(@Valid @RequestBody UsuarioDto.Atualizar requisicao,
                                        Authentication auth) {
        return service.atualizar(usuarioAtual.id(auth), requisicao);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativar(@PathVariable Long id, Authentication auth) {
        service.desativar(usuarioAtual.id(auth), id);
    }

    @PatchMapping("/{id}/role")
    public UsuarioDto.Detalhe alterarRole(@PathVariable Long id, @Valid @RequestBody AlterarRole requisicao,
                                          Authentication auth) {
        return service.alterarRole(usuarioAtual.id(auth), id, requisicao.role());
    }

    public record AlterarRole(@NotNull RoleUsuario role) {}
}
