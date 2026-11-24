package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.exception.AcessoNegadoException;
import com.portal.achadosperdidos.repository.UsuarioRepository;
import com.portal.achadosperdidos.util.TextoUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioAtualService {
    private final UsuarioRepository usuarios;

    public Long id(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AcessoNegadoException("Autenticação obrigatória");
        }
        Usuario usuario = usuarios.findByEmail(TextoUtil.normalizarEmail(authentication.getName()))
                .filter(Usuario::isAtivo)
                .orElseThrow(() -> new AcessoNegadoException("Usuário autenticado não está ativo"));
        return usuario.getId();
    }
}
