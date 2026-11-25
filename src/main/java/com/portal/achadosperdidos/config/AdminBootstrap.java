package com.portal.achadosperdidos.config;

import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.enums.RoleUsuario;
import com.portal.achadosperdidos.repository.UsuarioRepository;
import com.portal.achadosperdidos.util.TextoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrap implements ApplicationRunner {
    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}") private String email;
    @Value("${app.admin.password:}") private String senha;
    @Value("${app.admin.name:Equipe de apoio}") private String nome;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (email == null || email.isBlank()) return;
        if (senha == null || senha.length() < 8 || senha.length() > 72) {
            throw new IllegalStateException("APP_ADMIN_PASSWORD deve possuir entre 8 e 72 caracteres");
        }

        String emailNormalizado = TextoUtil.normalizarEmail(email);
        Usuario existente = usuarios.findByEmail(emailNormalizado).orElse(null);
        if (existente != null) {
            existente.setRole(RoleUsuario.ADMIN);
            existente.setAtivo(true);
            log.info("Administrador existente confirmado para {} sem redefinir sua senha", emailNormalizado);
            return;
        }
        Usuario admin = new Usuario();
        admin.setNome(TextoUtil.exigir(nome, "APP_ADMIN_NAME"));
        admin.setEmail(emailNormalizado);
        admin.setSenhaHash(passwordEncoder.encode(senha));
        admin.setRole(RoleUsuario.ADMIN);
        admin.setAtivo(true);
        usuarios.save(admin);
        log.info("Administrador inicial configurado para {}", emailNormalizado);
    }
}
