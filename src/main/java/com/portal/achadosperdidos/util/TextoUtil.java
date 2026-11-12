package com.portal.achadosperdidos.util;

import com.portal.achadosperdidos.exception.RegraNegocioException;

import java.util.Locale;
import java.util.regex.Pattern;

public final class TextoUtil {

    private static final Pattern TAGS_HTML = Pattern.compile("<[^>]*>");
    private static final Pattern ESPACOS = Pattern.compile("\\s+");
    private static final Pattern ESPACOS_HORIZONTAIS = Pattern.compile("[ \\t]+");
    private static final Pattern LINHAS_EM_BRANCO = Pattern.compile("\\n{3,}");

    private TextoUtil() {
    }

    /** Remove tags HTML e colapsa espaços. Para textos de uma linha (título, descrição, nome). */
    public static String sanitizar(String texto) {
        if (texto == null) return null;
        String limpo = TAGS_HTML.matcher(texto).replaceAll(" ");
        limpo = limpo.replace("<", "").replace(">", "");
        return ESPACOS.matcher(limpo).replaceAll(" ").trim();
    }

    /** Remove tags HTML preservando quebras de linha. Para mensagens, justificativas e pareceres. */
    public static String sanitizarTexto(String texto) {
        if (texto == null) return null;
        String limpo = TAGS_HTML.matcher(texto).replaceAll(" ");
        limpo = limpo.replace("<", "").replace(">", "").replace("\r", "");
        limpo = ESPACOS_HORIZONTAIS.matcher(limpo).replaceAll(" ");
        limpo = LINHAS_EM_BRANCO.matcher(limpo).replaceAll("\n\n");
        return limpo.trim();
    }

    /** Sanitiza e devolve null se o resultado for vazio. */
    public static String sanitizarOuNulo(String texto) {
        String s = sanitizar(texto);
        return (s == null || s.isEmpty()) ? null : s;
    }

    /** Sanitiza (uma linha) e exige conteúdo. */
    public static String exigir(String texto, String campo) {
        String s = sanitizar(texto);
        if (s == null || s.isEmpty()) {
            throw new RegraNegocioException("O campo '" + campo + "' é obrigatório");
        }
        return s;
    }

    /** Sanitiza (multilinha) e exige conteúdo. */
    public static String exigirTexto(String texto, String campo) {
        String s = sanitizarTexto(texto);
        if (s == null || s.isEmpty()) {
            throw new RegraNegocioException("O campo '" + campo + "' é obrigatório");
        }
        return s;
    }

    /**
     * E-mails são gravados em minúsculas: o driver envia parâmetros como varchar e a comparação
     * com a coluna CITEXT acaba sendo case-sensitive.
     */
    public static String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    public static String escaparLike(String termo) {
        return termo.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
