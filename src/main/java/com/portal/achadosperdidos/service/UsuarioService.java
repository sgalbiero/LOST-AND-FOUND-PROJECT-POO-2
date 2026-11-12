package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.dto.UsuarioDto;
import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.enums.RoleUsuario;
import com.portal.achadosperdidos.exception.AcessoNegadoException;
import com.portal.achadosperdidos.exception.ConflitoException;
import com.portal.achadosperdidos.exception.RecursoNaoEncontradoException;
import com.portal.achadosperdidos.exception.RegraNegocioException;
import com.portal.achadosperdidos.repository.UsuarioRepository;
import com.portal.achadosperdidos.util.TextoUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AcessoService acesso;

    /** Todo cadastro público nasce como ALUNO; a promoção a ADMIN é feita por outro admin. */
    @Transactional
    public UsuarioDto.Detalhe cadastrar(UsuarioDto.Cadastro req) {
        String email = TextoUtil.normalizarEmail(req.email());
        if (usuarioRepository.existsByEmail(email)) {
            throw new ConflitoException("E-mail já cadastrado");
        }
        Usuario u = new Usuario();
        u.setNome(TextoUtil.exigir(req.nome(), "nome"));
        u.setEmail(email);
        u.setSenhaHash(passwordEncoder.encode(req.senha()));
        u.setTelefone(TextoUtil.sanitizarOuNulo(req.telefone()));
        u.setRole(RoleUsuario.ALUNO);
        return UsuarioDto.Detalhe.de(usuarioRepository.save(u));
    }

    /** Dados completos apenas para o próprio usuário ou para um admin. */
    public UsuarioDto.Detalhe buscarPorId(Long solicitanteId, Long id) {
        exigirProprioOuAdmin(solicitanteId, id);
        return UsuarioDto.Detalhe.de(buscarEntidade(id));
    }

    @Transactional
    public UsuarioDto.Detalhe atualizar(Long usuarioId, UsuarioDto.Atualizar req) {
        Usuario u = acesso.usuarioAtivo(usuarioId);
        u.setNome(TextoUtil.exigir(req.nome(), "nome"));
        u.setTelefone(TextoUtil.sanitizarOuNulo(req.telefone()));
        return UsuarioDto.Detalhe.de(u);
    }

    /** Soft delete: nunca excluímos fisicamente (itens, mensagens e mediações referenciam o usuário). */
    @Transactional
    public void desativar(Long solicitanteId, Long alvoId) {
        exigirProprioOuAdmin(solicitanteId, alvoId);
        buscarEntidade(alvoId).setAtivo(false);
    }

    @Transactional
    public UsuarioDto.Detalhe alterarRole(Long adminId, Long alvoId, RoleUsuario novaRole) {
        acesso.exigirAdmin(adminId);
        if (adminId.equals(alvoId)) {
            throw new RegraNegocioException("Você não pode alterar o seu próprio perfil de acesso");
        }
        Usuario alvo = buscarEntidade(alvoId);
        alvo.setRole(novaRole);
        return UsuarioDto.Detalhe.de(alvo);
    }

    private void exigirProprioOuAdmin(Long solicitanteId, Long alvoId) {
        if (solicitanteId.equals(alvoId)) {
            acesso.usuarioAtivo(solicitanteId);
        } else if (!acesso.isAdmin(acesso.usuarioAtivo(solicitanteId))) {
            throw new AcessoNegadoException("Você não tem permissão para acessar este usuário");
        }
    }

    private Usuario buscarEntidade(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário", id));
    }
}
