4MAKER 3D — V3

Arquivos:
- login.html -> login do painel
- painel.html -> painel administrativo
- worker.js -> API segura para autenticação e persistência no GitHub
- wrangler.jsonc -> configuração do Cloudflare Worker

IMPORTANTE:
1. Substitua SEU-WORKER.workers.dev nos dois HTML pela URL real do Worker.
2. Não coloque GITHUB_TOKEN em nenhum HTML/JS.
3. O token do GitHub deve existir somente como Secret do Cloudflare Worker.
4. O catálogo público index.html NÃO é alterado e continua sem login.

SECRETS DO WORKER:
ADMIN_USER=seu usuário
ADMIN_PASSWORD=sua senha forte
SESSION_SECRET=uma sequência aleatória longa (mín. 32 bytes)
GITHUB_TOKEN=seu Fine-grained Personal Access Token

VARS DO WORKER:
GITHUB_OWNER=4Maker3D
GITHUB_REPO=catalogo-3d
GITHUB_BRANCH=main
GITHUB_API_VERSION=2026-03-10
ALLOWED_ORIGINS=https://4maker3d.github.io

PERMISSÃO DO GITHUB TOKEN:
- Somente o repositório catalogo-3d
- Contents: Read and write

ROTAS:
POST /api/login
GET  /api/session
GET  /api/products
GET  /api/product?folder=...
PUT  /api/product
POST /api/product

O endpoint /api/products cria automaticamente dados.json nos produtos que ainda não possuem o arquivo. A criação é feita pelo Worker, não pelo navegador.

HISTÓRICO / VOLTAR:
O painel usa painel.html#dashboard, #produtos, #novo, #editar, #calculadora e #configuracoes. As mudanças usam history.pushState, então o botão Voltar do Android permanece dentro do painel em vez de voltar ao login.

ACESSO DIRETO:
Abrir painel.html sem token chama /api/session. Se não houver sessão válida, painel.html usa location.replace('login.html'), sem deixar uma entrada falsa de login no histórico.

SEGURANÇA:
- O GitHub token nunca é enviado ao cliente.
- A sessão é um token HMAC assinado pelo Worker e expira em 8 horas.
- A API aceita apenas o Origin do catálogo configurado.
- Login tem limitação básica de tentativas por IP no processo do Worker.
- Para produção mais rígida, pode-se adicionar Cloudflare Access/Turnstile depois.
