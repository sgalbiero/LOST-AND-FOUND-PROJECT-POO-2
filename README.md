# LOST-AND-FOUND

Aplicação de Achados e Perdidos desenvolvida em Java com Spring Boot para a disciplina de POO II do curso de Engenharia de Software da FANS.

O projeto Gradle e os fontes ficam na raiz deste repositório.

## Estado atual

Esta entrega contém backend REST completo, autenticação, autorização, frontend React responsivo,
documentação OpenAPI, migrações e fluxos de publicação, reivindicação, conversa, devolução,
denúncia, mediação, perfil e administração.

O schema PostgreSQL é criado e versionado pelo Flyway, incluindo enums, constraints, índices e
categorias iniciais.

As regras implementadas abrangem publicação e busca de itens, reivindicações, conversas,
mensagens, mediações, denúncias, devoluções e expiração automática de publicações.

## Requisitos

- JDK 17
- PostgreSQL local

## Configuração local

1. Crie apenas o banco vazio `achados_perdidos`; o Flyway criará o schema na primeira execução.
2. Configure `DB_URL`, `DB_USERNAME` e `DB_PASSWORD` quando os valores locais padrão não forem adequados.
Não mantenha credenciais reais em arquivos versionados.
3. Para criar ou confirmar o administrador inicial, configure `APP_ADMIN_EMAIL`,
`APP_ADMIN_PASSWORD` e, opcionalmente, `APP_ADMIN_NAME`. A senha de uma conta existente não é
redefinida pelo bootstrap.

## Executar

Execute os comandos na raiz do repositório:

```sh
./gradlew classes
./gradlew test
./gradlew bootRun
```

No Windows, use `gradlew.bat` no lugar de `./gradlew`.

`bootRun` depende apenas do PostgreSQL e do banco vazio estarem disponíveis. As migrações são
executadas automaticamente.

Com a aplicação ativa, a documentação interativa fica em `/swagger-ui/index.html` e a descrição
OpenAPI em `/v3/api-docs`.

Para executar o frontend em outro terminal:

```sh
cd frontend
npm install
npm run dev
```

O Vite encaminha `/api` para `http://localhost:8080`. Para usar outra origem, copie
`frontend/.env.example` para `frontend/.env.local` e configure `VITE_API_BASE_URL`.

Para validar arquitetura, testes, tipos e build do frontend em um único comando:

```sh
cd frontend
npm run verify
```

## Estrutura

- `src/main/java/com/portal/achadosperdidos`: entidades, DTOs, repositories, services e configuração
- `src/main/resources/db/migration`: migrações Flyway
- `src/test`: testes automatizados das regras de negócio e utilitários
- `src/main/resources/application.properties`: conexão com PostgreSQL e configurações JPA
- `frontend`: aplicação React organizada por funcionalidades e adapters
- `docs/ARQUITETURA.md`: fronteiras, regras de dependência e arquitetura alvo
- `build.gradle`: plugins, Java 17 e dependências
- `settings.gradle`: nome do projeto Gradle
- `gradlew`, `gradlew.bat` e `gradle/wrapper`: Gradle Wrapper para execução reproduzível
- `compose.yaml`, `Dockerfile` e `deploy/nginx.conf`: execução em containers e terminação HTTPS

## Executar com Docker

Copie `.env.example` para `.env`, substitua todas as senhas e execute:

```sh
docker compose up --build
```

Para habilitar o gateway HTTPS, coloque `fullchain.pem` e `privkey.pem` em `deploy/certs`, defina
`REQUIRE_HTTPS=true` e execute `docker compose --profile https up --build`. Em produção, não exponha
a porta 8080 no firewall; somente 80/443 devem ser públicos.

## Ajustes finais

1. Executar o roteiro manual completo com PostgreSQL e dois usuários, incluindo um administrador.
2. Substituir os prompts nativos de denúncia e parecer por modais visuais.
3. Adicionar testes end-to-end no navegador e integração PostgreSQL em CI.
4. Substituir HTTP Basic por tokens antes de abrir a aplicação fora do ambiente acadêmico.
