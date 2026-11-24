package com.portal.achadosperdidos.repository;

import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.enums.RoleUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /** O e-mail deve ser normalizado (minúsculas) antes da consulta. */
    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRoleAndAtivoTrue(RoleUsuario role);
}
