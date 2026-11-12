package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.dto.LocalDto;
import com.portal.achadosperdidos.entity.Local;
import com.portal.achadosperdidos.exception.ConflitoException;
import com.portal.achadosperdidos.exception.RecursoNaoEncontradoException;
import com.portal.achadosperdidos.repository.LocalRepository;
import com.portal.achadosperdidos.util.TextoUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LocalService {

    private final LocalRepository localRepository;
    private final AcessoService acesso;

    public List<LocalDto.Response> listarAtivos() {
        return localRepository.findByAtivoTrueOrderByNomeAsc().stream().map(LocalDto.Response::de).toList();
    }

    public List<LocalDto.Response> listarTodos(Long adminId) {
        acesso.exigirAdmin(adminId);
        return localRepository.findAllByOrderByNomeAsc().stream().map(LocalDto.Response::de).toList();
    }

    @Transactional
    public LocalDto.Response criar(Long adminId, LocalDto.Request req) {
        acesso.exigirAdmin(adminId);
        String nome = TextoUtil.exigir(req.nome(), "nome");
        if (localRepository.existsByNomeIgnoreCase(nome)) {
            throw new ConflitoException("Já existe um local com este nome");
        }
        Local l = new Local();
        l.setNome(nome);
        l.setDescricao(TextoUtil.sanitizarTexto(req.descricao()));
        return LocalDto.Response.de(localRepository.save(l));
    }

    @Transactional
    public LocalDto.Response atualizar(Long adminId, Long id, LocalDto.Request req) {
        acesso.exigirAdmin(adminId);
        Local l = buscarEntidade(id);
        String nome = TextoUtil.exigir(req.nome(), "nome");
        if (localRepository.existsByNomeIgnoreCaseAndIdNot(nome, id)) {
            throw new ConflitoException("Já existe um local com este nome");
        }
        l.setNome(nome);
        l.setDescricao(TextoUtil.sanitizarTexto(req.descricao()));
        return LocalDto.Response.de(l);
    }

    /** Locais em uso não são excluídos: apenas desativados (somem do cadastro de novos itens). */
    @Transactional
    public LocalDto.Response definirAtivo(Long adminId, Long id, boolean ativo) {
        acesso.exigirAdmin(adminId);
        Local l = buscarEntidade(id);
        l.setAtivo(ativo);
        return LocalDto.Response.de(l);
    }

    private Local buscarEntidade(Long id) {
        return localRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Local", id));
    }
}
