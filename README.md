# 4Maker 3D — Catálogo 3D + Painel Administrativo

Versão administrativa/documentada: **V4.2.3.4**  
Base funcional: **V4.2.3-FINAL**  
Backend: **Cloudflare Worker + GitHub REST API**  
Frontend público: **GitHub Pages + Three.js**

Este repositório reúne o catálogo público 3D e o painel administrativo da 4Maker 3D. O catálogo permanece público e independente do painel. Operações administrativas são feitas pelo Cloudflare Worker, que mantém a credencial do GitHub fora do navegador.

A V4.2.3 consolidou correções de integridade, validação, concorrência, custos, pagamentos, cores, contratos históricos e contexto comercial. A V4.2.3.1 adicionou a sincronização automática de `Modelos/produtos.json`. A V4.2.3.2 corrigiu a compatibilidade do índice com a chave `products` e adotou network-first para JSONs públicos mutáveis. A V4.2.3.3 passou a proteger `produto.json` e `modelo.stl` com atualização do Service Worker e cache-busting por abertura. O teste real posterior mostrou uma camada anterior do mesmo problema: o próprio `index.html` podia permanecer antigo no cache da navegação. A **V4.2.3.4** corrige essa camada, força navegações online a ignorarem o HTTP cache e registra o Service Worker por URL versionada em `index.html`, `login.html` e `painel.html`.

---

## 1. Arquitetura atual

```text
Usuário público
      ↓
GitHub Pages
      ↓
index.html + Three.js
      ↓
Modelos/<produto>/modelo.stl
Modelos/<produto>/produto.json

Administrador
      ↓
login.html / painel.html
      ↓ Bearer token
Cloudflare Worker
      ↓
GitHub REST API
      ↓
repositório catalogo-3d
```

Responsabilidades principais:

- `index.html`: visualizador/catalogação pública 3D;
- `login.html`: entrada administrativa;
- `painel.html`: painel administrativo, formulários, calculadora, pedidos, faturamento, PDF e PWA;
- `worker.js`: autenticação, API, validações, regras comerciais e persistência;
- GitHub Pages: hospedagem estática do catálogo/painel;
- Cloudflare Worker: fronteira autenticada para operações administrativas;
- GitHub: armazenamento atual de produtos e JSONs do sistema.

Não há banco de dados, ORM, framework frontend, state manager ou backend adicional nesta versão.

---

## 2. Estrutura principal

```text
/
├── index.html
├── login.html
├── painel.html
├── worker.js
├── wrangler.jsonc
├── logo.png
├── manifest.webmanifest
├── service-worker.js
├── README.md
├── README-V3.txt
├── README-V4.txt
├── painel-4maker-backup.html
├── worker-4maker-backup.html
├── Dados/
│   ├── clientes.json
│   ├── configuracoes.json
│   ├── faturamento.json
│   ├── pedidos.json
│   └── precos.json
└── Modelos/
    ├── produtos.json
    └── <produto>/
        ├── modelo.stl
        ├── produto.json
        └── dados.json
```

Os arquivos ativos são `painel.html` e `worker.js`. Backups existentes servem apenas como referência; não devem substituir automaticamente os arquivos ativos.

---

## 3. Estrutura de um produto

Cada produto usa uma pasta própria em `Modelos/`.

### `modelo.stl`

Arquivo geométrico usado para visualização/impressão 3D.

### `produto.json`

Contém dados públicos/comerciais do item, como:

- nome;
- categoria;
- descrição;
- materiais;
- personalização;
- cores.

Esse arquivo pode ser consumido pelo catálogo e pelo painel.

### `dados.json`

Contém informações internas de produção, como:

- peso/filamento;
- tempo de impressão;
- preenchimento;
- suporte;
- dimensões;
- material;
- altura de camada;
- bico;
- custos;
- observações internas.

`dados.json` não deve ser confundido com a ficha pública do produto.

### `Modelos/produtos.json`

Índice leve das pastas disponíveis.

Formato atual:

```json
{
    "products": [
        {
            "folder": "Nome do Produto"
        }
    ]
}
```

