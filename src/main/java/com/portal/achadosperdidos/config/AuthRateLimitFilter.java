package com.portal.achadosperdidos.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {
    private final int limit;
    private final long windowMillis;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final AtomicLong requests = new AtomicLong();

    @Autowired
    public AuthRateLimitFilter(@Value("${app.security.auth-rate-limit:20}") int limit) {
        this(limit, Duration.ofMinutes(1).toMillis());
    }

    AuthRateLimitFilter(int limit, long windowMillis) {
        this.limit = Math.max(1, limit);
        this.windowMillis = windowMillis;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        boolean login = "GET".equals(request.getMethod()) && "/api/usuarios/me".equals(request.getRequestURI());
        boolean cadastro = "POST".equals(request.getMethod()) && "/api/usuarios".equals(request.getRequestURI());
        return !login && !cadastro;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long now = System.currentTimeMillis();
        String key = request.getRemoteAddr() + '|' + request.getMethod() + '|' + request.getRequestURI();
        Window window = windows.compute(key, (ignored, current) ->
                current == null || now - current.startedAt >= windowMillis
                        ? new Window(now, 1)
                        : new Window(current.startedAt, current.count + 1));

        if (requests.incrementAndGet() % 500 == 0) {
            windows.entrySet().removeIf(entry -> now - entry.getValue().startedAt >= windowMillis);
        }

        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        if (window.count > limit) {
            response.setStatus(429);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(Math.max(1, windowMillis / 1000)));
            response.getWriter().write("{\"status\":429,\"erro\":\"Muitas tentativas\",\"mensagem\":\"Aguarde um minuto antes de tentar novamente\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private record Window(long startedAt, int count) {}
}
