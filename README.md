# LOST-AND-FOUND

Aplicação de Achados e Perdidos desenvolvida em Java com Spring Boot para a disciplina de POO II do curso de Engenharia de Software da FANS.

O projeto Gradle e os fontes ficam na raiz deste repositório.

## Estado atual

Esta entrega contém entidades JPA, repositories e services transacionais, além dos DTOs,
exceções e utilitários necessários para sustentar essas camadas. Os controllers já preparados
permanecem apenas no ambiente local e estão ignorados pelo Git, pois não fazem parte da entrega atual.

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

## Estrutura

- `src/main/java/com/portal/achadosperdidos`: entidades, DTOs, repositories, services e configuração
- `src/main/resources/db/migration`: migrações Flyway
- `src/test`: testes automatizados das regras de negócio e utilitários
- `src/main/resources/application.properties`: conexão com PostgreSQL e configurações JPA
- `build.gradle`: plugins, Java 17 e dependências
- `settings.gradle`: nome do projeto Gradle
- `gradlew`, `gradlew.bat` e `gradle/wrapper`: Gradle Wrapper para execução reproduzível

## Próximas etapas sugeridas

1. Adicionar testes de integração com PostgreSQL para validar as migrações e constraints.
2. Revisar e versionar os controllers REST e a autenticação, atualmente mantidos apenas no ambiente local.
3. Publicar uma especificação OpenAPI dos endpoints.
4. Substituir HTTP Basic por tokens caso o backend seja consumido por SPA ou aplicativo móvel.