A chave canônica publicada é `products`. Por retrocompatibilidade, o Worker do pacote V4.2.3.4 também aceita um índice legado que use somente `produtos`, preservando a chave encontrada durante a gravação. Um arquivo contendo simultaneamente as duas chaves é tratado como ambíguo e bloqueia a mutação.

A partir da **V4.2.3.1**, o cadastro de produto mantém esse índice automaticamente sincronizado; a V4.2.3.2 corrige a compatibilidade com o formato `products` do repositório publicado.

Regras da sincronização:

- a entrada só é adicionada se ainda não existir;
- entradas anteriores são preservadas;
- campos extras do objeto raiz e das entradas existentes são preservados;
- o arquivo é lido e validado antes de qualquer criação;
- JSON inválido ou estrutura incompatível bloqueia o cadastro em vez de sobrescrever o índice;
- a gravação usa o SHA atual do GitHub;
- se houver conflito de SHA durante a atualização do índice, o Worker relê o arquivo e tenta um único merge com o estado mais recente;
- o índice não é removido nem recriado a partir de uma lista vazia.

O produto `Teste`, criado no repositório operacional antes deste hotfix, foi adicionado ao índice desta entrega. O ZIP V4.2.3-FINAL usado como base local não continha a pasta `Modelos/Teste/`; portanto, ao implantar esta atualização, **preserve a pasta `Modelos/Teste/` que já existe no repositório real**.

---

## 4. Fluxo de cadastro de produto — V4.2.3.4

Antes do hotfix:

```text
POST /api/product
      ↓
produto.json
      ↓
dados.json
      ↓
modelo.stl
      ↓
retorno 201
```

O índice `Modelos/produtos.json` não era atualizado.

Agora:

```text
POST /api/product
      ↓
validar Modelos/produtos.json
      ↓
verificar se o produto já existe
      ↓
criar produto.json
      ↓
criar dados.json
      ↓
criar modelo.stl
      ↓
sincronizar Modelos/produtos.json
      ↓
retorno 201
```

Essa alteração não modifica o formato de `produto.json`, `dados.json` ou STL.

---

## 5. Rotas principais da API

### Autenticação

```text
POST /api/login
GET  /api/session
POST /api/logout
```

### Calculadora

```text
POST /api/calculate
```

### Produtos

```text
GET  /api/products
GET  /api/product?folder=...
POST /api/product
PUT  /api/product
```

`GET /api/products` continua listando as pastas existentes em `Modelos/` e pode criar `dados.json` inicial para produto que ainda não possua o arquivo.

`POST /api/product`, além de criar os três arquivos da pasta, sincroniza `Modelos/produtos.json`. Na V4.2.3.2 o Worker reconhece a chave canônica `products` e o legado `produtos`, sem substituir silenciosamente uma estrutura incompatível.

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

### Faturamento

```text
GET /api/billing
```

Todas as rotas de negócio abaixo de login/sessão exigem autenticação no Worker.

---

## 6. Autenticação e segurança

O navegador não recebe o `GITHUB_TOKEN`.

Secrets esperados no Cloudflare Worker:

```text
ADMIN_USER
ADMIN_PASSWORD
SESSION_SECRET
GITHUB_TOKEN
```

Vars esperadas:

```text
GITHUB_OWNER=4Maker3D
GITHUB_REPO=catalogo-3d
GITHUB_BRANCH=main
GITHUB_API_VERSION=2026-03-10
ALLOWED_ORIGINS=https://4maker3d.github.io
```

O token do GitHub deve ter acesso somente ao repositório necessário e permissão mínima compatível com leitura/gravação de conteúdo.

O token de sessão do painel fica em `sessionStorage` na chave:

```text
4maker_session
```

A sessão é verificada por `/api/session`.

### I01 / SEC-001

A possível exposição pública de JSONs administrativos continua **PENDENTE DE VERIFICAÇÃO NO AMBIENTE PUBLICADO**.

