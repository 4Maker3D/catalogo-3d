# 4Maker 3D — Catálogo + Painel Administrativo

Versão administrativa: **V4.2**  
Backend Worker: baseado no Worker completo V3.5, com suporte a pagamento faturado e preferências comerciais do cliente.

Este repositório reúne o catálogo público 3D e o painel administrativo da 4Maker 3D. O catálogo continua público no GitHub Pages; gravações administrativas passam pelo Cloudflare Worker, que mantém o token do GitHub fora do navegador.

## Estrutura principal

```text
/
├── index.html                 # catálogo público 3D
├── login.html                 # login do painel administrativo
├── painel.html                # painel administrativo V4.2
├── logo.png                   # identidade visual 4Maker 3D
├── manifest.webmanifest       # instalação do painel como PWA/app
├── service-worker.js          # cache do shell do PWA
├── worker.js                  # API Cloudflare Worker
├── wrangler.jsonc             # configuração do Worker
├── Modelos/
│   └── <produto>/
│       ├── modelo.stl
│       ├── produto.json       # informações públicas
│       └── dados.json         # informações internas de produção
└── Dados/
    ├── clientes.json
    ├── pedidos.json
    ├── precos.json
    ├── faturamento.json
    └── configuracoes.json
```

Os arquivos `painel-v4.1-base.html`, `worker-v3.5-base.js` e outros arquivos de backup, quando presentes, servem apenas como referência. Os arquivos ativos são `painel.html` e `worker.js`.

## Novidades da V4.2

### Qualidade de vida

- busca global no topo por **produto, cliente ou pedido**;
- duplicação de pedido para criar um novo orçamento sem redigitar itens;
- criação de pedido diretamente a partir de um cálculo de preço;
- botões rápidos de status no detalhe do pedido;
- ação **Marcar como pago**, preenchendo o valor total recebido;
- rascunho automático local de novos pedidos;
- notificações visuais não bloqueantes no lugar dos antigos `alert()`;
- edição de pedidos preservando produto, material, cor, quantidade e preço.

### Pagamento faturado

A forma de pagamento **Faturado** possui:

- prazo em dias;
- opções rápidas de 7, 14, 21, 28, 30, 45 e 60 dias;
- prazo personalizado;
- cálculo automático de vencimento;
- status financeiro Pendente, Parcial, Pago ou Cancelado;
- valor recebido;
- data de recebimento quando marcado como pago.

No cadastro do cliente é possível definir:

- `default_payment_method` — forma de pagamento padrão;
- `default_payment_terms_days` — prazo padrão de faturamento.

Ao selecionar o cliente em um novo pedido, essas condições são preenchidas automaticamente.

### PDF comercial

O PDF de orçamento/pedido foi redesenhado com:

- logo 4Maker 3D;
- identidade visual do painel;
- indicação clara de **ORÇAMENTO** ou **PEDIDO**;
- número do documento;
- dados do cliente;
- tabela de produtos, material, cor, quantidade e valores;
- subtotal, desconto e total;
- condição de pagamento, prazo, vencimento e situação financeira;
- observações;
- paginação e rodapé da 4Maker 3D.

O PDF é gerado no navegador usando jsPDF e não contém dados internos de custo de produção.

## Instalar o 4Maker Admin como aplicativo

O painel agora é um **PWA (Progressive Web App)**.

No menu lateral existe a opção:

> **Instalar 4Maker Admin**

Quando o navegador disponibiliza a instalação, o botão abre o instalador nativo. O aplicativo usa:

- nome: `4Maker 3D Admin`;
- atalho/ícone: `logo.png`;
- página inicial: `login.html`;
- modo de exibição: `standalone`.

### Android / Chrome / Edge

Use o botão **Instalar 4Maker Admin**. Se o navegador ainda não disponibilizar o prompt, use a opção **Instalar aplicativo** ou **Adicionar à tela inicial** do menu do navegador.

### iPhone / iPad

O Safari não permite disparar o instalador por JavaScript. Use:

1. **Compartilhar**;
2. **Adicionar à Tela de Início**.

### PC

Chrome e Edge podem instalar o PWA como uma janela de aplicativo. Depois de instalado, ele aparece no sistema sem depender de copiar o link do painel.

> Observação: o ícone do PWA usa o `logo.png` existente. O texto **ADMIN** aparece na interface e no nome do aplicativo, sem alterar o arquivo original da marca.

## Arquitetura de segurança

```text
login.html / painel.html
          ↓
Cloudflare Worker
          ↓
GitHub REST API
          ↓
repositório catalogo-3d
```

