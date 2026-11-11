# LOST-AND-FOUND

Aplicação de Achados e Perdidos desenvolvida em Java com Spring Boot para a disciplina de POO II do curso de Engenharia de Software da FANS.

O projeto Gradle e os fontes ficam na raiz deste repositório.

## Estado atual

O projeto está na etapa inicial de modelagem. Há uma aplicação Spring Boot e entidades JPA para usuários, itens, categorias, locais, fotos, reivindicações, conversas, mensagens, mediações, denúncias e devoluções, além dos enums de domínio.

Ainda não há controllers, services, repositories, testes automatizados ou scripts SQL de criação do schema. O `application.properties` configura `spring.jpa.hibernate.ddl-auto=validate`, então o banco e todas as tabelas, tipos e extensões esperados precisam existir antes de iniciar a aplicação. Apesar do comentário no arquivo de configuração, Flyway e migrações ainda não estão configurados.

## Requisitos

- JDK 17
- Gradle instalado (este repositório não contém Gradle Wrapper)
- PostgreSQL local

## Configuração local

1. Crie o banco `achados_perdidos` no PostgreSQL.
2. Confira usuário, senha e URL em `src/main/resources/application.properties`. Os valores atuais (`postgres`/`postgres`) são apenas configuração local e não devem ser usados em produção.
3. Prepare o schema do banco antes de iniciar a aplicação. Este repositório ainda não inclui DDL nem migrações, portanto criar somente o banco não é suficiente para o Hibernate validar o schema.

## Executar

Execute os comandos na raiz do repositório:

```sh
gradle classes
gradle test
gradle bootRun
```

No estado atual, `test` não encontra testes do projeto. `bootRun` depende do PostgreSQL estar disponível e do schema já ter sido criado.

## Estrutura

- `src/main/java/com/portal/achadosperdidos`: aplicação, entidades e enums
- `src/main/resources/application.properties`: conexão com PostgreSQL e configurações JPA
- `build.gradle`: plugins, Java 17 e dependências
- `settings.gradle`: nome do projeto Gradle

## Próximas etapas sugeridas

1. Definir o schema PostgreSQL e adicionar migrações versionadas (por exemplo, com Flyway), incluindo enums e extensões exigidos pelas entidades.
2. Externalizar URL e credenciais do banco para variáveis de ambiente.
3. Implementar repositories, services e controllers conforme os casos de uso definidos para a aplicação.
4. Adicionar testes para o mapeamento JPA e para as regras de negócio.
5. Adicionar o Gradle Wrapper para padronizar a execução sem exigir Gradle instalado globalmente.