O fato de os arquivos existirem no repositório/ZIP não prova, sozinho, que estejam acessíveis anonimamente pelo GitHub Pages. Também não há certificação de que estejam isolados.

Antes de escalar o uso com dados reais, verificar diretamente no ambiente publicado:

- `Dados/clientes.json`;
- `Dados/pedidos.json`;
- `Dados/precos.json`;
- `Dados/configuracoes.json`;
- `Dados/faturamento.json`;
- `Modelos/<produto>/dados.json`.

---

## 7. Proteção contra leitura inválida — V4.2.3-A

A V4.2.3 deixou a persistência fail-closed para JSONs utilizados pelo sistema.

O Worker distingue:

- 404 legítimo;
- falha HTTP;
- metadata incompleta;
- conteúdo vazio;
- JSON malformado;
- formato estrutural incompatível;
- conteúdo válido.

Um arquivo existente inválido não deve ser convertido silenciosamente em `[]` ou `{}` e depois sobrescrito.

Esse comportamento também é usado pela sincronização de `Modelos/produtos.json` introduzida na V4.2.3.1 e mantida na V4.2.3.3.

---

## 8. Validação de entradas — V4.2.3-A

Novas operações comerciais rejeitam entradas incompatíveis, incluindo, conforme o campo:

- `NaN`;
- infinito;
- negativos indevidos;
- quantidade zero;
- quantidade negativa;
- quantidade fracionária quando representa unidades;
- descontos fora da faixa permitida.

Zero explicitamente informado permanece zero quando é válido. Em especial, `machine_hour_cost = 0` não deve voltar automaticamente para R$ 2/h.

Produtos com dados de produção incompletos não devem parecer automaticamente cotáveis. O modo manual permanece disponível.

---

## 9. Calculadora e fórmulas comerciais

As fórmulas centrais validadas na V4.2.3 permanecem preservadas nas V4.2.3.1, V4.2.3.2 e V4.2.3.3.

Considere:

- `w`: peso em gramas;
- `k`: preço do material por kg;
- `d`: desperdício;
- `t`: tempo em horas;
- `h`: custo/hora da máquina;
- `E`: extras unitários;
- `m`: acréscimo solicitado;
- `f`: acréscimo mínimo;
- `c`: comissão;
- `r`: margem real do revendedor;
- `v`: desconto de volume.

Conceitos preservados:

```text
filamento = (peso_g / 1000) × preço_kg

desperdício = filamento × percentual_desperdício

máquina = tempo_h × custo_hora

custo_produção = filamento + desperdício + máquina + extras
```

O campo de acréscimo da 4Maker é markup sobre custo, não margem sobre venda.

A comissão é tratada por gross-up, preservando o líquido desejado da 4Maker.

A margem do revendedor é percentual do preço público.

A política de centavos existente continua preservada; V4.2.3.1, V4.2.3.2 e V4.2.3.3 não tentam resolver D08/CALC-001.

### Caso de referência

Dados:

```text
PLA = R$ 89/kg
peso = 200,26 g
tempo = 16,31 h
máquina = R$ 2/h
desperdício = 5%
markup = 100%
comissão = 0
```

Resultados de referência validados:

```text
filamento base = 17,82314
desperdício = 0,891157
máquina = 32,62
custo de produção = 51,334297
preço público interno = 102,668594
preço público exibido = R$ 102,67
compra revendedor com margem 20% e sem volume ≈ R$ 82,13
```

Não arredondar primeiro o custo para R$ 51,33 para depois concluir que o público deveria ser R$ 102,66.

---

## 10. Cotação vigente — V4.2.3-A/C

Uma cotação não pode ser reutilizada depois que o contexto comercial relevante mudou.

Mudanças capazes de invalidar a cotação incluem, conforme o fluxo:

- produto;
- cliente;
- canal;
- material;
- cor;
- quantidade;
- faixa de volume;
- preço;
- custos;
- comissão;
- markup/piso;
- configuração comercial.

Respostas assíncronas antigas são descartadas quando pertencem a um contexto anterior.

