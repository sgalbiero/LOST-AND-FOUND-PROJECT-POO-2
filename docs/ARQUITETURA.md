# Arquitetura do sistema

## Princípios

1. Dependências apontam para regras de negócio, nunca para detalhes externos.
2. React, HTTP, Spring MVC, autenticação e JPA são adapters substituíveis.
3. Cada funcionalidade reúne seu domínio, casos de uso, infraestrutura e apresentação.
4. DTOs externos são traduzidos na borda e não circulam pelo núcleo.
5. As fronteiras são verificadas automaticamente no build.

## Frontend

O frontend segue módulos por funcionalidade:

```text
app                       composição e rotas
features/<feature>/domain modelos e regras puras
features/<feature>/application casos de uso e ports
features/<feature>/infrastructure adapters HTTP e DTOs da API
features/<feature>/presentation React, páginas e componentes
shared                    recursos independentes de feature
```

Direção permitida:

```text
presentation -> application -> domain
infrastructure -> application + domain
app -> todas as camadas para compor as dependências
```

Restrições adicionais:

- Somente `shared/http/FetchHttpClient.ts` usa `fetch`.
- Endpoints `/api` existem somente em `infrastructure`.
- `domain` e `application` não importam React.
- `presentation` não importa adapters concretos.
- Credenciais permanecem em memória e são fornecidas ao cliente HTTP por uma interface.

Executar todas as garantias do frontend:

```sh
cd frontend
npm run verify
```

## Backend

O backend está em transição de arquitetura em camadas para monólito modular. As regras atuais,
protegidas por ArchUnit, impedem ciclos e acessos indevidos entre controller, service, repository e
entidade.

Estrutura alvo por módulo:

```text
<feature>/domain
<feature>/application/port/in
<feature>/application/port/out
<feature>/application/usecase
<feature>/adapter/in/web
<feature>/adapter/out/persistence
```

Módulos funcionais planejados:

- `usuario`
- `catalogo`
- `item`
- `negociacao`
- `moderacao`

Durante a migração, nenhuma nova funcionalidade deve aumentar o acoplamento dos pacotes antigos.
Cada módulo migrado ganha regras ArchUnit mais estritas: domínio sem Spring/JPA, aplicação sem web ou
persistência, e adapters dependendo apenas dos ports correspondentes.
