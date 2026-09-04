<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>4Maker 3D — Worker V3.4</title>
<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 24px;
  background: #111;
  color: #eee;
}
main {
  max-width: 900px;
  margin: auto;
}
h1 { margin-top: 0; }
pre {
  white-space: pre-wrap;
  word-break: break-word;
  background: #1d1d1d;
  padding: 20px;
  border-radius: 10px;
  overflow: auto;
}
.note {
  background: #222;
  padding: 14px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}
</style>
</head>
<body>
<main>
<h1>4Maker 3D — Worker V3.4</h1>
<div class="note">
Este arquivo é apenas um recipiente HTML para facilitar o download.
O código real do Worker está dentro do bloco abaixo. Para usar no Cloudflare/GitHub,
extraia o conteúdo do bloco de código e salve como <strong>worker.js</strong>.
</div>
<pre id="code"></pre>
<script>
const workerCode = `const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const DEFAULT_CORS = "https://4maker3d.github.io";

const ADMIN_FILES = {
  settings: "Dados/configuracoes.json",
  clients: "Dados/clientes.json",
  prices: "Dados/precos.json",
  orders: "Dados/pedidos.json",
  billing: "Dados/faturamento.json"
};


/* =========================================================
   ENTRADA PRINCIPAL
   ========================================================= */

export default {
  async fetch(request, env) {
    const origin =
      request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, env)
      });
    }

    try {
      const url =
        new URL(request.url);

      const path =
        url.pathname.replace(/\\/+$/, "") || "/";


      /* =====================================================
         LOGIN / SESSÃO
         ===================================================== */

      if (
        path === "/api/login" &&
        request.method === "POST"
      ) {
        return handleLogin(
          request,
          env,
          origin
        );
      }


      if (
        path === "/api/session" &&
        request.method === "GET"
      ) {
        const session =
          await authenticate(
            request,
            env
          );

        if (!session) {
          return json(
            {
              authenticated: false
            },
            401,
            origin,
            env
          );
        }

        return json(
          {
            authenticated: true,
            user: session.user,
            expiresAt: session.exp
          },
          200,
          origin,
          env
        );
      }


      if (
        path === "/api/logout" &&
        request.method === "POST"
      ) {
        return json(
          {
            ok: true
          },
          200,
          origin,
          env
        );
      }


      /* =====================================================
         TODAS AS ROTAS ABAIXO EXIGEM LOGIN
         ===================================================== */

      const session =
        await authenticate(
          request,
          env
        );

      if (!session) {
        return json(
          {
            error:
              "Não autenticado."
          },
          401,
          origin,
          env
        );
      }


      /* =====================================================
         CALCULADORA
         ===================================================== */

      if (
        path === "/api/calculate" &&
        request.method === "POST"
      ) {
        return await calculatePrice(
          request,
          env,
          origin
        );
      }


      /* =====================================================
         PRODUTOS
         ===================================================== */

      if (
        path === "/api/products" &&
        request.method === "GET"
      ) {
        return await listProducts(
          env,
          origin
        );
      }


      if (
        path === "/api/product" &&
        request.method === "GET"
      ) {
        const folder =
          safeFolder(
            url.searchParams.get(
              "folder"
            )
          );

        if (!folder) {
          return json(
            {
              error:
                "Produto inválido."
            },
            400,
            origin,
            env
          );
        }

        return await getProduct(
          folder,
          env,
          origin,
          true
        );
      }


      if (
        path === "/api/product" &&
        request.method === "PUT"
      ) {
        return await updateProduct(
          request,
          env,
          origin
        );
      }


      if (
        path === "/api/product" &&
        request.method === "POST"
      ) {
        return await createProduct(
          request,
          env,
          origin
        );
      }


      /* =====================================================
         CONFIGURAÇÕES
         ===================================================== */

      if (
        path === "/api/settings" &&
        request.method === "GET"
      ) {
        return await getSettings(
          env,
          origin
        );
      }


      if (
        path === "/api/settings" &&
        request.method === "PUT"
      ) {
        return await updateSettings(
          request,
          env,
          origin
        );
      }


      /* =====================================================
         CLIENTES
         ===================================================== */

      if (
        path === "/api/clients" &&
        request.method === "GET"
      ) {
        return await listClients(
          env,
          origin
        );
      }


      if (
        path === "/api/client" &&
        request.method === "POST"
      ) {
        return await createClient(
          request,
          env,
          origin
        );
      }


      if (
        path === "/api/client" &&
        request.method === "PUT"
      ) {
        return await updateClient(
          request,
          env,
          origin
        );
      }


      if (
        path === "/api/client" &&
        request.method === "DELETE"
      ) {
        return await deleteClient(
          request,
          env,
          origin
        );
      }


      /* =====================================================
         PREÇOS NEGOCIADOS
         ===================================================== */

      if (
        path === "/api/prices" &&
        request.method === "GET"
      ) {
        return await listPrices(
          request,
          env,
          origin
        );
      }


      if (
        path === "/api/price" &&
        request.method === "POST"
      ) {
        return await savePrice(
          request,
          env,
          origin
        );
      }


      /* =====================================================
         PEDIDOS
         ===================================================== */

      if (
        path === "/api/orders" &&
        request.method === "GET"
      ) {
        return await listOrders(
          request,
          env,
          origin
        );
      }


      if (
        path === "/api/order" &&
        request.method === "POST"
      ) {
        return await createOrder(
          request,
          env,
          origin
        );
      }


      if (
        path === "/api/order" &&
        request.method === "PUT"
      ) {
        return await updateOrder(
          request,
          env,
          origin
        );
      }


      if (
        path === "/api/order" &&
        request.method === "DELETE"
      ) {
        return await deleteOrder(
          request,
          env,
          origin
        );
      }


      /* =====================================================
         FATURAMENTO
         ===================================================== */

      if (
        path === "/api/billing" &&
        request.method === "GET"
      ) {
        return await getBilling(
          request,
          env,
          origin
        );
      }


      return json(
        {
          error:
            "Rota não encontrada."
        },
        404,
        origin,
        env
      );

    } catch (error) {
      console.error(error);

      const status =
        Number.isInteger(error?.status) &&
        error.status >= 400 &&
        error.status <= 599
          ? error.status
          : 500;

      return json(
        {
          error:
            status === 500
              ? "Erro interno da API."
              : "Falha ao acessar o GitHub.",

          detail:
            error?.message || "",

          githubPath:
            error?.githubPath || null
        },
        status,
        origin,
        env
      );
    }
  }
};


/* =========================================================
   CORS
   ========================================================= */

function corsHeaders(
  origin,
  env
) {
  const allowed =
    getAllowedOrigins(env);

  const allowOrigin =
    allowed.includes(origin)
      ? origin
      : DEFAULT_CORS;

  return {
    "Access-Control-Allow-Origin":
      allowOrigin,

    "Access-Control-Allow-Credentials":
      "false",

    "Access-Control-Allow-Headers":
      "Content-Type, Authorization",

    "Access-Control-Allow-Methods":
      "GET, POST, PUT, OPTIONS",

    "Vary":
      "Origin"
  };
}


function getAllowedOrigins(
  env
) {
  return (
    env.ALLOWED_ORIGINS ||
    DEFAULT_CORS
  )
    .split(",")
    .map(
      s => s.trim()
    )
    .filter(Boolean);
}


function json(
  data,
  status,
  origin,
  env,
  extraHeaders = {}
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...JSON_HEADERS,
        ...corsHeaders(
          origin,
          env
        ),
        ...extraHeaders
      }
    }
  );
}


/* =========================================================
   LOGIN
   ========================================================= */

async function handleLogin(
  request,
  env,
  origin
) {
  const ip =
    request.headers.get(
      "CF-Connecting-IP"
    ) || "unknown";

  if (!rateAllowed(ip)) {
    return json(
      {
        error:
          "Muitas tentativas. Aguarde alguns minutos."
      },
      429,
      origin,
      env
    );
  }

  const body =
    await request
      .json()
      .catch(() => null);

  const username =
    String(
      body?.username || ""
    );

  const password =
    String(
      body?.password || ""
    );

  if (
    !env.ADMIN_USER ||
    !env.ADMIN_PASSWORD ||
    !env.SESSION_SECRET ||
    !env.GITHUB_TOKEN
  ) {
    return json(
      {
        error:
          "API não configurada. Verifique os Secrets."
      },
      503,
      origin,
      env
    );
  }

  const userOk =
    await constantTimeEqual(
      username,
      env.ADMIN_USER
    );

  const passOk =
    await constantTimeEqual(
      password,
      env.ADMIN_PASSWORD
    );

  if (
    !userOk ||
    !passOk
  ) {
    return json(
      {
        error:
          "Usuário ou senha inválidos."
      },
      401,
      origin,
      env
    );
  }

  const now =
    Math.floor(
      Date.now() / 1000
    );

  const exp =
    now +
    8 * 60 * 60;

  const token =
    await signSession(
      {
        user: username,
        iat: now,
        exp
      },
      env.SESSION_SECRET
    );

  return json(
    {
      ok: true,
      token,
      expiresAt: exp
    },
    200,
    origin,
    env
  );
}


/* =========================================================
   AUTENTICAÇÃO
   ========================================================= */

async function authenticate(
  request,
  env
) {
  const auth =
    request.headers.get(
      "Authorization"
    ) || "";

  if (
    !auth.startsWith(
      "Bearer "
    )
  ) {
    return null;
  }

  const token =
    auth
      .slice(7)
      .trim();

  if (
    !token ||
    !env.SESSION_SECRET
  ) {
    return null;
  }

  return verifySession(
    token,
    env.SESSION_SECRET
  );
}


async function signSession(
  payload,
  secret
) {
  const header =
    base64url(
      JSON.stringify({
        alg: "HS256",
        typ: "4MSESSION"
      })
    );

  const body =
    base64url(
      JSON.stringify(
        payload
      )
    );

  const data =
    \`\${header}.\${body}\`;

  const signature =
    await hmac(
      data,
      secret
    );

  return (
    \`\${data}.\${signature}\`
  );
}


async function verifySession(
  token,
  secret
) {
  const parts =
    token.split(".");

  if (
    parts.length !== 3
  ) {
    return null;
  }

  const [
    header,
    body,
    signature
  ] = parts;

  const expected =
    await hmac(
      \`\${header}.\${body}\`,
      secret
    );

  if (
    !(await constantTimeEqual(
      signature,
      expected
    ))
  ) {
    return null;
  }

  let payload;

  try {
    payload =
      JSON.parse(
        fromBase64url(
          body
        )
      );
  } catch {
    return null;
  }

  if (
    !payload?.user ||
    !payload?.exp
  ) {
    return null;
  }

  if (
    Number(payload.exp) <=
    Math.floor(
      Date.now() / 1000
    )
  ) {
    return null;
  }

  return payload;
}


async function hmac(
  data,
  secret
) {
  const key =
    await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(
        secret
      ),
      {
        name: "HMAC",
        hash: "SHA-256"
      },
      false,
      ["sign"]
    );

  const sig =
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(
        data
      )
    );

  return base64urlBytes(
    new Uint8Array(sig)
  );
}


async function constantTimeEqual(
  a,
  b
) {
  const enc =
    new TextEncoder();

  const [
    ha,
    hb
  ] = await Promise.all([
    crypto.subtle.digest(
      "SHA-256",
      enc.encode(
        String(a)
      )
    ),
    crypto.subtle.digest(
      "SHA-256",
      enc.encode(
        String(b)
      )
    )
  ]);

  const aa =
    new Uint8Array(ha);

  const bb =
    new Uint8Array(hb);

  let diff = 0;

  for (
    let i = 0;
    i < aa.length;
    i++
  ) {
    diff |=
      aa[i] ^ bb[i];
  }

  return diff === 0;
}


/* =========================================================
   RATE LIMIT
   ========================================================= */

const attempts =
  new Map();


function rateAllowed(ip) {
  const now =
    Date.now();

  const windowMs =
    15 * 60 * 1000;

  const max = 8;

  const item =
    attempts.get(ip);

  if (
    !item ||
    now - item.started >
      windowMs
  ) {
    attempts.set(
      ip,
      {
        started: now,
        count: 1
      }
    );

    return true;
  }

  item.count++;

  return (
    item.count <= max
  );
}


/* =========================================================
   GITHUB
   ========================================================= */

async function github(
  path,
  options,
  env
) {
  const url =
    \`https://api.github.com/repos/\` +
    \`\${encodeURIComponent(
      env.GITHUB_OWNER
    )}/\` +
    \`\${encodeURIComponent(
      env.GITHUB_REPO
    )}/contents/\${path}\`;

  const headers = {
    "Accept":
      "application/vnd.github+json",

    "Authorization":
      \`Bearer \${env.GITHUB_TOKEN}\`,

    "X-GitHub-Api-Version":
      env.GITHUB_API_VERSION ||
      "2026-03-10",

    "User-Agent":
      "4Maker3D-Admin-API",

    ...(options?.headers || {})
  };

  return fetch(
    url,
    {
      ...options,
      headers
    }
  );
}


async function getGitHubJson(
  path,
  env
) {
  const response =
    await github(
      \`\${path}?ref=\${encodeURIComponent(
        env.GITHUB_BRANCH ||
        "main"
      )}\`,
      {
        method: "GET"
      },
      env
    );

  if (!response.ok) {
    const text =
      await response.text();

    const error =
      new Error(
        \`GitHub \${response.status} em \${path}: \${text.slice(
          0,
          300
        )}\`
      );

    error.status =
      response.status;

    error.githubPath =
      path;

    throw error;
  }

  return response.json();
}


async function getFile(
  path,
  env
) {
  const response =
    await github(
      \`\${path}?ref=\${encodeURIComponent(
        env.GITHUB_BRANCH ||
        "main"
      )}\`,
      {
        method: "GET"
      },
      env
    );

  if (
    response.status === 404
  ) {
    return null;
  }

  if (!response.ok) {
    const text =
      await response.text();

    const error =
      new Error(
        \`GitHub \${response.status} em \${path}: \${text.slice(
          0,
          300
        )}\`
      );

    error.status =
      response.status;

    error.githubPath =
      path;

    throw error;
  }

  const data =
    await response.json();

  return {
    sha: data.sha,

    content:
      data.content
        ? decodeBase64Utf8(
            data.content
          )
        : "",

    raw: data
  };
}


async function putFile(
  path,
  contentBase64,
  message,
  env,
  sha = null
) {
  const body = {
    message,

    content:
      contentBase64,

    branch:
      env.GITHUB_BRANCH ||
      "main"
  };

  if (sha) {
    body.sha = sha;
  }

  const response =
    await github(
      path,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(
            body
          )
      },
      env
    );

  if (!response.ok) {
    const text =
      await response.text();

    const error =
      new Error(
        \`GitHub \${response.status} em \${path}: \${text.slice(
          0,
          500
        )}\`
      );

    error.status =
      response.status;

    error.githubPath =
      path;

    throw error;
  }

  return response.json();
}


/* =========================================================
   CALCULADORA / FORMAÇÃO DE PREÇO
   ========================================================= */

async function calculatePrice(
  request,
  env,
  origin
) {
  const body =
    await request
      .json()
      .catch(() => null);

  if (!body || typeof body !== "object") {
    return json(
      { error: "Dados de cálculo inválidos." },
      400,
      origin,
      env
    );
  }

  const settingsFile =
    await ensureJsonFile(
      ADMIN_FILES.settings,
      defaultSettings(),
      "4Maker 3D: criar configuracoes.json",
      env
    );

  const settings =
    normalizeSettings(
      parseJsonSafe(
        settingsFile.content,
        defaultSettings()
      )
    );

  const weight = Math.max(0, numberOrZero(body.weight_g));
  const printTime = Math.max(0, numberOrZero(body.print_time_h));
  const waste = Math.max(0, numberOrZero(body.waste_percent ?? settings.waste_percent)) / 100;
  const materialName = String(body.material || "").trim();

  const material =
    settings.materials.find(
      item =>
        String(item.name).toLowerCase() ===
        materialName.toLowerCase()
    );

  if (weight <= 0) {
    return json(
      { error: "Informe o peso de filamento utilizado." },
      400,
      origin,
      env
    );
  }

  if (printTime < 0) {
    return json(
      { error: "Tempo de impressão inválido." },
      400,
      origin,
      env
    );
  }

  if (!material) {
    return json(
      { error: "Material não encontrado nas configurações." },
      400,
      origin,
      env
    );
  }

  const effectiveWeight = weight * (1 + waste);
  const filamentCost = effectiveWeight * numberOrZero(material.price_per_kg) / 1000;
  const machineCost = printTime * numberOrZero(settings.machine_hour_cost);

  const extraCosts =
    numberOrZero(settings.costs.finishing) +
    numberOrZero(settings.costs.painting) +
    numberOrZero(settings.costs.packaging) +
    numberOrZero(settings.costs.other);

  const commissionPercent =
    Math.max(0, numberOrZero(settings.costs.commission_percent)) / 100;

  const costBeforeCommission =
    filamentCost + machineCost + extraCosts;

  const baseCost =
    commissionPercent < 1
      ? costBeforeCommission / (1 - commissionPercent)
      : costBeforeCommission;

  const requestedMargin =
    Math.max(0, Math.min(99.99, numberOrZero(
      body.margin_percent ?? settings.default_margin_percent
    ))) / 100;

  const resellerMargin =
    Math.max(0, Math.min(99.99, numberOrZero(
      body.reseller_margin_percent ?? settings.default_reseller_margin_percent
    ))) / 100;

  const finalPrice =
    baseCost / (1 - requestedMargin);

  const resellerPrice =
    baseCost / (1 - resellerMargin);

  const rounding = settings.rounding;
  const applyRounding = value => {
    if (!rounding.enabled || numberOrZero(rounding.increment) <= 0) {
      return roundMoney(value);
    }
    const increment = numberOrZero(rounding.increment);
    return roundMoney(Math.ceil(value / increment) * increment);
  };

  const finalRounded = applyRounding(finalPrice);
  const resellerRounded = applyRounding(resellerPrice);

  return json(
    {
      ok: true,
      calculation: {
        weight_g: roundMoney(weight),
        effective_weight_g: roundMoney(effectiveWeight),
        waste_percent: roundMoney(waste * 100),
        material: material.name,
        material_price_per_kg: numberOrZero(material.price_per_kg),
        filament_cost: roundMoney(filamentCost),
        machine_cost: roundMoney(machineCost),
        extra_costs: roundMoney(extraCosts),
        base_cost: roundMoney(baseCost),
        margin_percent: roundMoney(requestedMargin * 100),
        reseller_margin_percent: roundMoney(resellerMargin * 100),
        final_price: finalRounded,
        reseller_price: resellerRounded,
        estimated_profit_final: roundMoney(finalRounded - baseCost),
        estimated_profit_reseller: roundMoney(resellerRounded - baseCost)
      }
    },
    200,
    origin,
    env
  );
}


/* =========================================================
   PRODUTOS
   ========================================================= */

async function listProducts(
  env,
  origin
) {
  const entries =
    await getGitHubJson(
      "Modelos",
      env
    );

  const folders =
    Array.isArray(entries)
      ? entries
          .filter(
            x => x.type === "dir"
          )
          .map(
            x => x.name
          )
          .sort(
            (a, b) =>
              a.localeCompare(
                b,
                "pt-BR"
              )
          )
      : [];

  const products = [];

  for (
    const folder of folders
  ) {
    const productFile =
      await getFile(
        \`Modelos/\${encodeURIComponent(
          folder
        )}/produto.json\`,
        env
      );

    if (!productFile) {
      continue;
    }

    let product;

    try {
      product =
        JSON.parse(
          productFile.content
        );
    } catch {
      continue;
    }

    let dataFile =
      await getFile(
        \`Modelos/\${encodeURIComponent(
          folder
        )}/dados.json\`,
        env
      );

    let dataCreated =
      false;

    if (!dataFile) {
      const starter =
        defaultDados(
          product
        );

      await putFile(
        \`Modelos/\${encodeURIComponent(
          folder
        )}/dados.json\`,
        encodeUtf8(
          starter
        ),
        \`4Maker 3D: criar dados.json de \${folder}\`,
        env
      );

      dataCreated =
        true;

      dataFile =
        await getFile(
          \`Modelos/\${encodeURIComponent(
            folder
          )}/dados.json\`,
          env
        );
    }

    products.push({
      folder,

      name:
        product.name ||
        folder,

      category:
        product.category ||
        "",

      description:
        product.description ||
        "",

      materials:
        product.materials ||
        "",

      available_materials:
        Array.isArray(
          product.available_materials
        )
          ? product.available_materials
          : [],

      customization:
        product.customization ||
        "",

      colors:
        Array.isArray(
          product.colors
        )
          ? product.colors
          : [],

      hasData:
        true,

      dataCreated
    });
  }

  return json(
    {
      products,
      total:
        products.length
    },
    200,
    origin,
    env
  );
}


async function getProduct(
  folder,
  env,
  origin,
  ensureData
) {
  const productFile =
    await getFile(
      \`Modelos/\${encodeURIComponent(
        folder
      )}/produto.json\`,
      env
    );

  if (!productFile) {
    return json(
      {
        error:
          "produto.json não encontrado."
      },
      404,
      origin,
      env
    );
  }

  let product;

  try {
    product =
      JSON.parse(
        productFile.content
      );
  } catch {
    return json(
      {
        error:
          "produto.json inválido."
      },
      422,
      origin,
      env
    );
  }

  let dataFile =
    await getFile(
      \`Modelos/\${encodeURIComponent(
        folder
      )}/dados.json\`,
      env
    );

  let dataCreated =
    false;

  if (
    !dataFile &&
    ensureData
  ) {
    const starter =
      defaultDados(
        product
      );

    await putFile(
      \`Modelos/\${encodeURIComponent(
        folder
      )}/dados.json\`,
      encodeUtf8(
        starter
      ),
      \`4Maker 3D: criar dados.json de \${folder}\`,
      env
    );

    dataFile =
      await getFile(
        \`Modelos/\${encodeURIComponent(
          folder
        )}/dados.json\`,
        env
      );

    dataCreated =
      true;
  }

  const dados =
    dataFile
      ? JSON.parse(
          dataFile.content
        )
      : defaultDados(
          product
        );

  return json(
    {
      folder,

      produto:
        product,

      dados,

      dataCreated,

      produtoSha:
        productFile.sha,

      dadosSha:
        dataFile?.sha ||
        null
    },
    200,
    origin,
    env
  );
}


/* =========================================================
   ATUALIZAR PRODUTO
   ========================================================= */

async function updateProduct(
  request,
  env,
  origin
) {
  const body =
    await request
      .json()
      .catch(() => null);

  const folder =
    safeFolder(
      body?.folder
    );

  if (!folder) {
    return json(
      {
        error:
          "Nome/pasta do produto inválido."
      },
      400,
      origin,
      env
    );
  }

  const produto =
    body?.produto;

  const dados =
    body?.dados;

  if (
    !produto ||
    typeof produto !==
      "object" ||
    !dados ||
    typeof dados !==
      "object"
  ) {
    return json(
      {
        error:
          "produto e dados são obrigatórios."
      },
      400,
      origin,
      env
    );
  }

  const productFile =
    await getFile(
      \`Modelos/\${encodeURIComponent(
        folder
      )}/produto.json\`,
      env
    );

  let dataFile =
    await getFile(
      \`Modelos/\${encodeURIComponent(
        folder
      )}/dados.json\`,
      env
    );

  if (!productFile) {
    return json(
      {
        error:
          "Produto não encontrado."
      },
      404,
      origin,
      env
    );
  }

  await putFile(
    \`Modelos/\${encodeURIComponent(
      folder
    )}/produto.json\`,
    encodeUtf8(
      produto
    ),
    \`4Maker 3D: atualizar produto \${folder}\`,
    env,
    productFile.sha
  );

  const now =
    new Date().toISOString();

  dados.updated_at =
    now;

  if (!dados.created_at) {
    dados.created_at =
      now;
  }

  await putFile(
    \`Modelos/\${encodeURIComponent(
      folder
    )}/dados.json\`,
    encodeUtf8(
      dados
    ),
    \`4Maker 3D: atualizar dados \${folder}\`,
    env,
    dataFile?.sha ||
      null
  );

  return json(
    {
      ok: true,
      folder
    },
    200,
    origin,
    env
  );
}


/* =========================================================
   CRIAR PRODUTO
   ========================================================= */

async function createProduct(
  request,
  env,
  origin
) {
  const body =
    await request
      .json()
      .catch(() => null);

  const folder =
    safeFolder(
      body?.folder
    );

  if (!folder) {
    return json(
      {
        error:
          "Nome/pasta do produto inválido."
      },
      400,
      origin,
      env
    );
  }

  const produto =
    body?.produto;

  const dados =
    body?.dados ||
    defaultDados(
      produto || {}
    );

  const stlBase64 =
    String(
      body?.stlBase64 || ""
    );

  if (
    !produto ||
    typeof produto !==
      "object"
  ) {
    return json(
      {
        error:
          "produto é obrigatório."
      },
      400,
      origin,
      env
    );
  }

  if (!stlBase64) {
    return json(
      {
        error:
          "Arquivo STL é obrigatório."
      },
      400,
      origin,
      env
    );
  }

  if (
    stlBase64.length >
    140 * 1024 * 1024
  ) {
    return json(
      {
        error:
          "STL muito grande para esta operação."
      },
      413,
      origin,
      env
    );
  }

  const existing =
    await getFile(
      \`Modelos/\${encodeURIComponent(
        folder
      )}/produto.json\`,
      env
    );

  if (existing) {
    return json(
      {
        error:
          "Já existe um produto com esse nome."
      },
      409,
      origin,
      env
    );
  }

  await putFile(
    \`Modelos/\${encodeURIComponent(
      folder
    )}/produto.json\`,
    encodeUtf8(
      produto
    ),
    \`4Maker 3D: criar produto \${folder}\`,
    env
  );

  await putFile(
    \`Modelos/\${encodeURIComponent(
      folder
    )}/dados.json\`,
    encodeUtf8(
      dados
    ),
    \`4Maker 3D: criar dados \${folder}\`,
    env
  );

  await putFile(
    \`Modelos/\${encodeURIComponent(
      folder
    )}/modelo.stl\`,
    stlBase64,
    \`4Maker 3D: adicionar STL \${folder}\`,
    env
  );

  return json(
    {
      ok: true,
      folder
    },
    201,
    origin,
    env
  );
}


/* =========================================================
   DADOS INTERNOS DOS PRODUTOS
   ========================================================= */

function defaultDados(
  produto = {}
) {
  const now =
    new Date().toISOString();

  return {
    version: 1,

    weight_g: "",

    filament_length_m: "",

    filament_weight_g: "",

    print_time_h: "",

    infill_percent: "",

    supports: "",

    dimensions_mm: {
      x: "",
      y: "",
      z: ""
    },

    material: "",

    layer_height_mm: "",

    nozzle_mm: "",

    quantity: 1,

    costs: {
      filament: 0,
      machine: 0,
      finishing: 0,
      painting: 0,
      packaging: 0,
      commission: 0,
      other: 0
    },

    internal_notes: "",

    created_at: now,

    updated_at: now
  };
}


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

function defaultSettings() {
  return {
    version: 1,

    machine_hour_cost: 2,

    default_margin_percent: 30,

    default_reseller_margin_percent: 20,

    waste_percent: 5,

    rounding: {
      enabled: false,
      increment: 0.5
    },

    materials: [
      {
        name: "PLA",
        price_per_kg: 89
      },
      {
        name: "PETG",
        price_per_kg: 89
      },
      {
        name: "ABS",
        price_per_kg: 89
      },
      {
        name: "ASA",
        price_per_kg: 99
      },
      {
        name: "TPU",
        price_per_kg: 119
      },
      {
        name: "TPE",
        price_per_kg: 129
      },
      {
        name: "PA",
        price_per_kg: 149
      },
      {
        name: "Nylon",
        price_per_kg: 149
      },
      {
        name: "PC",
        price_per_kg: 159
      },
      {
        name: "Fibra de Carbono",
        price_per_kg: 179
      },
      {
        name: "Fibra de Vidro",
        price_per_kg: 169
      },
      {
        name: "HIPS",
        price_per_kg: 99
      }
    ],

    costs: {
      finishing: 0,
      painting: 0,
      packaging: 0,
      commission_percent: 0,
      other: 0
    },

    volume_discounts: [
      {
        min: 1,
        max: 4,
        discount_percent: 0
      },
      {
        min: 5,
        max: 9,
        discount_percent: 5
      },
      {
        min: 10,
        max: 24,
        discount_percent: 10
      },
      {
        min: 25,
        max: 49,
        discount_percent: 15
      },
      {
        min: 50,
        max: null,
        discount_percent: 20
      }
    ]
  };
}


async function getSettings(
  env,
  origin
) {
  const file =
    await ensureJsonFile(
      ADMIN_FILES.settings,
      defaultSettings(),
      "4Maker 3D: criar configuracoes.json",
      env
    );

  let settings =
    parseJsonSafe(
      file.content,
      defaultSettings()
    );

  settings =
    normalizeSettings(
      settings
    );

  return json(
    {
      settings
    },
    200,
    origin,
    env
  );
}


async function updateSettings(
  request,
  env,
  origin
) {
  const body =
    await request
      .json()
      .catch(() => null);

  if (
    !body ||
    typeof body !==
      "object"
  ) {
    return json(
      {
        error:
          "Configurações inválidas."
      },
      400,
      origin,
      env
    );
  }

  const settings =
    normalizeSettings(
      body.settings ||
      body
    );

  const file =
    await getFile(
      ADMIN_FILES.settings,
      env
    );

  await putFile(
    ADMIN_FILES.settings,
    encodeUtf8(
      settings
    ),
    "4Maker 3D: atualizar configurações",
    env,
    file?.sha ||
      null
  );

  return json(
    {
      ok: true,
      settings
    },
    200,
    origin,
    env
  );
}


function normalizeSettings(
  input
) {
  const defaults =
    defaultSettings();

  const result = {
    ...defaults,
    ...(input || {})
  };

  result.rounding = {
    ...defaults.rounding,
    ...(input?.rounding || {})
  };

  result.costs = {
    ...defaults.costs,
    ...(input?.costs || {})
  };

  if (
    !Array.isArray(
      input?.materials
    )
  ) {
    result.materials =
      defaults.materials;
  } else {
    result.materials =
      input.materials
        .map(
          material => ({
            name:
              String(
                material?.name ||
                ""
              ).trim(),

            price_per_kg:
              numberOrZero(
                material?.price_per_kg
              )
          })
        )
        .filter(
          material =>
            material.name
        );
  }

  if (
    !Array.isArray(
      input?.volume_discounts
    )
  ) {
    result.volume_discounts =
      defaults.volume_discounts;
  } else {
    result.volume_discounts =
      input.volume_discounts
        .map(
          tier => ({
            min:
              Math.max(
                1,
                numberOrZero(
                  tier?.min
                )
              ),

            max:
              tier?.max === null ||
              tier?.max === "" ||
              typeof tier?.max ===
                "undefined"
                ? null
                : numberOrZero(
                    tier.max
                  ),

            discount_percent:
              Math.max(
                0,
                numberOrZero(
                  tier?.discount_percent
                )
              )
          })
        )
        .sort(
          (a, b) =>
            a.min - b.min
        );
  }

  return result;
}


/* =========================================================
   CLIENTES
   ========================================================= */

function defaultClients() {
  return [];
}


async function listClients(
  env,
  origin
) {
  const file =
    await ensureJsonFile(
      ADMIN_FILES.clients,
      defaultClients(),
      "4Maker 3D: criar clientes.json",
      env
    );

  const clients =
    parseJsonSafe(
      file.content,
      []
    );

  return json(
    {
      clients:
        Array.isArray(
          clients
        )
          ? clients
          : []
    },
    200,
    origin,
    env
  );
}


async function createClient(
  request,
  env,
  origin
) {
  const body =
    await request
      .json()
      .catch(() => null);

  if (
    !body ||
    typeof body !==
      "object"
  ) {
    return json(
      {
        error:
          "Cliente inválido."
      },
      400,
      origin,
      env
    );
  }

  const file =
    await ensureJsonFile(
      ADMIN_FILES.clients,
      [],
      "4Maker 3D: criar clientes.json",
      env
    );

  const clients =
    parseJsonSafe(
      file.content,
      []
    );

  const now =
    new Date().toISOString();

  const client = {
    id:
      body.id ||
      generateId("CLI"),

    name:
      String(
        body.name || ""
      ).trim(),

    cpf_cnpj:
      String(
        body.cpf_cnpj || ""
      ).trim(),

    email:
      String(
        body.email || ""
      ).trim(),

    phone:
      String(
        body.phone || ""
      ).trim(),

    address:
      String(
        body.address || ""
      ).trim(),

    notes:
      String(
        body.notes || ""
      ).trim(),

    created_at:
      now,

    updated_at:
      now
  };

  if (!client.name) {
    return json(
      {
        error:
          "Nome do cliente é obrigatório."
      },
      400,
      origin,
      env
    );
  }

  clients.push(
    client
  );

  await putFile(
    ADMIN_FILES.clients,
    encodeUtf8(
      clients
    ),
    \`4Maker 3D: criar cliente \${client.name}\`,
    env,
    file.sha
  );

  return json(
    {
      ok: true,
      client
    },
    201,
    origin,
    env
  );
}


async function deleteClient(
  request,
  env,
  origin
) {
  const body =
    await request
      .json()
      .catch(() => null);

  const id =
    String(body?.id || "").trim();

  if (!id) {
    return json(
      { error: "ID do cliente é obrigatório." },
      400,
      origin,
      env
    );
  }

  const file =
    await ensureJsonFile(
      ADMIN_FILES.clients,
      [],
      "4Maker 3D: criar clientes.json",
      env
    );

  const clients =
    parseJsonSafe(file.content, []);

  const index =
    clients.findIndex(
      client => String(client?.id || "") === id
    );

  if (index < 0) {
    return json(
      { error: "Cliente não encontrado." },
      404,
      origin,
      env
    );
  }

  const removed = clients[index];
  clients.splice(index, 1);

  await putFile(
    ADMIN_FILES.clients,
    encodeUtf8(clients),
    \`4Maker 3D: excluir cliente \${removed?.name || id}\`,
    env,
    file.sha
  );

  return json(
    { ok: true, id },
    200,
    origin,
    env
  );
}


async function updateClient(
  request,
  env,
  origin
) {
  const body =
    await request
      .json()
      .catch(() => null);

  const id =
    String(
      body?.id || ""
    ).trim();

  if (!id) {
    return json(
      {
        error:
          "ID do cliente é obrigatório."
      },
      400,
      origin,
      env
    );
  }

  const file =
    await ensureJsonFile(
      ADMIN_FILES.clients,
      [],
      "4Maker 3D: criar clientes.json",
      env
    );

  const clients =
    parseJsonSafe(
      file.content,
      []
    );

  const index =
    clients.findIndex(
      client =>
        String(
          client.id
        ) === id
    );

  if (index < 0) {
    return json(
      {
        error:
          "Cliente não encontrado."
      },
      404,
      origin,
      env
    );
  }

  const current =
    clients[index];

  clients[index] = {
    ...current,

    name:
      String(
        body.name ??
        current.name ??
        ""
      ).trim(),

    cpf_cnpj:
      String(
        body.cpf_cnpj ??
        current.cpf_cnpj ??
        ""
      ).trim(),

    email:
      String(
        body.email ??
        current.email ??
        ""
      ).trim(),

    phone:
      String(
        body.phone ??
        current.phone ??
        ""
      ).trim(),

    address:
      String(
        body.address ??
        current.address ??
        ""
      ).trim(),

    notes:
      String(
        body.notes ??
        current.notes ??
        ""
      ).trim(),

    updated_at:
      new Date().toISOString()
  };

  if (
    !clients[index].name
  ) {
    return json(
      {
        error:
          "Nome do cliente é obrigatório."
      },
      400,
      origin,
      env
    );
  }

  await putFile(
    ADMIN_FILES.clients,
    encodeUtf8(
      clients
    ),
    \`4Maker 3D: atualizar cliente \${id}\`,
    env,
    file.sha
  );

  return json(
    {
      ok: true,
      client:
        clients[index]
    },
    200,
    origin,
    env
  );
}


/* =========================================================
   PREÇOS NEGOCIADOS
   ========================================================= */

async function listPrices(
  request,
  env,
  origin
) {
  const url =
    new URL(
      request.url
    );

  const customerId =
    String(
      url.searchParams.get(
        "customerId"
      ) || ""
    ).trim();

  const productFolder =
    String(
      url.searchParams.get(
        "productFolder"
      ) || ""
    ).trim();

  const file =
    await ensureJsonFile(
      ADMIN_FILES.prices,
      [],
      "4Maker 3D: criar precos.json",
      env
    );

  let prices =
    parseJsonSafe(
      file.content,
      []
    );

  if (
    customerId
  ) {
    prices =
      prices.filter(
        price =>
          String(
            price.customer_id
          ) === customerId
      );
  }

  if (
    productFolder
  ) {
    prices =
      prices.filter(
        price =>
          String(
            price.product_folder
          ) ===
          productFolder
      );
  }

  return json(
    {
      prices
    },
    200,
    origin,
    env
  );
}


async function savePrice(
  request,
  env,
  origin
) {
  const body =
    await request
      .json()
      .catch(() => null);

  const customerId =
    String(
      body?.customer_id ||
      ""
    ).trim();

  const productFolder =
    safeFolder(
      body?.product_folder
    );

  if (
    !customerId ||
    !productFolder
  ) {
    return json(
      {
        error:
          "Cliente e produto são obrigatórios."
      },
      400,
      origin,
      env
    );
  }

  const file =
    await ensureJsonFile(
      ADMIN_FILES.prices,
      [],
      "4Maker 3D: criar precos.json",
      env
    );

  const prices =
    parseJsonSafe(
      file.content,
      []
    );

  const now =
    new Date().toISOString();

  const material =
    String(
      body?.material || ""
    ).trim();

  const color =
    String(
      body?.color || ""
    ).trim();

  const existingIndex =
    prices.findIndex(
      price =>
        String(
          price.customer_id
        ) === customerId &&
        String(
          price.product_folder
        ) === productFolder &&
        String(
          price.material || ""
        ) === material &&
        String(
          price.color || ""
        ) === color
    );

  const priceValue =
    numberOrZero(
      body?.price
    );

  if (
    priceValue <= 0
  ) {
    return json(
      {
        error:
          "O preço deve ser maior que zero."
      },
      400,
      origin,
      env
    );
  }

  const record = {
    id:
      existingIndex >= 0
        ? prices[
            existingIndex
          ].id
        : generateId(
            "PRE"
          ),

    customer_id:
      customerId,

    product_folder:
      productFolder,

    product_name:
      String(
        body?.product_name ||
        ""
      ).trim(),

    material,

    color,

    price:
      roundMoney(
        priceValue
      ),

    notes:
      String(
        body?.notes || ""
      ).trim(),

    created_at:
      existingIndex >= 0
        ? prices[
            existingIndex
          ].created_at
        : now,

    updated_at:
      now
  };

  if (
    existingIndex >= 0
  ) {
    prices[
      existingIndex
    ] = record;
  } else {
    prices.push(
      record
    );
  }

  await putFile(
    ADMIN_FILES.prices,
    encodeUtf8(
      prices
    ),
    \`4Maker 3D: salvar preço negociado \${productFolder}\`,
    env,
    file.sha
  );

  return json(
    {
      ok: true,
      price: record
    },
    200,
    origin,
    env
  );
}


/* =========================================================
   PEDIDOS
   ========================================================= */

async function listOrders(
  request,
  env,
  origin
) {
  const url =
    new URL(
      request.url
    );

  const status =
    String(
      url.searchParams.get(
        "status"
      ) || ""
    ).trim();

  const customerId =
    String(
      url.searchParams.get(
        "customerId"
      ) || ""
    ).trim();

  const file =
    await ensureJsonFile(
      ADMIN_FILES.orders,
      [],
      "4Maker 3D: criar pedidos.json",
      env
    );

  let orders =
    parseJsonSafe(
      file.content,
      []
    );

  if (status) {
    orders =
      orders.filter(
        order =>
          String(
            order.status
          ) === status
      );
  }

  if (customerId) {
    orders =
      orders.filter(
        order =>
          String(
            order.customer_id
          ) === customerId
      );
  }

  orders.sort(
    (a, b) =>
      String(
        b.created_at || ""
      ).localeCompare(
        String(
          a.created_at || ""
        )
      )
  );

  return json(
    {
      orders
    },
    200,
    origin,
    env
  );
}


async function createOrder(
  request,
  env,
  origin
) {
  const body =
    await request
      .json()
      .catch(() => null);

  if (
    !body ||
    typeof body !==
      "object"
  ) {
    return json(
      {
        error:
          "Pedido inválido."
      },
      400,
      origin,
      env
    );
  }

  const customerId =
    String(
      body.customer_id ||
      ""
    ).trim();

  if (!customerId) {
    return json(
      {
        error:
          "Cliente é obrigatório."
      },
      400,
      origin,
      env
    );
  }

  const clientsFile =
    await ensureJsonFile(
      ADMIN_FILES.clients,
      [],
      "4Maker 3D: criar clientes.json",
      env
    );

  const clients =
    parseJsonSafe(
      clientsFile.content,
      []
    );

  const customer =
    clients.find(
      client =>
        String(
          client.id
        ) === customerId
    );

  if (!customer) {
    return json(
      {
        error:
          "Cliente não encontrado."
      },
      404,
      origin,
      env
    );
  }

  if (
    !Array.isArray(
      body.items
    ) ||
    body.items.length === 0
  ) {
    return json(
      {
        error:
          "O pedido precisa ter pelo menos um produto."
      },
      400,
      origin,
      env
    );
  }

  const now =
    new Date().toISOString();

  const ordersFile =
    await ensureJsonFile(
      ADMIN_FILES.orders,
      [],
      "4Maker 3D: criar pedidos.json",
      env
    );

  const orders =
    parseJsonSafe(
      ordersFile.content,
      []
    );

  const orderNumber =
    await nextOrderNumber(
      orders
    );

  const items =
    body.items.map(
      item =>
        normalizeOrderItem(
          item
        )
    );

  const settingsFile =
    await ensureJsonFile(
      ADMIN_FILES.settings,
      defaultSettings(),
      "4Maker 3D: criar configuracoes.json",
      env
    );

  const settings =
    parseJsonSafe(
      settingsFile.content,
      defaultSettings()
    );

  const totals =
    calculateOrderTotals(
      items,
      settings
    );

  const order = {
    id:
      generateId(
        "PED"
      ),

    order_number:
      orderNumber,

    customer_id:
      customerId,

    customer:
      snapshotCustomer(
        customer
      ),

    items,

    subtotal:
      totals.subtotal,

    volume_discount_percent:
      totals.volume_discount_percent,

    volume_discount_value:
      totals.volume_discount_value,

    total:
      totals.total,

    estimated_cost:
      totals.cost,

    estimated_profit:
      roundMoney(
        totals.total -
        totals.cost
      ),

    status:
      body.status ||
      "Orçamento",

    payment_status:
      body.payment_status ||
      "Pendente",

    payment_method:
      body.payment_method ||
      "",

    amount_paid:
      numberOrZero(
        body.amount_paid
      ),

    due_date:
      String(
        body.due_date ||
        ""
      ),

    notes:
      String(
        body.notes || ""
      ),

    created_at:
      now,

    updated_at:
      now
  };

  orders.push(
    order
  );

  await putFile(
    ADMIN_FILES.orders,
    encodeUtf8(
      orders
    ),
    \`4Maker 3D: criar pedido \${order.order_number}\`,
    env,
    ordersFile.sha
  );

  await updateBillingFile(
    order,
    env
  );

  return json(
    {
      ok: true,
      order
    },
    201,
    origin,
    env
  );
}


async function updateOrder(
  request,
  env,
  origin
) {
  const body =
    await request
      .json()
      .catch(() => null);

  const id =
    String(
      body?.id || ""
    ).trim();

  if (!id) {
    return json(
      {
        error:
          "ID do pedido é obrigatório."
      },
      400,
      origin,
      env
    );
  }

  const file =
    await ensureJsonFile(
      ADMIN_FILES.orders,
      [],
      "4Maker 3D: criar pedidos.json",
      env
    );

  const orders =
    parseJsonSafe(
      file.content,
      []
    );

  const index =
    orders.findIndex(
      order =>
        String(
          order.id
        ) === id
    );

  if (index < 0) {
    return json(
      {
        error:
          "Pedido não encontrado."
      },
      404,
      origin,
      env
    );
  }

  const current =
    orders[index];

  let recalculated = null;

  if (Array.isArray(body.items) && body.items.length) {
    const settingsFile =
      await ensureJsonFile(
        ADMIN_FILES.settings,
        defaultSettings(),
        "4Maker 3D: criar configuracoes.json",
        env
      );

    const settings =
      parseJsonSafe(
        settingsFile.content,
        defaultSettings()
      );

    const normalizedItems =
      body.items.map(item => normalizeOrderItem(item));

    recalculated =
      calculateOrderTotals(
        normalizedItems,
        settings
      );
  }

  const updated = {
    ...current,

    ...(recalculated
      ? {
          items: body.items.map(item => normalizeOrderItem(item)),
          subtotal: recalculated.subtotal,
          volume_discount_percent: recalculated.volume_discount_percent,
          volume_discount_value: recalculated.volume_discount_value,
          total: recalculated.total,
          estimated_cost: recalculated.cost,
          estimated_profit: roundMoney(recalculated.total - recalculated.cost)
        }
      : {}),

    ...(body.customer_id
      ? { customer_id: String(body.customer_id).trim() }
      : {}),

    status:
      body.status ??
      current.status,

    payment_status:
      body.payment_status ??
      current.payment_status,

    payment_method:
      body.payment_method ??
      current.payment_method,

    amount_paid:
      numberOrZero(
        body.amount_paid ??
        current.amount_paid
      ),

    due_date:
      body.due_date ??
      current.due_date,

    notes:
      body.notes ??
      current.notes,

    updated_at:
      new Date().toISOString()
  };

  orders[index] =
    updated;

  await putFile(
    ADMIN_FILES.orders,
    encodeUtf8(
      orders
    ),
    \`4Maker 3D: atualizar pedido \${updated.order_number}\`,
    env,
    file.sha
  );

  await updateBillingFile(
    updated,
    env
  );

  return json(
    {
      ok: true,
      order: updated
    },
    200,
    origin,
    env
  );
}


async function deleteOrder(
  request,
  env,
  origin
) {
  const body =
    await request
      .json()
      .catch(() => null);

  const id =
    String(body?.id || "").trim();

  if (!id) {
    return json(
      { error: "ID do pedido é obrigatório." },
      400,
      origin,
      env
    );
  }

  const file =
    await ensureJsonFile(
      ADMIN_FILES.orders,
      [],
      "4Maker 3D: criar pedidos.json",
      env
    );

  const orders =
    parseJsonSafe(file.content, []);

  const index =
    orders.findIndex(
      order => String(order?.id || "") === id
    );

  if (index < 0) {
    return json(
      { error: "Pedido não encontrado." },
      404,
      origin,
      env
    );
  }

  const removed = orders[index];
  orders.splice(index, 1);

  await putFile(
    ADMIN_FILES.orders,
    encodeUtf8(orders),
    \`4Maker 3D: excluir pedido \${removed?.order_number || id}\`,
    env,
    file.sha
  );

  // Rebuild billing from the remaining orders so the dashboard
  // does not keep revenue from a deleted order.
  await rebuildBillingFile(orders, env);

  return json(
    { ok: true, id },
    200,
    origin,
    env
  );
}


/* =========================================================
   FATURAMENTO
   ========================================================= */

async function getBilling(
  request,
  env,
  origin
) {
  const ordersFile =
    await ensureJsonFile(
      ADMIN_FILES.orders,
      [],
      "4Maker 3D: criar pedidos.json",
      env
    );

  const orders =
    parseJsonSafe(
      ordersFile.content,
      []
    );

  const url =
    new URL(
      request.url
    );

  const from =
    String(
      url.searchParams.get(
        "from"
      ) || ""
    );

  const to =
    String(
      url.searchParams.get(
        "to"
      ) || ""
    );

  let filtered =
    orders;

  if (from) {
    filtered =
      filtered.filter(
        order =>
          String(
            order.created_at || ""
          ) >= from
      );
  }

  if (to) {
    filtered =
      filtered.filter(
        order =>
          String(
            order.created_at || ""
          ) <=
          \`\${to}T23:59:59.999Z\`
      );
  }

  const totalRevenue =
    filtered.reduce(
      (sum, order) =>
        sum +
        numberOrZero(
          order.total
        ),
      0
    );

  const totalReceived =
    filtered.reduce(
      (sum, order) =>
        sum +
        numberOrZero(
          order.amount_paid
        ),
      0
    );

  const totalCost =
    filtered.reduce(
      (sum, order) =>
        sum +
        numberOrZero(
          order.estimated_cost
        ),
      0
    );

  const totalProfit =
    totalRevenue -
    totalCost;

  const pending =
    filtered.reduce(
      (sum, order) =>
        sum +
        Math.max(
          0,
          numberOrZero(
            order.total
          ) -
          numberOrZero(
            order.amount_paid
          )
        ),
      0
    );

  return json(
    {
      billing: {
        orders:
          filtered,

        total_orders:
          filtered.length,

        total_revenue:
          roundMoney(
            totalRevenue
          ),

        total_received:
          roundMoney(
            totalReceived
          ),

        total_pending:
          roundMoney(
            pending
          ),

        total_cost:
          roundMoney(
            totalCost
          ),

        estimated_profit:
          roundMoney(
            totalProfit
          ),

        average_ticket:
          filtered.length
            ? roundMoney(
                totalRevenue /
                filtered.length
              )
            : 0
      }
    },
    200,
    origin,
    env
  );
}


async function rebuildBillingFile(
  orders,
  env
) {
  const billing =
    orders.map(order => ({
      order_id: order.id,
      order_number: order.order_number,
      customer_id: order.customer_id,
      customer_name: order.customer?.name || "",
      total: numberOrZero(order.total),
      amount_paid: numberOrZero(order.amount_paid),
      pending: Math.max(0, numberOrZero(order.total) - numberOrZero(order.amount_paid)),
      estimated_cost: numberOrZero(order.estimated_cost),
      estimated_profit: numberOrZero(order.estimated_profit),
      status: order.status || "",
      payment_status: order.payment_status || "Pendente",
      payment_method: order.payment_method || "",
      due_date: order.due_date || "",
      updated_at: order.updated_at || new Date().toISOString()
    }));

  const file =
    await ensureJsonFile(
      ADMIN_FILES.billing,
      [],
      "4Maker 3D: criar faturamento.json",
      env
    );

  await putFile(
    ADMIN_FILES.billing,
    encodeUtf8(billing),
    "4Maker 3D: reconstruir faturamento após exclusão de pedido",
    env,
    file.sha
  );
}


async function updateBillingFile(
  order,
  env
) {
  const file =
    await ensureJsonFile(
      ADMIN_FILES.billing,
      [],
      "4Maker 3D: criar faturamento.json",
      env
    );

  const billing =
    parseJsonSafe(
      file.content,
      []
    );

  const index =
    billing.findIndex(
      item =>
        String(
          item.order_id
        ) ===
        String(
          order.id
        )
    );

  const record = {
    order_id:
      order.id,

    order_number:
      order.order_number,

    customer_id:
      order.customer_id,

    customer_name:
      order.customer?.name ||
      "",

    total:
      numberOrZero(
        order.total
      ),

    amount_paid:
      numberOrZero(
        order.amount_paid
      ),

    pending:
      Math.max(
        0,
        numberOrZero(
          order.total
        ) -
        numberOrZero(
          order.amount_paid
        )
      ),

    estimated_cost:
      numberOrZero(
        order.estimated_cost
      ),

    estimated_profit:
      numberOrZero(
        order.estimated_profit
      ),

    status:
      order.status ||
      "",

    payment_status:
      order.payment_status ||
      "Pendente",

    payment_method:
      order.payment_method ||
      "",

    due_date:
      order.due_date ||
      "",

    updated_at:
      new Date().toISOString()
  };

  if (index >= 0) {
    billing[index] =
      record;
  } else {
    billing.push(
      record
    );
  }

  await putFile(
    ADMIN_FILES.billing,
    encodeUtf8(
      billing
    ),
    \`4Maker 3D: atualizar faturamento \${order.order_number}\`,
    env,
    file.sha
  );
}


/* =========================================================
   ARQUIVOS ADMINISTRATIVOS
   ========================================================= */

async function ensureJsonFile(
  path,
  defaultValue,
  message,
  env
) {
  const file =
    await getFile(
      path,
      env
    );

  if (file) {
    return file;
  }

  await putFile(
    path,
    encodeUtf8(
      defaultValue
    ),
    message,
    env
  );

  const created =
    await getFile(
      path,
      env
    );

  if (!created) {
    throw new Error(
      \`Arquivo criado mas não pôde ser recuperado: \${path}\`
    );
  }

  return created;
}


/* =========================================================
   PEDIDOS — AUXILIARES
   ========================================================= */

function normalizeOrderItem(
  item
) {
  const variants =
    Array.isArray(
      item?.variants
    )
      ? item.variants
      : [];

  const normalizedVariants =
    variants
      .map(
        variant => {
          const quantity =
            Math.max(
              0,
              numberOrZero(
                variant?.quantity
              )
            );

          const unitPrice =
            roundMoney(
              numberOrZero(
                variant?.unit_price
              )
            );

          const unitCost =
            roundMoney(
              numberOrZero(
                variant?.unit_cost
              )
            );

          return {
            material:
              String(
                variant?.material ||
                ""
              ).trim(),

            color:
              String(
                variant?.color ||
                ""
              ).trim(),

            quantity,

            unit_price:
              unitPrice,

            unit_cost:
              unitCost,

            subtotal:
              roundMoney(
                quantity *
                unitPrice
              ),

            cost:
              roundMoney(
                quantity *
                unitCost
              )
          };
        }
      )
      .filter(
        variant =>
          variant.quantity >
          0
      )
      .sort(
        (a, b) => {
          const material =
            a.material.localeCompare(
              b.material,
              "pt-BR",
              {
                numeric: true
              }
            );

          if (
            material !== 0
          ) {
            return material;
          }

          return a.color.localeCompare(
            b.color,
            "pt-BR",
            {
              numeric: true
            }
          );
        }
      );

  const quantity =
    normalizedVariants.reduce(
      (sum, variant) =>
        sum +
        variant.quantity,
      0
    );

  const subtotal =
    normalizedVariants.reduce(
      (sum, variant) =>
        sum +
        variant.subtotal,
      0
    );

  const cost =
    normalizedVariants.reduce(
      (sum, variant) =>
        sum +
        variant.cost,
      0
    );

  return {
    product_folder:
      String(
        item?.product_folder ||
        ""
      ),

    product_name:
      String(
        item?.product_name ||
        item?.name ||
        ""
      ),

    quantity,

    variants:
      normalizedVariants,

    subtotal:
      roundMoney(
        subtotal
      ),

    cost:
      roundMoney(
        cost
      )
  };
}


function calculateOrderTotals(
  items,
  settings = defaultSettings()
) {
  const subtotal =
    items.reduce(
      (sum, item) =>
        sum +
        numberOrZero(
          item.subtotal
        ),
      0
    );

  const cost =
    items.reduce(
      (sum, item) =>
        sum +
        numberOrZero(
          item.cost
        ),
      0
    );

  const totalQuantity =
    items.reduce(
      (sum, item) =>
        sum +
        numberOrZero(
          item.quantity
        ),
      0
    );

  const tier =
    [...(settings.volume_discounts || [])]
      .sort(
        (a, b) =>
          numberOrZero(a.min) -
          numberOrZero(b.min)
      )
      .find(
        tier =>
          totalQuantity >=
            numberOrZero(tier.min) &&
          (tier.max === null ||
            totalQuantity <=
              numberOrZero(tier.max))
      );

  const discountPercent =
    Math.max(
      0,
      numberOrZero(
        tier?.discount_percent
      )
    );

  const discountValue =
    subtotal *
    (discountPercent / 100);

  const total =
    subtotal -
    discountValue;

  return {
    subtotal:
      roundMoney(
        subtotal
      ),

    volume_discount_percent:
      discountPercent,

    volume_discount_value:
      roundMoney(
        discountValue
      ),

    total:
      roundMoney(
        total
      ),

    cost:
      roundMoney(
        cost
      )
  };
}


function snapshotCustomer(
  customer
) {
  return {
    id:
      customer.id,

    name:
      customer.name,

    cpf_cnpj:
      customer.cpf_cnpj ||
      "",

    email:
      customer.email ||
      "",

    phone:
      customer.phone ||
      "",

    address:
      customer.address ||
      ""
  };
}


async function nextOrderNumber(
  orders
) {
  let max = 0;

  for (
    const order of orders
  ) {
    const number =
      parseInt(
        String(
          order.order_number ||
          ""
        ).replace(
          /\\D/g,
          ""
        ),
        10
      );

    if (
      Number.isFinite(
        number
      ) &&
      number > max
    ) {
      max = number;
    }
  }

  return String(
    max + 1
  ).padStart(
    5,
    "0"
  );
}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function generateId(
  prefix
) {
  const random =
    crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random()
          .toString(36)
          .slice(2);

  return \`\${prefix}-\${random}\`;
}


function numberOrZero(
  value
) {
  const number =
    Number(
      String(
        value ?? ""
      ).replace(
        ",",
        "."
      )
    );

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}


function roundMoney(
  value
) {
  return Math.round(
    numberOrZero(
      value
    ) *
      100
  ) / 100;
}


function parseJsonSafe(
  text,
  fallback
) {
  try {
    const value =
      JSON.parse(
        text
      );

    return value;
  } catch {
    return fallback;
  }
}


/* =========================================================
   SEGURANÇA DE PASTA
   ========================================================= */

function safeFolder(
  value
) {
  const folder =
    String(
      value || ""
    ).trim();

  if (
    !folder ||
    folder.length > 120
  ) {
    return null;
  }

  if (
    folder.includes("/") ||
    folder.includes("\\\\") ||
    folder.includes("..")
  ) {
    return null;
  }

  if (
    folder.startsWith(".")
  ) {
    return null;
  }

  return folder;
}


/* =========================================================
   BASE64 / UTF-8
   ========================================================= */

function encodeUtf8(
  value
) {
  return base64urlToStandard(
    base64urlBytes(
      new TextEncoder().encode(
        JSON.stringify(
          value,
          null,
          4
        ) + "\\n"
      )
    )
  );
}


function base64url(
  input
) {
  if (
    typeof input ===
    "string"
  ) {
    return base64urlBytes(
      new TextEncoder().encode(
        input
      )
    );
  }

  return base64urlBytes(
    input
  );
}


function base64urlBytes(
  bytes
) {
  let binary = "";

  const chunk =
    0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunk
  ) {
    binary +=
      String.fromCharCode(
        ...bytes.subarray(
          i,
          Math.min(
            i + chunk,
            bytes.length
          )
        )
      );
  }

  return btoa(binary)
    .replace(
      /\\+/g,
      "-"
    )
    .replace(
      /\\//g,
      "_"
    )
    .replace(
      /=+$/g,
      ""
    );
}


function base64urlToStandard(
  value
) {
  return (
    value
      .replace(
        /-/g,
        "+"
      )
      .replace(
        /_/g,
        "/"
      ) +
    "=".repeat(
      (
        4 -
        (value.length % 4)
      ) % 4
    )
  );
}


function fromBase64url(
  value
) {
  const standard =
    base64urlToStandard(
      value
    );

  const binary =
    atob(
      standard
    );

  const bytes =
    Uint8Array.from(
      binary,
      c =>
        c.charCodeAt(0)
    );

  return new TextDecoder()
    .decode(
      bytes
    );
}


function decodeBase64Utf8(
  value
) {
  const clean =
    value.replace(
      /\\s/g,
      ""
    );

  const binary =
    atob(
      clean
    );

  const bytes =
    Uint8Array.from(
      binary,
      c =>
        c.charCodeAt(0)
    );

  return new TextDecoder()
    .decode(
      bytes
    );
}
`;
document.getElementById("code").textContent = workerCode;
</script>
</main>
</body>
</html>