O botão de salvar preço e a criação de pedido a partir da calculadora exigem uma cotação vigente.

---

## 11. Preço público x preço líquido/compra — V4.2.3-C

Novos acordos de preço distinguem explicitamente o tipo:

- `public`: preço público;
- `net`: preço de compra/líquido.

Exemplo:

```text
Preço público: R$ 100
Compra do revendedor: R$ 80
```

Um acordo público de R$ 100 não deve preencher automaticamente R$ 100 como preço cobrado do revendedor.

Acordos legados sem tipo continuam legíveis e não recebem significado inferido apenas pelo número. Quando necessário, o operador deve escolher/recalcular explicitamente.

---

## 12. Volume, piso e transferência para pedidos

A compensação de volume existente foi preservada quando a quantidade/faixa e o contexto permanecem os mesmos.

Quando quantidade, composição, cliente ou configuração alteram a regra comercial, o sistema invalida a cotação em vez de aplicar silenciosamente outra faixa.

Cenários validados na V4.2.3 incluem:

- custo R$ 50, piso/markup 20%, q1 a R$ 60: mudar para q10 não pode concluir silenciosamente em R$ 57/unidade;
- público R$ 100 / compra R$ 80 em q10 protegido: mudar para q50 não pode reduzir silenciosamente o total protegido para R$ 3.894,71;
- mesma faixa/contexto mantém a compensação existente.

---

## 13. Contrato histórico dos pedidos — V4.2.3-C

Edições administrativas não devem reprecificar pedidos antigos.

Alterar apenas:

- nota;
- status;
- pagamento;
- campos administrativos equivalentes;

preserva os valores contratados.

Mudança comercial de quantidade, preço, item ou cliente exige renegociação explícita.

Produto renomeado ou removido do catálogo não deve substituir o nome/snapshot histórico armazenado no pedido.

Não existe migração/reprecificação em massa de pedidos antigos.

---

## 14. Revisões e conflitos de edição — V4.2.3-B

Clientes, produtos e pedidos usam revisão esperada para evitar que formulário antigo sobrescreva alteração mais recente.

Fluxo:

```text
abrir registro
      ↓
capturar revisão
      ↓
editar
      ↓
enviar expected_revision
      ↓
Worker compara com estado atual
```

Se o registro mudou desde a abertura, a API retorna conflito `409`.

O sistema não faz merge automático nem renova a revisão para reaplicar silenciosamente um formulário obsoleto.

O formulário deve permanecer disponível para conferência/reabertura.

Painel e Worker da mesma versão devem ser usados juntos, pois os endpoints de edição atuais esperam `expected_revision`.

---

## 15. Custos e lucro — V4.2.3-B

Custo e comissão conhecidos em uma cotação acompanham o pedido.

Regras:

- custo conhecido é preservado em edição administrativa;
- custo ausente não vira zero conhecido;
- zero explícito pode continuar válido;
- custo histórico ausente não é reconstruído com o catálogo atual;
- se a base necessária estiver incompleta, o lucro não deve parecer um valor líquido validado;
- alteração comercial pode invalidar a base de custo anterior.

Esses dados internos continuam fora do PDF comercial enviado ao cliente.

---

## 16. Pagamentos — V4.2.3-B

Campos relevantes:

```text
status
payment_status
payment_method
payment_terms_days
amount_paid
due_date
payment_received_date
```

Fluxo financeiro principal:

```text
Pendente → Parcial → Pago
```

A situação financeira é independente do status de produção.

A V4.2.3 preserva a data de recebimento existente quando uma edição comum não representa novo recebimento.

Novo recebimento pode registrar nova data conforme a regra ativa. Combinações novas incoerentes são recusadas de forma proporcional, sem reescrever o passado.

---

## 17. Clientes e faturado

No cadastro do cliente podem existir preferências como:

```text
type
margin
default_payment_method
default_payment_terms_days
```

A forma de pagamento Faturado permite prazos rápidos e personalizados, vencimento e situação financeira.

A política geral de troca de cliente/snapshot além da contenção já implementada permanece como item futuro D03.

---

