# Experiência web — Portal de Achados e Perdidos

## Objetivo do produto

Permitir que alunos publiquem objetos perdidos ou encontrados, encontrem possíveis correspondências,
conversem com segurança e registrem a devolução. Administradores moderam cadastros, denúncias e
mediações sem precisar acessar diretamente o banco de dados.

## Perfis

- **Visitante:** pesquisa itens, abre detalhes, cria uma conta e entra no sistema.
- **Aluno:** publica e gerencia itens, reivindica objetos, conversa, solicita mediação e confirma devoluções.
- **Administrador:** possui todas as capacidades de aluno e administra categorias, locais, denúncias,
  mediações e permissões.

## Navegação global

### Visitante

- Marca do portal
- `Explorar itens`
- `Entrar`
- Botão primário `Publicar item`, que abre o login quando não há sessão

### Usuário autenticado

- Marca do portal
- `Explorar`
- `Meus itens`
- `Reivindicações`
- `Mensagens`, com contador de não lidas
- Botão `Publicar item`
- Menu do usuário: `Meu perfil`, `Minhas mediações`, `Sair`
- Para ADMIN: item adicional `Administração`

No celular, a navegação principal fica em uma barra inferior com Explorar, Meus itens, Publicar,
Mensagens e Perfil. A administração fica dentro do menu do perfil.

## Páginas e interações

### 1. Explorar itens — `/`

É a página inicial e funciona sem autenticação.

- Busca textual por título e descrição.
- Alternância `Todos`, `Perdidos` e `Encontrados`.
- Filtros por categoria, local e status.
- Ordenação por publicação mais recente por padrão.
- Grade responsiva de cards com foto, tipo, título, local, categoria, data e status.
- Paginação com botão `Carregar mais` para preservar o contexto dos filtros.
- Estado vazio explica como ajustar os filtros e oferece `Publicar um item`.
- Skeleton durante o carregamento e mensagem com `Tentar novamente` em caso de falha.
- Os filtros ficam refletidos na URL para permitir recarregar e compartilhar a pesquisa.

### 2. Detalhe do item — `/itens/:id`

- Galeria de até três fotos.
- Tipo e status em destaque.
- Título, descrição, data da ocorrência, categoria, local e autor.
- Nunca exibe e-mail ou telefone publicamente.
- Item de outro usuário, aberto: `Reivindicar item`, `Iniciar conversa` e `Denunciar`.
- Item do próprio usuário: `Editar`, `Ver reivindicações` e `Cancelar publicação`.
- Item em negociação: mostra o andamento e permite abrir a conversa relacionada.
- Item devolvido: exibe confirmação de devolução em modo somente leitura.
- Ações autenticadas guardam a URL atual e retornam a ela após o login.
- Ações irreversíveis exigem confirmação em modal.

### 3. Entrar — `/entrar`

- E-mail e senha.
- Alternância para visualizar a senha.
- Validação inline e erro genérico para credenciais inválidas.
- Redireciona para a página anterior ou para `/` após sucesso.
- Link para criar conta.
- A primeira versão usa HTTP Basic sobre HTTPS; a credencial fica somente em memória de sessão,
  nunca em `localStorage`.

### 4. Criar conta — `/cadastro`

- Nome, e-mail, telefone opcional, senha e confirmação.
- Requisitos de senha apresentados antes do envio.
- Cadastro concluído entra automaticamente e direciona para a página anterior ou para o feed.
- Conflito de e-mail é mostrado junto ao campo.

### 5. Publicar ou editar item — `/itens/novo` e `/itens/:id/editar`

- Primeiro passo: `Perdi um item` ou `Encontrei um item`.
- Campos: título, descrição, data, categoria, local e local de guarda quando aplicável.
- Uma a três fotos, com pré-visualização, remoção e reordenação.
- Contadores de caracteres para título e descrição.
- Resumo antes da publicação.
- No modo de edição, o tipo não pode ser alterado.
- Bloqueia envio duplicado enquanto a requisição estiver em andamento.
- Após sucesso, abre o detalhe do item e mostra confirmação.
- A primeira versão aceita URLs de fotos; upload de arquivo será incorporado quando o storage AWS
  estiver definido.

### 6. Meus itens — `/meus-itens`

- Abas `Ativos`, `Em negociação` e `Encerrados`.
- Cards compactos com atalhos para editar, ver reivindicações e abrir conversa.
- Itens expirados podem ser visualizados, mas não editados.
- A situação de cada item é explicada em linguagem simples, além do código de status.

### 7. Reivindicar item

Fluxo em modal iniciado no detalhe.

- Campo de justificativa com orientação para não informar dados sensíveis.
- Mostra resumo do item antes de confirmar.
- Após envio, oferece abrir `Minhas reivindicações` ou iniciar conversa.

### 8. Minhas reivindicações — `/reivindicacoes`

