package com.portal.achadosperdidos.repository;

import com.portal.achadosperdidos.entity.Local;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocalRepository extends JpaRepository<Local, Long> {

    List<Local> findByAtivoTrueOrderByNomeAsc();

    List<Local> findAllByOrderByNomeAsc();

    boolean existsByNomeIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);
}