## 18. Cores — V4.2.3-B

`hex` e `swatch` são campos independentes.

- `hex`: valor utilizado pelo modelo/visualização conforme o fluxo atual;
- `swatch`: amostra/representação visual da cor.

Eles são números RGB decimais.

Salvar descrição ou outro campo sem editar cor preserva os dois valores originais.

Editar um controle de cor altera somente o campo correspondente.

Não houve normalização em massa da paleta existente.

---

## 19. PDF comercial

O PDF ativo continua usando jsPDF no navegador.

Ele contém, conforme o pedido:

- logo;
- tipo do documento;
- número;
- cliente;
- itens/variações;
- material;
- cor;
- quantidade;
- preços;
- subtotal/desconto/total;
- condição de pagamento;
- prazo/vencimento;
- situação;
- observações;
- paginação/rodapé.

O nome completo do produto é repetido nas variações. Não voltar a usar seta como substituto do nome.

O PDF não deve expor custo, comissão, margem ou lucro internos.

A V4.2.3.3 não altera o PDF.

---

## 20. PWA

O painel pode ser instalado como PWA.

Arquivos:

```text
manifest.webmanifest
service-worker.js
```

Nome atual:

```text
4Maker 3D Admin
```

O rascunho local de novos pedidos usa:

```text
4maker_order_draft_v42
```

O rascunho não é apagado automaticamente no logout para evitar perda de trabalho.

A V4.2.3.2 promoveu apenas o recorte de cache que foi reproduzido em navegador real:

- `Modelos/<produto>/produto.json` usa **network-first**;
- `Modelos/produtos.json` usa **network-first**;
- a busca de rede usa `cache: no-store` para não reutilizar a resposta HTTP antiga;
- somente respostas `2xx` são atualizadas no Cache Storage;
- em falha real de rede, uma cópia previamente armazenada pode ser usada como fallback offline;
- respostas HTTP atuais como 404/500 não são substituídas por um JSON antigo;
- assets estáticos continuam com a estratégia cache-first existente;
- navegações continuam network-first, mas respostas de erro deixam de ser gravadas no cache;
- o nome do cache foi incrementado, e a ativação remove caches antigos `4maker-admin-*`.

Na V4.2.3.3, `modelo.stl` também entra no grupo mutável network-first. O visualizador adiciona `_4mcb=<token-da-abertura>` às URLs de JSON e STL. O Service Worker atual remove apenas esse parâmetro ao formar a chave estável do fallback offline; assim, a estratégia contorna controladores antigos sem fazer o cache atual crescer a cada visita.

O restante de D02/PWA continua adiado para V4.3; esta versão não redesenha a estratégia geral.

---

## 21. Busca global e navegação

A busca global usa os dados já carregados no painel para encontrar produtos, clientes e pedidos.

Rotas do painel utilizam hash, por exemplo:

```text
painel.html#dashboard
painel.html#produtos
painel.html#novo
painel.html#editar
painel.html#clientes
painel.html#pedidos
painel.html#faturamento
painel.html#calculadora
painel.html#configuracoes
```

O botão Voltar do navegador permanece compatível com a navegação do painel.

---

## 22. Fluxo de pedido

Fluxo operacional principal:

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

`Cancelado` pode ser utilizado quando necessário.

Pedidos podem ser:

- criados manualmente;
- criados a partir da calculadora;
- editados;
- duplicados;
- atualizados por status;
- marcados conforme situação financeira.

A identidade do pedido em edição é separada do pedido apenas visualizado no modal, evitando salvar no ID errado ou criar POST indevido.

---

## 23. Avisos de leitura e dados desatualizados — V4.2.3-A

O painel diferencia:

- carregamento bem-sucedido;
- coleção realmente vazia;
- erro de leitura;
- último dado válido mantido em tela.

Em falha, o painel preserva dados/formulário quando seguro e informa que o conteúdo pode estar desatualizado.

HTTP 401 continua seguindo o fluxo de encerramento/retorno ao login.

---

## 24. Itens explicitamente preservados

