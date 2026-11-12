package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.entity.BaseEntity;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Operações comuns, herdadas pelos services de cada agregado. */
public abstract class CrudService<T extends BaseEntity> {

    private final JpaRepository<T, Long> repository;
    private final String nomeEntidade;

    protected CrudService(JpaRepository<T, Long> repository, String nomeEntidade) {
        this.repository = repository;
        this.nomeEntidade = nomeEntidade;
    }

    @Transactional(readOnly = true)
    public T buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(nomeEntidade + " não encontrado(a): " + id));
    }

    @Transactional(readOnly = true)
    public List<T> listarTodos() {
        return repository.findAll();
    }

    @Transactional
    public T salvar(T entidade) {
        validar(entidade);
        return repository.save(entidade);
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(buscarPorId(id));
    }

    protected void validar(T entidade) {
        // Ponto de extensão para regras específicas do agregado.
    }
}
