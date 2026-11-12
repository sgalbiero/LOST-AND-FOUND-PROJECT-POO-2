package com.portal.achadosperdidos.repository;

import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.enums.StatusItem;
import com.portal.achadosperdidos.enums.TipoItem;
import com.portal.achadosperdidos.util.TextoUtil;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

/** Filtros dinâmicos de Item. Cada método devolve null quando o filtro não foi informado. */
public final class ItemSpecs {

    private ItemSpecs() {
    }

    public static Specification<Item> comStatus(StatusItem status) {
        return status == null ? null : (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Item> comTipo(TipoItem tipo) {
        return tipo == null ? null : (root, query, cb) -> cb.equal(root.get("tipo"), tipo);
    }

    public static Specification<Item> comCategoria(Long categoriaId) {
        return categoriaId == null ? null
                : (root, query, cb) -> cb.equal(root.get("categoria").get("id"), categoriaId);
    }

    public static Specification<Item> comLocal(Long localId) {
        return localId == null ? null
                : (root, query, cb) -> cb.equal(root.get("local").get("id"), localId);
    }

    /** Busca por termo no título ou na descrição (usa os índices trigram lower(col)). */
    public static Specification<Item> comTermo(String termo) {
        if (termo == null || termo.isBlank()) return null;
        String padrao = "%" + TextoUtil.escaparLike(termo.trim().toLowerCase(Locale.ROOT)) + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("titulo")), padrao, '\\'),
                cb.like(cb.lower(root.get("descricao")), padrao, '\\'));
    }
}