As versões V4.2.3/V4.2.3.1/V4.2.3.2/V4.2.3.3 não devem alterar sem nova necessidade e validação:

- segredo GitHub somente no Worker;
- autenticação das rotas internas;
- fórmulas centrais de filamento, desperdício, máquina, markup, comissão, piso e margem real;
- compensação de volume na mesma faixa;
- preços e totais históricos;
- `data-auto-price=false` para preços manuais/históricos;
- aliases e campos desconhecidos legados;
- pastas, Unicode, URLs e STL originais;
- wrappers que capturam implementações anteriores ainda utilizadas;
- handler final de cliente em captura;
- PDF ativo e fallbacks;
- nome completo do produto nas variações do PDF;
- PDF comercial sem dados internos;
- helper de calendário local;
- rascunho persistente após logout;
- DPR limitado, sombras desativadas e aparência 3D atual;
- GitHub Pages como catálogo estático.

---

## 25. Histórico resumido de versões

### V4.2.2

Base comercial anterior à auditoria da V4.2.3:

- separação conceitual entre preço público e compra do revendedor;
- margem real do revendedor sobre preço público;
- comissão por gross-up;
- piso comercial;
- volume;
- preço negociado;
- calculadora → pedido;
- PDF já corrigido para repetir nome do produto nas variações.

### V4.2.3-A — Fundação e proteção

Itens:

- R01: leitura segura/fail-closed;
- R03: validação de entradas e pedidos;
- R04: cotação vigente e proteção contra respostas antigas;
- R12: estado visível de leitura.

Validação da etapa: **84/84** testes locais.

### V4.2.3-B — Integridade e histórico

Itens:

- R02: revisão por registro/conflito de edição;
- R07: custo conhecido x desconhecido;
- R09: identidade da edição;
- R10: pagamento coerente;
- R11: preservação independente de `hex`/`swatch`.

Validação da etapa: **101/101** testes locais.

### V4.2.3-C — Contrato comercial

Itens:

- R05: significado do acordo/preço;
- R06: contexto da cotação no pedido;
- R08: preservação do contrato histórico.

Validação da etapa: **33/33** testes locais.

### V4.2.3-FINAL

Regressão conjunta A+B+C: **134/134** testes locais.

A aprovação foi funcional no ambiente de testes Node VM + GitHub em memória + DOM mínimo; não substitui teste em navegador/produção.

### V4.2.3.1 — Sincronização do índice de produtos

- `createProduct()` passou a validar e sincronizar `Modelos/produtos.json`;
- evita duplicação, preserva campos existentes e usa SHA atual;
- conflito de SHA recebe uma releitura/merge controlado;
- conteúdo inválido bloqueia a operação em vez de virar lista vazia;
- a entrada `Teste` foi incluída no índice sem recriar os arquivos do produto.

### V4.2.3.2 — Compatibilidade do índice + cache de produto

Correções desta etapa:

- a chave publicada do índice é `products`;
- o Worker aceita `products` e, por retrocompatibilidade, o legado `produtos`;
- a sincronização preserva a chave existente e todos os campos extras;
- estruturas ambíguas/incompatíveis falham explicitamente;
- `produto.json` e `Modelos/produtos.json` passam a network-first no Service Worker;
- o cache antigo é invalidado pela troca do `CACHE_NAME`;
- resposta HTTP de erro não ressuscita um JSON antigo;
- `painel.html`, fórmulas, pedidos, PDF, catálogo 3D e demais contratos da V4.2.3 permanecem inalterados.

---

## 26. Deploy

### V4.2.3.3 — Atualização robusta do visualizador

