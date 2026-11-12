package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.enums.RoleUsuario;
import com.portal.achadosperdidos.exception.AcessoNegadoException;
import com.portal.achadosperdidos.exception.RecursoNaoEncontradoException;
import com.portal.achadosperdidos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Regras de autorização reutilizadas pelos demais services.
 * O id do usuário logado chega do controller (extraído do token/sessão).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AcessoService {

    private final UsuarioRepository usuarioRepository;

    public Usuario usuarioAtivo(Long usuarioId) {
        Usuario u = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário", usuarioId));
        if (!u.isAtivo()) {
            throw new AcessoNegadoException("Usuário inativo");
        }
        return u;
    }

    public Usuario exigirAdmin(Long usuarioId) {
        Usuario u = usuarioAtivo(usuarioId);
        if (!isAdmin(u)) {
            throw new AcessoNegadoException("Apenas administradores podem executar esta ação");
        }
        return u;
    }

    public Usuario exigirDonoOuAdmin(Long usuarioId, Item item) {
        Usuario u = usuarioAtivo(usuarioId);
        if (!isAdmin(u) && !item.getUsuario().getId().equals(u.getId())) {
            throw new AcessoNegadoException("Apenas o dono do item ou um administrador pode executar esta ação");
        }
        return u;
    }

    public boolean isAdmin(Usuario u) {
        return u.getRole() == RoleUsuario.ADMIN;
    }
}