- Abas `Pendentes`, `Aceitas` e `Encerradas`.
- Cada registro informa item, justificativa, data e status.
- Reivindicação pendente ou aceita pode ser cancelada com confirmação.
- Reivindicação aceita oferece abrir a conversa e, quando permitido, confirmar devolução.

### 9. Reivindicações recebidas — `/meus-itens/:itemId/reivindicacoes`

- Disponível apenas ao dono do item.
- Lista interessados e justificativas sem expor contato privado.
- Ações `Aceitar` e `Recusar` com confirmação.
- Ao aceitar uma, o item passa para negociação e as demais ficam sem possibilidade de aceite.
- Oferece abrir ou criar conversa com o interessado aceito.

### 10. Mensagens — `/mensagens` e `/mensagens/:conversaId`

- Lista de conversas à esquerda no desktop e em página separada no celular.
- Ordenação pela atividade mais recente.
- Contador de não lidas por conversa e global.
- Cabeçalho apresenta o item e o outro participante.
- Envio com Enter; Shift+Enter cria nova linha.
- Mensagens são paginadas e carregadas ao rolar para cima.
- Ao abrir a conversa, mensagens recebidas são marcadas como lidas.
- Menu de mensagem recebida permite denunciar.
- A primeira versão atualiza por consulta periódica; WebSocket fica como evolução posterior.

### 11. Mediações — `/mediacoes`

- Aluno vê as próprias solicitações e seus estados.
- Solicitação nasce a partir do detalhe do item, com motivo obrigatório.
- Mediação resolvida mostra o parecer e a data da resolução.

### 12. Devolução

Fluxo iniciado no item em negociação.

- Confirma o item e a reivindicação aceita.
- Observação opcional.
- Confirmação final deixa claro que o item será marcado como devolvido.
- Após registro, item e conversa ficam acessíveis em modo histórico.

### 13. Meu perfil — `/perfil`

- Nome, e-mail somente leitura, telefone, papel e data de cadastro.
- Permite editar nome e telefone.
- Permite desativar a própria conta após confirmação reforçada.
- Troca de senha não entra na primeira versão porque ainda não há endpoint correspondente.

### 14. Administração — `/admin`

Dashboard com quatro áreas:

- **Denúncias:** pendentes e resolvidas, detalhe do alvo e ação `Resolver`.
- **Mediações:** fila aberta, assumir atendimento e registrar parecer.
- **Categorias:** criar, renomear, ativar e desativar.
- **Locais:** criar, editar, ativar e desativar.

Uma quinta área, **Usuários**, será habilitada depois da criação de um endpoint de listagem. Por ora,
alteração de papel e desativação só podem ocorrer quando um usuário específico é acessado por ID.

## Regras de experiência

- Toda mutação mostra sucesso ou erro sem perder os dados digitados.
- Erros de validação da API aparecem no campo correspondente.
- `401` encerra a sessão local e abre o login; `403` explica falta de permissão; `404` oferece voltar;
  `409` e `422` exibem a regra de negócio retornada pela API.
- Datas são exibidas no fuso `America/Sao_Paulo` e enviadas no formato esperado pela API.
- A interface usa português brasileiro e traduz todos os enums para rótulos legíveis.
- Teclado, foco visível, contraste e leitores de tela fazem parte da definição de pronto.
- Layout funcional a partir de 360 px, com conteúdo limitado a 1200 px no desktop.

## Direção visual

- Visual institucional, acolhedor e direto, sem aparência de painel corporativo genérico.
- Azul-petróleo como cor principal, verde para encontrados/sucesso e âmbar para itens perdidos/atenção.
- Superfícies claras, tipografia de alta legibilidade, bordas suaves e fotografias como principal elemento
  visual dos cards.
- Ícones sempre acompanhados de rótulo em ações críticas.

## Arquitetura da primeira versão

- Frontend: React, TypeScript e Vite em `frontend/`.
- Backend: Spring Boot REST em `src/main/java`.
- Banco: PostgreSQL com Flyway.
- Desenvolvimento: Vite encaminha `/api` para o Spring Boot.
- Produção: o frontend compilado é servido pelo mesmo domínio; `/api` é encaminhado ao Spring Boot.
- AWS: uma instância EC2 com Docker Compose, reverse proxy HTTPS, aplicação e PostgreSQL. Se o professor
  disponibilizar RDS, o container de banco é substituído pela conexão gerenciada.

## Entregas

### Marco 1 — núcleo navegável

- Entrar e cadastrar
- Explorar e filtrar itens
- Ver detalhe
- Publicar e editar item
- Meus itens

### Marco 2 — negociação

- Reivindicações enviadas e recebidas
- Conversas e mensagens
- Registro de devolução
- Denúncia e mediação

### Marco 3 — operação e demonstração

- Administração
- Testes de integração e interface
- Docker Compose, HTTPS e configuração AWS
- Dados de demonstração e roteiro do teste
