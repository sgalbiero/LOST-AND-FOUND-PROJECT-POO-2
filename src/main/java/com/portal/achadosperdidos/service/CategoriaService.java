package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.dto.CategoriaDto;
import com.portal.achadosperdidos.entity.Categoria;
import com.portal.achadosperdidos.exception.ConflitoException;
import com.portal.achadosperdidos.exception.RecursoNaoEncontradoException;
import com.portal.achadosperdidos.repository.CategoriaRepository;
import com.portal.achadosperdidos.util.TextoUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final AcessoService acesso;

    public List<CategoriaDto.Response> listarAtivas() {
        return categoriaRepository.findByAtivoTrueOrderByNomeAsc().stream().map(CategoriaDto.Response::de).toList();
    }

    public List<CategoriaDto.Response> listarTodas(Long adminId) {
        acesso.exigirAdmin(adminId);
        return categoriaRepository.findAllByOrderByNomeAsc().stream().map(CategoriaDto.Response::de).toList();
    }

    @Transactional
    public CategoriaDto.Response criar(Long adminId, CategoriaDto.Request req) {
        acesso.exigirAdmin(adminId);
        String nome = TextoUtil.exigir(req.nome(), "nome");
        if (categoriaRepository.existsByNomeIgnoreCase(nome)) {
            throw new ConflitoException("Já existe uma categoria com este nome");
        }
        Categoria c = new Categoria();
        c.setNome(nome);
        return CategoriaDto.Response.de(categoriaRepository.save(c));
    }

    @Transactional
    public CategoriaDto.Response atualizar(Long adminId, Long id, CategoriaDto.Request req) {
        acesso.exigirAdmin(adminId);
        Categoria c = buscarEntidade(id);
        String nome = TextoUtil.exigir(req.nome(), "nome");
        if (categoriaRepository.existsByNomeIgnoreCaseAndIdNot(nome, id)) {
            throw new ConflitoException("Já existe uma categoria com este nome");
        }
        c.setNome(nome);
        return CategoriaDto.Response.de(c);
    }

    @Transactional
    public CategoriaDto.Response definirAtiva(Long adminId, Long id, boolean ativa) {
        acesso.exigirAdmin(adminId);
        Categoria c = buscarEntidade(id);
        c.setAtivo(ativa);
        return CategoriaDto.Response.de(c);
    }

    private Categoria buscarEntidade(Long id) {
        return categoriaRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", id));
    }
}