- `index.html` passa a registrar `service-worker.js` e chamar `registration.update()`;
- uma troca real de controller provoca no máximo um reload controlado por sessão para ativar a versão nova sem loop;
- cada abertura do visualizador gera um token `_4mcb` e o adiciona às requisições de `produto.json` e `modelo.stl`;
- esse token faz um Service Worker antigo cache-first falhar em encontrar a chave antiga e buscar o recurso atual na rede;
- o Service Worker V4.2.3.3 usa network-first para `produto.json`, `Modelos/produtos.json` e `modelo.stl`;
- o cache atual remove `_4mcb` ao armazenar o fallback offline, evitando acumular uma cópia por visita;
- respostas HTTP 404/500 atuais não são substituídas por conteúdo antigo; fallback ocorre apenas em falha real de rede;
- `painel.html`, `worker.js`, regras comerciais, PDF e dados permanecem inalterados nesta etapa.

### V4.2.3.4 — navegação atualizada e bootstrap do Service Worker

O teste em navegador real confirmou que acrescentar um parâmetro novo à própria URL do visualizador fazia o produto abrir imediatamente. Isso demonstrou que a camada restante era o `index.html` antigo servido pelo estado persistente de navegação/HTTP cache, antes mesmo de o código novo de cache-busting do produto poder executar.

Correções desta etapa:

- navegações same-origin controladas pelo Service Worker usam `fetch` com `cache: "no-store"`;
- a resposta online atual passa a prevalecer sobre uma cópia antiga do HTML;
- em falha real de rede, o cache continua disponível como fallback offline;
- `index.html`, `login.html` e `painel.html` registram `service-worker.js?v=4.2.3.4`;
- os três registros usam `updateViaCache: "none"` e solicitam `registration.update()`;
- `skipWaiting()` e `clients.claim()` continuam permitindo que a versão nova assuma o controle sem esperar o fechamento de todas as abas;
- o identificador `_4mcb` de V4.2.3.3 continua protegendo `produto.json` e `modelo.stl`;
- o cache do Service Worker sobe para `4maker-admin-v4.2.3.4` e remove caches administrativos antigos na ativação;
- `worker.js`, `Modelos/produtos.json`, regras comerciais, PDF, STL e dados não são modificados por este hotfix.

Para instalações que já ficaram presas em uma navegação antiga, faça **uma única abertura cache-busted após o deploy**, por exemplo `?modelo=Teste&v=4234`. Essa abertura carrega o HTML atual e registra o Service Worker V4.2.3.4. Depois disso, a URL normal sem `v` volta a usar navegação network-first/no-store e futuras atualizações não devem exigir guia anônima ou limpeza manual de cache.

### Worker

O deploy pode ser feito pelo fluxo já usado no Cloudflare/Wrangler.

Exemplo:

```bash
npx wrangler deploy
```

Secrets e Vars permanecem no ambiente Cloudflare e não devem ser colocados no repositório.

### Painel

Na V4.2.3.3 o `painel.html` continua idêntico à V4.2.3-FINAL.

Painel e Worker devem continuar sendo tratados como um conjunto de mesma geração funcional, principalmente por causa de `expected_revision`, contratos de preço e contexto de cotação.

### Hotfix V4.2.3.4

Arquivos alterados da V4.2.3.3 para a V4.2.3.4:

```text
index.html
login.html
painel.html
service-worker.js
README.md   # documentação; não é requisito de runtime
```

`worker.js` e `Modelos/produtos.json` permanecem byte a byte iguais à V4.2.3.3, mantendo a sincronização automática do índice e a entrada `Teste`. A alteração em `painel.html` limita-se ao registro/atualização versionado do Service Worker; as regras administrativas e comerciais não são alteradas.

**Preserve `Modelos/Teste/` no repositório real.** Essa pasta foi criada depois do ZIP V4.2.3-FINAL utilizado como base local e não está contida naquele baseline.

---

## 27. Smoke test recomendado após deploy

Depois da implantação, conferir em navegador real:

1. login;
2. painel e navegação;
3. produto `Teste` aparecendo no fluxo que depende de `Modelos/produtos.json`;
4. visualização 3D do `Teste` na aba normal, sem limpar cache e sem usar guia anônima;
5. cadastrar um produto de teste controlado e confirmar entrada automática no índice;
6. confirmar que repetir/editar não cria entrada duplicada;
7. calculadora com o cenário de referência R$ 102,67;
8. criar pedido a partir da calculadora;
9. alterar quantidade e verificar invalidação/recalculo de cotação;
10. editar pedido sem alterar contrato e verificar total preservado;
11. pagamento/data;
12. PDF visual.

