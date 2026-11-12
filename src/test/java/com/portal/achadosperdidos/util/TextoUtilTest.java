package com.portal.achadosperdidos.util;

import com.portal.achadosperdidos.exception.RegraNegocioException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TextoUtilTest {

    @Test
    void sanitizaHtmlEEspacos() {
        assertThat(TextoUtil.sanitizar("  Mochila <b>azul</b>   grande "))
                .isEqualTo("Mochila azul grande");
    }

    @Test
    void normalizaEmail() {
        assertThat(TextoUtil.normalizarEmail("  ALUNO@EXEMPLO.COM "))
                .isEqualTo("aluno@exemplo.com");
    }

    @Test
    void rejeitaTextoQueFicaVazioAposSanitizacao() {
        assertThatThrownBy(() -> TextoUtil.exigir("<div></div>", "titulo"))
                .isInstanceOf(RegraNegocioException.class);
    }
}
