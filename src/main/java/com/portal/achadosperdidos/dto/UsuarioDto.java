package com.portal.achadosperdidos.dto;

import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.enums.RoleUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class UsuarioDto {

    private UsuarioDto() {
    }

    public record Cadastro(
            @NotBlank @Size(max = 255) String nome,
            @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Size(min = 8, max = 72) String senha,
            @Size(max = 50) String telefone) {
    }

    public record Atualizar(
            @NotBlank @Size(max = 255) String nome,
            @Size(max = 50) String telefone) {
    }

    /** Visão pública: nunca expõe e-mail, telefone nem senha. */
    public record Resumo(Long id, String nome) {
        public static Resumo de(Usuario u) {
            return u == null ? null : new Resumo(u.getId(), u.getNome());
        }
    }

    /** Visão do próprio usuário ou de um admin. */
    public record Detalhe(Long id, String nome, String email, String telefone,
                          RoleUsuario role, boolean ativo, LocalDateTime dataCadastro) {
        public static Detalhe de(Usuario u) {
            return new Detalhe(u.getId(), u.getNome(), u.getEmail(), u.getTelefone(),
                    u.getRole(), u.isAtivo(), u.getDataCadastro());
        }
    }
}