O navegador **não recebe o `GITHUB_TOKEN`**.

### Secrets do Worker

Configure como Secrets no Cloudflare:

```text
ADMIN_USER
ADMIN_PASSWORD
SESSION_SECRET
GITHUB_TOKEN
```

Nunca coloque esses valores em `painel.html`, `login.html`, `README.md` ou outro arquivo público.

### Vars do Worker

```text
GITHUB_OWNER=4Maker3D
GITHUB_REPO=catalogo-3d
GITHUB_BRANCH=main
GITHUB_API_VERSION=2026-03-10
ALLOWED_ORIGINS=https://4maker3d.github.io
```

O Fine-grained Personal Access Token do GitHub precisa de acesso somente ao repositório necessário e permissão **Contents: Read and write**.

## Rotas principais da API

### Autenticação

```text
POST /api/login
GET  /api/session
POST /api/logout
```

### Produtos

```text
GET  /api/products
GET  /api/product?folder=...
POST /api/product
PUT  /api/product
```

`GET /api/products` pode criar automaticamente `dados.json` nos produtos que ainda não possuem o arquivo.

### Configurações

```text
GET /api/settings
PUT /api/settings
```

### Clientes

```text
GET    /api/clients
POST   /api/client
PUT    /api/client
DELETE /api/client
```

Campos comerciais adicionais da V4.2:

```text
type
margin
default_payment_method
default_payment_terms_days
```

### Preços negociados

```text
GET  /api/prices?customerId=...&productFolder=...
POST /api/price
```

### Pedidos

```text
GET    /api/orders
POST   /api/order
PUT    /api/order
DELETE /api/order
```

Campos financeiros relevantes:

```text
status
payment_status
payment_method
payment_terms_days
amount_paid
due_date
payment_received_date
```

### Faturamento

```text
GET /api/billing
```

## Fluxo de pedido

```text
Orçamento
   ↓
Confirmado
   ↓
Em produção
   ↓
Pronto
   ↓
Entregue
```

`Cancelado` pode ser usado a qualquer momento quando necessário.

Fluxo financeiro:

```text
Pendente → Parcial → Pago
```

A produção e a situação financeira são independentes. Um pedido pode, por exemplo, estar **Em produção** e já estar **Pago**.

## Rascunho automático

Novos pedidos em preenchimento são salvos localmente no navegador com a chave:

```text
4maker_order_draft_v42
```

O rascunho não é enviado ao GitHub até o usuário salvar o pedido. Ao retornar ao painel, aparece a opção **Continuar** ou **Descartar**.

O rascunho é específico daquele navegador/dispositivo.

## Busca global

A busca do topo consulta o estado já carregado pelo painel e encontra:

- produtos por nome, pasta, categoria ou descrição;
- clientes por nome, documento, telefone ou e-mail;
- pedidos por número, cliente, status ou produto.

Ela não envia uma consulta separada ao GitHub a cada tecla.

## Sessão e navegação

O token de sessão é armazenado em `sessionStorage` com a chave:

```text
4maker_session
```

A sessão é validada por `/api/session`. Se não houver sessão válida, `painel.html` redireciona para `login.html`.

O painel usa rotas com hash, como:

```text
painel.html#dashboard
painel.html#produtos
painel.html#clientes
painel.html#pedidos
painel.html#faturamento
painel.html#calculadora
painel.html#configuracoes
```

Isso mantém o botão Voltar do navegador dentro da navegação do painel.

## Deploy

O Worker está preparado para deploy pelo Wrangler/GitHub Integration do Cloudflare.

O comando padrão de deploy é:

```bash
npx wrangler deploy
```

Ao usar integração Git do Cloudflare, um commit na branch de produção pode iniciar o deploy automaticamente.

Os Secrets e Vars devem permanecer configurados no Worker do Cloudflare; eles não pertencem ao repositório.

## Cuidados ao atualizar

1. Trabalhe sempre sobre o `painel.html` e `worker.js` completos atuais.
2. Não substitua o Worker por versões reduzidas/reconstruídas.
3. Antes do deploy, valide a sintaxe JavaScript.
4. Não sobrescreva `index.html` ao fazer mudanças administrativas.
5. Preserve `produto.json` como fonte pública e `dados.json` como fonte interna.
6. Faça backup antes de mudanças estruturais nos arquivos de `Dados/`.

## Catálogo público

O catálogo público continua independente do painel administrativo e não exige login.

URL principal:

```text
https://4maker3d.github.io/catalogo-3d/
```

As mudanças da V4.2 não alteram o comportamento do visualizador 3D público.
