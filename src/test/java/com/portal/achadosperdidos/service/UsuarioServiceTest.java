package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.enums.RoleUsuario;
import com.portal.achadosperdidos.exception.RegraNegocioException;
import com.portal.achadosperdidos.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {
    @Mock UsuarioRepository usuarios;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AcessoService acesso;
    @InjectMocks UsuarioService service;

    @Test
    void naoPermiteDesativarUltimoAdministradorAtivo() {
        Usuario admin = admin(1L);
        when(acesso.usuarioAtivo(1L)).thenReturn(admin);
        when(usuarios.findById(1L)).thenReturn(Optional.of(admin));
        when(usuarios.countByRoleAndAtivoTrue(RoleUsuario.ADMIN)).thenReturn(1L);

        assertThatThrownBy(() -> service.desativar(1L, 1L))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessageContaining("pelo menos um administrador");
    }

    @Test
    void naoPermiteRebaixarUltimoAdministradorAtivo() {
        Usuario executor = admin(1L);
        Usuario alvo = admin(2L);
        when(acesso.exigirAdmin(1L)).thenReturn(executor);
        when(usuarios.findById(2L)).thenReturn(Optional.of(alvo));
        when(usuarios.countByRoleAndAtivoTrue(RoleUsuario.ADMIN)).thenReturn(1L);

        assertThatThrownBy(() -> service.alterarRole(1L, 2L, RoleUsuario.ALUNO))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessageContaining("pelo menos um administrador");
    }

    @Test
    void permiteQueAdministradorReativeUmaConta() {
        Usuario executor = admin(1L);
        Usuario aluno = new Usuario();
        ReflectionTestUtils.setField(aluno, "id", 2L);
        aluno.setNome("Aluno");
        aluno.setRole(RoleUsuario.ALUNO);
        aluno.setAtivo(false);
        when(acesso.exigirAdmin(1L)).thenReturn(executor);
        when(usuarios.findById(2L)).thenReturn(Optional.of(aluno));

        var resposta = service.definirAtivo(1L, 2L, true);

        assertThat(resposta.ativo()).isTrue();
        assertThat(aluno.isAtivo()).isTrue();
    }

    @Test
    void painelNaoPermiteAdministradorDesativarPropriaConta() {
        Usuario executor = admin(1L);
        when(acesso.exigirAdmin(1L)).thenReturn(executor);

        assertThatThrownBy(() -> service.definirAtivo(1L, 1L, false))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessageContaining("própria conta");
    }

    private Usuario admin(Long id) {
        Usuario usuario = new Usuario();
        ReflectionTestUtils.setField(usuario, "id", id);
        usuario.setNome("Admin");
        usuario.setRole(RoleUsuario.ADMIN);
        usuario.setAtivo(true);
        return usuario;
    }
}
