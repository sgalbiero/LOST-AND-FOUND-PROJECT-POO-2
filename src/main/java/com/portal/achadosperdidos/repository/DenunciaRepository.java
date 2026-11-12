package com.portal.achadosperdidos.repository;

import com.portal.achadosperdidos.entity.Denuncia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DenunciaRepository extends JpaRepository<Denuncia, Long> {

    @EntityGraph(attributePaths = {"denunciante", "item", "mensagem"})
    Page<Denuncia> findByResolvida(boolean resolvida, Pageable pageable);
}
