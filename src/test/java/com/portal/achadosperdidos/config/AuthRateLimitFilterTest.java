package com.portal.achadosperdidos.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class AuthRateLimitFilterTest {

    @Test
    void bloqueiaTentativasAcimaDoLimite() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(2, 60_000);

        assertThat(executar(filter, "GET", "/api/usuarios/me").getStatus()).isEqualTo(200);
        assertThat(executar(filter, "GET", "/api/usuarios/me").getStatus()).isEqualTo(200);
        MockHttpServletResponse bloqueada = executar(filter, "GET", "/api/usuarios/me");

        assertThat(bloqueada.getStatus()).isEqualTo(429);
        assertThat(bloqueada.getHeader("Retry-After")).isNotBlank();
    }

    @Test
    void ignoraRotasQueNaoSaoDeAutenticacao() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(1, 60_000);

        assertThat(executar(filter, "GET", "/api/itens").getStatus()).isEqualTo(200);
        assertThat(executar(filter, "GET", "/api/itens").getStatus()).isEqualTo(200);
    }

    private MockHttpServletResponse executar(AuthRateLimitFilter filter, String method, String uri)
            throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(method, uri);
        request.setRemoteAddr("127.0.0.1");
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }
}
