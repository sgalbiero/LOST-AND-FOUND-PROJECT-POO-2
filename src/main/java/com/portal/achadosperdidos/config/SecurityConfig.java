package com.portal.achadosperdidos.config;

import com.portal.achadosperdidos.repository.UsuarioRepository;
import com.portal.achadosperdidos.util.TextoUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    UserDetailsService userDetailsService(UsuarioRepository usuarios) {
        return email -> usuarios.findByEmail(TextoUtil.normalizarEmail(email))
                .filter(usuario -> usuario.isAtivo())
                .map(usuario -> User.withUsername(usuario.getEmail())
                        .password(usuario.getSenhaHash())
                        .roles(usuario.getRole().name())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Credenciais inválidas"));
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                            @Value("${app.security.require-https:false}") boolean requireHttps)
            throws Exception {
        if (requireHttps) {
            http.redirectToHttps(Customizer.withDefaults());
        }
        return http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.GET, "/", "/index.html", "/assets/**", "/favicon.ico",
                                "/entrar", "/cadastro", "/meus-itens", "/reivindicacoes", "/mensagens",
                                  "/perfil", "/mediacoes", "/admin", "/admin/**", "/itens/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/itens/meus").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/itens", "/api/itens/*",
                                "/api/categorias", "/api/locais").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/denuncias", "/api/mediacoes/abertas",
                                "/api/categorias/admin", "/api/locais/admin", "/api/usuarios").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/denuncias/*/resolucao",
                                "/api/mediacoes/*/atribuicao", "/api/mediacoes/*/resolucao",
                                "/api/categorias", "/api/locais").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categorias/*", "/api/locais/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/categorias/*/ativo", "/api/locais/*/ativo",
                                "/api/usuarios/*/role", "/api/usuarios/*/ativo").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults())
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, exception) -> {
                            response.setStatus(401);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write("{\"status\":401,\"erro\":\"Não autenticado\",\"mensagem\":\"Credenciais inválidas ou ausentes\"}");
                        })
                        .accessDeniedHandler((request, response, exception) -> {
                            response.setStatus(403);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write("{\"status\":403,\"erro\":\"Acesso negado\",\"mensagem\":\"Você não tem permissão para executar esta ação\"}");
                        }))
                .build();
    }
}