Os testes locais incluem simulação do Service Worker, mas não substituem o smoke test final no navegador/rede/GitHub/Worker publicados.

---

## 28. Rollback

Checkpoints aprovados da V4.2.3:

```text
V4.2.3-A
V4.2.3-B
V4.2.3-C
V4.2.3-FINAL
```

Para rollback de código:

- use arquivos de uma mesma versão;
- preserve os dados operacionais mais recentes;
- **não substitua `Dados/*.json` do ambiente real por JSONs antigos de um checkpoint**;
- não substitua `Modelos/` atual por uma cópia antiga que não contenha produtos cadastrados depois do checkpoint.

No hotfix V4.2.3.4, reverter código sem reverter dados é preferível a restaurar todo o ZIP antigo. Se houver rollback do Service Worker, considere também o efeito do nome/versionamento do cache.

---

## 29. Limitações conhecidas e itens futuros

### V4.3 / itens adiados

Permanecem para avaliação conforme necessidade/gatilho:

- D01: indicadores financeiros;
- D02: política de cache PWA;
- D03: política geral de cliente/snapshot;
- D04: precedência comercial restante;
- D05: operação incerta/idempotência ampla;
- D06: upload/cadastro parcial;
- D07: otimização da listagem de produtos;
- D08: política de centavos;
- ajustes de edição de configurações;
- hardening conforme evidência real.

### V4.4 / experiência e produtividade

Possíveis frentes futuras:

- clientes inativos e referências antigas;
- autosave estrutural/UX;
- PDF extenso/paginação;
- coerência de assets;
- acessibilidade;
- exportação e produtividade.

### Arquitetura

Não existe justificativa atual para migrar automaticamente para:

- React/Vue/Angular;
- TypeScript obrigatório;
- D1;
- Durable Objects;
- KV como fonte de dados transacionais;
- PostgreSQL/Supabase;
- ORM;
- backend novo;
- state manager;
- modularização total.

Essas decisões devem ser guiadas por problema real, escala, concorrência, latência e manutenção observada.

---

## 30. Cuidados ao desenvolver

1. Trabalhe sempre sobre os arquivos completos atuais.
2. Nunca substitua `worker.js` ou `painel.html` por versões reconstruídas/resumidas.
3. Valide sintaxe JavaScript antes de publicar.
4. Valide todos os JSONs alterados.
5. Preserve aliases/campos desconhecidos.
6. Não reprecifique histórico automaticamente.
7. Não invente custo histórico.
8. Não converta acordos antigos em massa.
9. Não normalize cores antigas sem ação explícita.
10. Não altere STL, nomes de pastas ou URLs sem plano de compatibilidade.
11. Use SHA atual nas gravações de arquivos existentes.
12. Em conflito, prefira falhar/reler a sobrescrever silenciosamente.
13. Faça backup dos dados reais antes de mudanças estruturais.
14. Compare hashes quando preparar uma nova versão.
15. Mantenha um checkpoint de rollback antes de cada mudança relevante.

---

## 31. Estado desta documentação

Este README descreve o comportamento até **V4.2.3.4**.

A V4.2.3-FINAL é a baseline funcional das correções A/B/C. A V4.2.3.1 introduziu a sincronização do índice; a V4.2.3.2 corrigiu o formato `products` e adotou network-first para dados públicos mutáveis; a V4.2.3.3 adicionou cache-busting por abertura para `produto.json` e `modelo.stl`. A V4.2.3.4 completa a correção fazendo a própria navegação ignorar o HTTP cache quando online e usando uma URL versionada para atualização do Service Worker em todas as páginas que o registram. A entrada `Teste` permanece no índice e sua pasta operacional existente deve ser preservada.

O status de I01/SEC-001 continua **PENDENTE** e nenhuma alegação de exposição ou isolamento definitivo deve ser feita sem verificação no ambiente publicado.
