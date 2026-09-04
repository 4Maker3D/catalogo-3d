const JSON_HEADERS = {
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
        url.pathname.replace(/\/+$/, "") || "/";


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


      /* =====================================================
         CALCULADORA
         ===================================================== */

      if (
        path === "/api/calculate" &&
        request.method === "POST"
      ) {
        return await calculatePriceEndpoint(
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
    `${header}.${body}`;

  const signature =
    await hmac(
      data,
      secret
    );

  return (
    `${data}.${signature}`
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
      `${header}.${body}`,
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
    `https://api.github.com/repos/` +
    `${encodeURIComponent(
      env.GITHUB_OWNER
    )}/` +
    `${encodeURIComponent(
      env.GITHUB_REPO
    )}/contents/${path}`;

  const headers = {
    "Accept":
      "application/vnd.github+json",

    "Authorization":
      `Bearer ${env.GITHUB_TOKEN}`,

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
      `${path}?ref=${encodeURIComponent(
        env.GITHUB_BRANCH ||
        "main"
      )}`,
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
        `GitHub ${response.status} em ${path}: ${text.slice(
          0,
          300
        )}`
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
      `${path}?ref=${encodeURIComponent(
        env.GITHUB_BRANCH ||
        "main"
      )}`,
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
        `GitHub ${response.status} em ${path}: ${text.slice(
          0,
          300
        )}`
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
          JSON.stringify(body)
      },
      env
    );

  if (!response.ok) {
    const text =
      await response.text();

    const error =
      new Error(
        `GitHub ${response.status} em ${path}: ${text.slice(
          0,
          500
        )}`
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
   BASE64 / UTF-8
   ========================================================= */

function encodeUtf8(
  value
) {
  const bytes =
    new TextEncoder().encode(
      String(value)
    );

  let binary = "";

  const chunk =
    0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunk
  ) {
    binary += String.fromCharCode(
      ...bytes.subarray(
        i,
        i + chunk
      )
    );
  }

  return btoa(binary);
}


function decodeBase64Utf8(
  value
) {
  const cleaned =
    String(value)
      .replace(/\s/g, "");

  const binary =
    atob(cleaned);

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let i = 0;
    i < binary.length;
    i++
  ) {
    bytes[i] =
      binary.charCodeAt(i);
  }

  return new TextDecoder().decode(
    bytes
  );
}


function base64url(
  value
) {
  return btoa(
    unescape(
      encodeURIComponent(
        String(value)
      )
    )
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
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
    binary += String.fromCharCode(
      ...bytes.subarray(
        i,
        i + chunk
      )
    );
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}


function fromBase64url(
  value
) {
  let normalized =
    String(value)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  while (
    normalized.length % 4
  ) {
    normalized += "=";
  }

  return decodeURIComponent(
    escape(
      atob(normalized)
    )
  );
}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function safeFolder(
  value
) {
  const folder =
    String(
      value || ""
    ).trim();

  if (!folder) {
    return null;
  }

  if (
    folder.length > 120
  ) {
    return null;
  }

  if (
    folder.includes("/") ||
    folder.includes("\\") ||
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


function nowIso() {
  return new Date()
    .toISOString();
}


function parseJson(
  text,
  fallback
) {
  try {
    return JSON.parse(
      text
    );
  } catch {
    return fallback;
  }
}


function numberOrZero(
  value
) {
  const n =
    Number(value);

  return Number.isFinite(n)
    ? n
    : 0;
}


function cleanString(
  value
) {
  return String(
    value ?? ""
  ).trim();
}


/* =========================================================
   PRODUTOS — PADRÃO DADOS.JSON
   ========================================================= */

function starterDados() {
  const timestamp =
    nowIso();

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

    created_at:
      timestamp,

    updated_at:
      timestamp
  };
}


function normalizeDados(
  dados
) {
  const base =
    starterDados();

  const value =
    dados &&
    typeof dados === "object"
      ? dados
      : {};

  return {
    ...base,
    ...value,

    dimensions_mm: {
      ...base.dimensions_mm,
      ...(value.dimensions_mm || {})
    },

    costs: {
      ...base.costs,
      ...(value.costs || {})
    }
  };
}


/* =========================================================
   PRODUTOS — LISTAGEM
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

  if (
    !Array.isArray(entries)
  ) {
    return json(
      {
        error:
          "A pasta Modelos não retornou uma lista."
      },
      500,
      origin,
      env
    );
  }

  const products = [];

  for (
    const entry of entries
  ) {
    if (
      entry.type !== "dir"
    ) {
      continue;
    }

    const folder =
      safeFolder(
        entry.name
      );

    if (!folder) {
      continue;
    }

    const produtoFile =
      await getFile(
        `Modelos/${encodeURIComponent(folder)}/produto.json`,
        env
      );

    if (!produtoFile) {
      continue;
    }

    const produto =
      parseJson(
        produtoFile.content,
        null
      );

    if (!produto) {
      continue;
    }

    let dadosFile =
      await getFile(
        `Modelos/${encodeURIComponent(folder)}/dados.json`,
        env
      );

    let dados;

    if (!dadosFile) {
      dados =
        starterDados();

      dadosFile =
        await putFile(
          `Modelos/${encodeURIComponent(folder)}/dados.json`,
          encodeUtf8(
            JSON.stringify(
              dados,
              null,
              2
            )
          ),
          `chore: criar dados.json de ${folder}`,
          env
        );

      dadosFile = {
        sha:
          dadosFile.content?.sha ||
          null
      };
    } else {
      dados =
        normalizeDados(
          parseJson(
            dadosFile.content,
            {}
          )
        );
    }

    products.push({
      folder,
      produto,
      dados
    });
  }

  products.sort(
    (a, b) =>
      String(
        a.produto?.name ||
        a.folder
      ).localeCompare(
        String(
          b.produto?.name ||
          b.folder
        ),
        "pt-BR"
      )
  );

  return json(
    {
      ok: true,
      products
    },
    200,
    origin,
    env
  );
}


/* =========================================================
   PRODUTOS — CONSULTA INDIVIDUAL
   ========================================================= */

async function getProduct(
  folder,
  env,
  origin,
  ensureDados = false
) {
  const base =
    `Modelos/${encodeURIComponent(
      folder
    )}`;

  const produtoFile =
    await getFile(
      `${base}/produto.json`,
      env
    );

  if (!produtoFile) {
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

  const produto =
    parseJson(
      produtoFile.content,
      null
    );

  if (!produto) {
    return json(
      {
        error:
          "produto.json inválido."
      },
      500,
      origin,
      env
    );
  }

  let dadosFile =
    await getFile(
      `${base}/dados.json`,
      env
    );

  let dados;

  if (!dadosFile) {
    dados =
      starterDados();

    if (ensureDados) {
      const created =
        await putFile(
          `${base}/dados.json`,
          encodeUtf8(
            JSON.stringify(
              dados,
              null,
              2
            )
          ),
          `chore: criar dados.json de ${folder}`,
          env
        );

      dadosFile = {
        sha:
          created.content?.sha ||
          null
      };
    }
  } else {
    dados =
      normalizeDados(
        parseJson(
          dadosFile.content,
          {}
        )
      );
  }

  return json(
    {
      ok: true,

      product: {
        folder,
        produto,
        dados
      }
    },
    200,
    origin,
    env
  );
}


/* =========================================================
   PRODUTOS — ATUALIZAÇÃO
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
          "Produto inválido."
      },
      400,
      origin,
      env
    );
  }

  const produto =
    body?.produto &&
    typeof body.produto === "object"
      ? body.produto
      : null;

  const dados =
    normalizeDados(
      body?.dados
    );

  if (!produto) {
    return json(
      {
        error:
          "Dados públicos do produto são obrigatórios."
      },
      400,
      origin,
      env
    );
  }

  const base =
    `Modelos/${encodeURIComponent(
      folder
    )}`;

  const produtoPath =
    `${base}/produto.json`;

  const dadosPath =
    `${base}/dados.json`;

  const currentProduto =
    await getFile(
      produtoPath,
      env
    );

  const currentDados =
    await getFile(
      dadosPath,
      env
    );

  const updatedAt =
    nowIso();

  dados.updated_at =
    updatedAt;

  if (
    !dados.created_at
  ) {
    dados.created_at =
      currentDados
        ? normalizeDados(
            parseJson(
              currentDados.content,
              {}
            )
          ).created_at
        : updatedAt;
  }

  await putFile(
    produtoPath,
    encodeUtf8(
      JSON.stringify(
        produto,
        null,
        2
      )
    ),
    `admin: atualizar produto ${folder}`,
    env,
    currentProduto?.sha || null
  );

  await putFile(
    dadosPath,
    encodeUtf8(
      JSON.stringify(
        dados,
        null,
        2
      )
    ),
    `admin: atualizar dados de ${folder}`,
    env,
    currentDados?.sha || null
  );

  return json(
    {
      ok: true,
      folder,
      produto,
      dados
    },
    200,
    origin,
    env
  );
}


/* =========================================================
   PRODUTOS — CRIAÇÃO
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
      body?.folder ||
      body?.produto?.name
    );

  if (!folder) {
    return json(
      {
        error:
          "Nome do produto inválido."
      },
      400,
      origin,
      env
    );
  }

  const produto =
    body?.produto &&
    typeof body.produto === "object"
      ? body.produto
      : {};

  const dados =
    normalizeDados(
      body?.dados
    );

  const stlBase64 =
    String(
      body?.stlBase64 ||
      ""
    );

  const stlName =
    cleanString(
      body?.stlName ||
      "modelo.stl"
    ) ||
    "modelo.stl";

  if (
    !/\.stl$/i.test(
      stlName
    )
  ) {
    return json(
      {
        error:
          "O arquivo deve ser STL."
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
          "Arquivo STL obrigatório."
      },
      400,
      origin,
      env
    );
  }

  const rawBase64 =
    stlBase64
      .replace(/^data:[^;]+;base64,/i, "")
      .replace(/\s/g, "");

  if (
    rawBase64.length >
    140 * 1024 * 1024
  ) {
    return json(
      {
        error:
          "Arquivo STL muito grande."
      },
      413,
      origin,
      env
    );
  }

  const base =
    `Modelos/${encodeURIComponent(
      folder
    )}`;

  const existing =
    await getFile(
      `${base}/produto.json`,
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

  const timestamp =
    nowIso();

  dados.created_at =
    timestamp;

  dados.updated_at =
    timestamp;

  produto.name =
    cleanString(
      produto.name ||
      folder
    );

  await putFile(
    `${base}/produto.json`,
    encodeUtf8(
      JSON.stringify(
        produto,
        null,
        2
      )
    ),
    `feat: criar produto ${folder}`,
    env
  );

  await putFile(
    `${base}/dados.json`,
    encodeUtf8(
      JSON.stringify(
        dados,
        null,
        2
      )
    ),
    `feat: criar dados do produto ${folder}`,
    env
  );

  await putFile(
    `${base}/modelo.stl`,
    rawBase64,
    `feat: adicionar STL do produto ${folder}`,
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
   CONFIGURAÇÕES PADRÃO
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
        price_per_kg: 99
      },

      {
        name: "ABS",
        price_per_kg: 89
      },

      {
        name: "ASA",
        price_per_kg: 109
      },

      {
        name: "TPU",
        price_per_kg: 129
      },

      {
        name: "TPE",
        price_per_kg: 139
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
        price_per_kg: 159
      },

      {
        name: "HIPS",
        price_per_kg: 109
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
        percent: 0
      },

      {
        min: 5,
        max: 9,
        percent: 5
      },

      {
        min: 10,
        max: 24,
        percent: 10
      },

      {
        min: 25,
        max: 49,
        percent: 15
      },

      {
        min: 50,
        max: null,
        percent: 20
      }
    ],

    updated_at:
      nowIso()
  };
}


/* =========================================================
   NORMALIZAÇÃO DE CONFIGURAÇÕES
   ========================================================= */

function normalizeSettings(
  settings
) {
  const base =
    defaultSettings();

  const value =
    settings &&
    typeof settings === "object"
      ? settings
      : {};

  return {
    ...base,
    ...value,

    rounding: {
      ...base.rounding,
      ...(value.rounding || {})
    },

    costs: {
      ...base.costs,
      ...(value.costs || {})
    },

    materials:
      Array.isArray(
        value.materials
      )
        ? value.materials
        : base.materials,

    volume_discounts:
      Array.isArray(
        value.volume_discounts
      )
        ? value.volume_discounts
        : base.volume_discounts
  };
}


/* =========================================================
   CONFIGURAÇÕES — GET
   ========================================================= */

async function getSettings(
  env,
  origin
) {
  let file =
    await getFile(
      ADMIN_FILES.settings,
      env
    );

  if (!file) {
    const settings =
      defaultSettings();

    const created =
      await putFile(
        ADMIN_FILES.settings,
        encodeUtf8(
          JSON.stringify(
            settings,
            null,
            2
          )
        ),
        "chore: criar configuracoes.json",
        env
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

  const settings =
    normalizeSettings(
      parseJson(
        file.content,
        {}
      )
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


/* =========================================================
   CONFIGURAÇÕES — PUT
   ========================================================= */

async function updateSettings(
  request,
  env,
  origin
) {
  const body =
    await request
      .json()
      .catch(() => null);

  const settings =
    normalizeSettings(
      body?.settings ||
      body
    );

  settings.updated_at =
    nowIso();

  const current =
    await getFile(
      ADMIN_FILES.settings,
      env
    );

  await putFile(
    ADMIN_FILES.settings,
    encodeUtf8(
      JSON.stringify(
        settings,
        null,
        2
      )
    ),
    "admin: atualizar configuracoes",
    env,
    current?.sha || null
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


/* =========================================================
   CLIENTES
   ========================================================= */

function defaultClients() {
  return [];
}


async function loadJsonArray(
  path,
  env,
  fallback = []
) {
  const file =
    await getFile(
      path,
      env
    );

  if (!file) {
    return {
      file: null,
      data: fallback
    };
  }

  return {
    file,

    data:
      Array.isArray(
        parseJson(
          file.content,
          fallback
        )
      )
        ? parseJson(
            file.content,
            fallback
          )
        : fallback
  };
}


async function saveJsonArray(
  path,
  data,
  message,
  env,
  sha = null
) {
  return putFile(
    path,
    encodeUtf8(
      JSON.stringify(
        data,
        null,
        2
      )
    ),
    message,
    env,
    sha
  );
}


async function listClients(
  env,
  origin
) {
  const result =
    await loadJsonArray(
      ADMIN_FILES.clients,
      env,
      defaultClients()
    );

  if (!result.file) {
    await saveJsonArray(
      ADMIN_FILES.clients,
      result.data,
      "chore: criar clientes.json",
      env
    );
  }

  return json(
    {
      ok: true,
      clients:
        result.data
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

  const name =
    cleanString(
      body?.name
    );

  if (!name) {
    return json(
      {
        error:
          "Nome do cliente obrigatório."
      },
      400,
      origin,
      env
    );
  }

  const result =
    await loadJsonArray(
      ADMIN_FILES.clients,
      env,
      defaultClients()
    );

  const clients =
    result.data;

  const now =
    nowIso();

  const client = {
    id:
      cleanString(
        body?.id
      ) ||
      crypto.randomUUID(),

    name,

    document:
      cleanString(
        body?.document
      ),

    email:
      cleanString(
        body?.email
      ),

    phone:
      cleanString(
        body?.phone
      ),

    address:
      cleanString(
        body?.address
      ),

    city:
      cleanString(
        body?.city
      ),

    state:
      cleanString(
        body?.state
      ),

    notes:
      cleanString(
        body?.notes
      ),

    created_at:
      now,

    updated_at:
      now
  };

  clients.push(
    client
  );

  await saveJsonArray(
    ADMIN_FILES.clients,
    clients,
    `feat: criar cliente ${client.name}`,
    env,
    result.file?.sha || null
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
    cleanString(
      body?.id
    );

  if (!id) {
    return json(
      {
        error:
          "ID do cliente obrigatório."
      },
      400,
      origin,
      env
    );
  }

  const result =
    await loadJsonArray(
      ADMIN_FILES.clients,
      env,
      defaultClients()
    );

  const clients =
    result.data;

  const index =
    clients.findIndex(
      client =>
        String(
          client?.id
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

  const old =
    clients[index];

  const updated = {
    ...old,

    name:
      cleanString(
        body?.name ??
        old.name
      ),

    document:
      cleanString(
        body?.document ??
        old.document
      ),

    email:
      cleanString(
        body?.email ??
        old.email
      ),

    phone:
      cleanString(
        body?.phone ??
        old.phone
      ),

    address:
      cleanString(
        body?.address ??
        old.address
      ),

    city:
      cleanString(
        body?.city ??
        old.city
      ),

    state:
      cleanString(
        body?.state ??
        old.state
      ),

    notes:
      cleanString(
        body?.notes ??
        old.notes
      ),

    updated_at:
      nowIso()
  };

  clients[index] =
    updated;

  await saveJsonArray(
    ADMIN_FILES.clients,
    clients,
    `admin: atualizar cliente ${updated.name}`,
    env,
    result.file?.sha || null
  );

  return json(
    {
      ok: true,
      client:
        updated
    },
    200,
    origin,
    env
  );
}


/* =========================================================
   PREÇOS NEGOCIADOS
   ========================================================= */

function defaultPrices() {
  return [];
}


async function listPrices(
  request,
  env,
  origin
) {
  const result =
    await loadJsonArray(
      ADMIN_FILES.prices,
      env,
      defaultPrices()
    );

  if (!result.file) {
    await saveJsonArray(
      ADMIN_FILES.prices,
      result.data,
      "chore: criar precos.json",
      env
    );
  }

  const url =
    new URL(
      request.url
    );

  const customerId =
    cleanString(
      url.searchParams.get(
        "customerId"
      )
    );

  const productFolder =
    cleanString(
      url.searchParams.get(
        "productFolder"
      )
    );

  const filtered =
    result.data.filter(
      item => {
        if (
          customerId &&
          String(
            item.customer_id
          ) !== customerId
        ) {
          return false;
        }

        if (
          productFolder &&
          String(
            item.product_folder
          ) !== productFolder
        ) {
          return false;
        }

        return true;
      }
    );

  return json(
    {
      ok: true,
      prices:
        filtered
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
    cleanString(
      body?.customer_id
    );

  const productFolder =
    safeFolder(
      body?.product_folder
    );

  const price =
    Number(
      body?.price
    );

  if (
    !customerId ||
    !productFolder ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return json(
      {
        error:
          "Cliente, produto e preço são obrigatórios."
      },
      400,
      origin,
      env
    );
  }

  const result =
    await loadJsonArray(
      ADMIN_FILES.prices,
      env,
      defaultPrices()
    );

  const prices =
    result.data;

  const material =
    cleanString(
      body?.material
    );

  const color =
    cleanString(
      body?.color
    );

  const now =
    nowIso();

  const index =
    prices.findIndex(
      item =>
        String(
          item.customer_id
        ) === customerId &&
        String(
          item.product_folder
        ) === productFolder &&
        String(
          item.material || ""
        ) === material &&
        String(
          item.color || ""
        ) === color
    );

  const record = {
    id:
      index >= 0
        ? prices[index].id
        : crypto.randomUUID(),

    customer_id:
      customerId,

    product_folder:
      productFolder,

    material,

    color,

    price,

    created_at:
      index >= 0
        ? prices[index].created_at
        : now,

    updated_at:
      now
  };

  if (index >= 0) {
    prices[index] =
      record;
  } else {
    prices.push(
      record
    );
  }

  await saveJsonArray(
    ADMIN_FILES.prices,
    prices,
    `admin: salvar preço negociado`,
    env,
    result.file?.sha || null
  );

  return json(
    {
      ok: true,
      price:
        record
    },
    200,
    origin,
    env
  );
}


/* =========================================================
   PEDIDOS
   ========================================================= */

function defaultOrders() {
  return [];
}


async function listOrders(
  request,
  env,
  origin
) {
  const result =
    await loadJsonArray(
      ADMIN_FILES.orders,
      env,
      defaultOrders()
    );

  if (!result.file) {
    await saveJsonArray(
      ADMIN_FILES.orders,
      result.data,
      "chore: criar pedidos.json",
      env
    );
  }

  return json(
    {
      ok: true,
      orders:
        result.data
    },
    200,
    origin,
    env
  );
}


/* =========================================================
   CÁLCULO DE DESCONTO POR VOLUME
   ========================================================= */

function getVolumeDiscount(
  quantity,
  settings
) {
  const tiers =
    Array.isArray(
      settings?.volume_discounts
    )
      ? settings.volume_discounts
      : [];

  const qty =
    Math.max(
      0,
      Number(quantity) || 0
    );

  let selected =
    null;

  for (
    const tier of tiers
  ) {
    const min =
      Number(
        tier?.min
      ) || 0;

    const max =
      tier?.max === null ||
      tier?.max === undefined ||
      tier?.max === ""
        ? Infinity
        : Number(
            tier.max
          );

    if (
      qty >= min &&
      qty <= max
    ) {
      selected =
        tier;

      break;
    }
  }

  return {
    percent:
      Number(
        selected?.percent
      ) || 0,

    tier:
      selected
  };
}


/* =========================================================
   ARREDONDAMENTO
   ========================================================= */

function applyRounding(
  value,
  settings
) {
  const enabled =
    Boolean(
      settings?.rounding?.enabled
    );

  const increment =
    Number(
      settings?.rounding?.increment
    );

  if (
    !enabled ||
    !Number.isFinite(
      increment
    ) ||
    increment <= 0
  ) {
    return value;
  }

  return (
    Math.ceil(
      value /
      increment
    ) *
    increment
  );
}


/* =========================================================
   BUSCA DE MATERIAL
   ========================================================= */

function findMaterial(
  materialName,
  settings
) {
  const materials =
    Array.isArray(
      settings?.materials
    )
      ? settings.materials
      : [];

  const normalized =
    cleanString(
      materialName
    ).toLowerCase();

  return (
    materials.find(
      material =>
        cleanString(
          material?.name
        ).toLowerCase() ===
        normalized
    ) ||
    null
  );
}


/* =========================================================
   CÁLCULO DE PREÇO
   ========================================================= */

function calculatePrice(
  input,
  settings
) {
  const weight =
    numberOrZero(
      input?.weight_g
    );

  const printTime =
    numberOrZero(
      input?.print_time_h
    );

  const quantity =
    Math.max(
      1,
      Number(
        input?.quantity
      ) || 1
    );

  const wastePercent =
    Number(
      input?.waste_percent ??
      settings?.waste_percent ??
      0
    ) || 0;

  const waste =
    Math.max(
      0,
      wastePercent
    ) / 100;

  const effectiveWeight =
    weight *
    (1 + waste);

  const materialName =
    cleanString(
      input?.material
    );

  const materialData =
    findMaterial(
      materialName,
      settings
    );

  const materialPriceKg =
    Number(
      input?.material_price_per_kg ??
      materialData?.price_per_kg ??
      0
    ) || 0;

  const filamentCostUnit =
    effectiveWeight *
    materialPriceKg /
    1000;

  const machineHourly =
    Number(
      input?.machine_hour_cost ??
      settings?.machine_hour_cost ??
      0
    ) || 0;

  const machineCostUnit =
    printTime *
    machineHourly;

  const finishing =
    numberOrZero(
      input?.finishing ??
      settings?.costs?.finishing
    );

  const painting =
    numberOrZero(
      input?.painting ??
      settings?.costs?.painting
    );

  const packaging =
    numberOrZero(
      input?.packaging ??
      settings?.costs?.packaging
    );

  const other =
    numberOrZero(
      input?.other ??
      settings?.costs?.other
    );

  const fixedExtras =
    finishing +
    painting +
    packaging +
    other;

  const commissionPercent =
    Number(
      input?.commission_percent ??
      settings?.costs?.commission_percent ??
      0
    ) || 0;

  const baseCostUnit =
    filamentCostUnit +
    machineCostUnit +
    fixedExtras;

  const totalCost =
    baseCostUnit *
    quantity;

  const mode =
    cleanString(
      input?.mode ||
      "final"
    ).toLowerCase();

  const marginPercent =
    Number(
      input?.margin_percent ??
      settings?.default_margin_percent ??
      0
    ) || 0;

  const resellerMarginPercent =
    Number(
      input?.reseller_margin_percent ??
      settings?.default_reseller_margin_percent ??
      0
    ) || 0;

  const safeMargin =
    Math.min(
      99.99,
      Math.max(
        0,
        marginPercent
      )
    );

  const safeResellerMargin =
    Math.min(
      99.99,
      Math.max(
        0,
        resellerMarginPercent
      )
    );

  let finalUnitPrice =
    0;

  let resellerUnitPrice =
    0;

  let finalPrice =
    0;

  let resellerPrice =
    0;

  if (
    mode === "cost"
  ) {
    finalUnitPrice =
      baseCostUnit;

    resellerUnitPrice =
      baseCostUnit;

    finalPrice =
      totalCost;

    resellerPrice =
      totalCost;

  } else if (
    mode === "reseller"
  ) {
    resellerUnitPrice =
      baseCostUnit /
      (
        1 -
        safeResellerMargin /
        100
      );

    finalUnitPrice =
      resellerUnitPrice /
      (
        1 -
        safeMargin /
        100
      );

    resellerPrice =
      resellerUnitPrice *
      quantity;

    finalPrice =
      finalUnitPrice *
      quantity;

  } else {
    finalUnitPrice =
      baseCostUnit /
      (
        1 -
        safeMargin /
        100
      );

    resellerUnitPrice =
      baseCostUnit /
      (
        1 -
        safeResellerMargin /
        100
      );

    finalPrice =
      finalUnitPrice *
      quantity;

    resellerPrice =
      resellerUnitPrice *
      quantity;
  }

  const targetFinalPrice =
    Number(
      input?.target_final_price
    );

  if (
    mode === "reseller" &&
    Number.isFinite(
      targetFinalPrice
    ) &&
    targetFinalPrice > 0
  ) {
    finalPrice =
      targetFinalPrice;

    finalUnitPrice =
      targetFinalPrice /
      quantity;
  }

  const volume =
    getVolumeDiscount(
      quantity,
      settings
    );

  const discountValue =
    finalPrice *
    volume.percent /
    100;

  const discountedFinalPrice =
    Math.max(
      totalCost,
      finalPrice -
      discountValue
    );

  const commissionValue =
    discountedFinalPrice *
    commissionPercent /
    100;

  const estimatedProfit =
    discountedFinalPrice -
    totalCost -
    commissionValue;

  const roundedFinalPrice =
    applyRounding(
      discountedFinalPrice,
      settings
    );

  const roundedFinalUnit =
    roundedFinalPrice /
    quantity;

  return {
    quantity,

    weight_g:
      weight,

    effective_weight_g:
      effectiveWeight,

    print_time_h:
      printTime,

    material:
      materialName,

    material_price_per_kg:
      materialPriceKg,

    waste_percent:
      wastePercent,

    filament_cost_unit:
      filamentCostUnit,

    machine_cost_unit:
      machineCostUnit,

    finishing:
      finishing,

    painting:
      painting,

    packaging:
      packaging,

    other:
      other,

    base_cost_unit:
      baseCostUnit,

    total_cost:
      totalCost,

    margin_percent:
      safeMargin,

    reseller_margin_percent:
      safeResellerMargin,

    final_unit_price:
      finalUnitPrice,

    reseller_unit_price:
      resellerUnitPrice,

    final_price:
      roundedFinalPrice,

    final_unit_price_rounded:
      roundedFinalUnit,

    reseller_price:
      resellerPrice,

    volume_discount_percent:
      volume.percent,

    volume_discount_value:
      discountValue,

    commission_percent:
      commissionPercent,

    commission_value:
      commissionValue,

    estimated_profit:
      estimatedProfit
  };
}


/* =========================================================
   ENDPOINT DA CALCULADORA
   ========================================================= */

async function calculatePriceEndpoint(
  request,
  env,
  origin
) {
  const body =
    await request
      .json()
      .catch(() => null);

  const settingsFile =
    await getFile(
      ADMIN_FILES.settings,
      env
    );

  let settings;

  if (!settingsFile) {
    settings =
      defaultSettings();

    await saveJsonArray(
      ADMIN_FILES.settings,
      settings,
      "chore: criar configuracoes.json",
      env
    );
  } else {
    settings =
      normalizeSettings(
        parseJson(
          settingsFile.content,
          {}
        )
      );
  }

  const result =
    calculatePrice(
      body || {},
      settings
    );

  return json(
    {
      ok: true,
      result
    },
    200,
    origin,
    env
  );
}


/* =========================================================
   CÁLCULO DE PEDIDOS
   ========================================================= */

function calculateOrderTotals(
  items,
  settings
) {
  const list =
    Array.isArray(items)
      ? items
      : [];

  let subtotal =
    0;

  let totalQuantity =
    0;

  let estimatedCost =
    0;

  for (
    const item of list
  ) {
    const quantity =
      Math.max(
        1,
        Number(
          item?.quantity
        ) || 1
      );

    const unitPrice =
      Number(
        item?.unit_price
      ) || 0;

    const unitCost =
      Number(
        item?.unit_cost
      ) || 0;

    subtotal +=
      unitPrice *
      quantity;

    estimatedCost +=
      unitCost *
      quantity;

    totalQuantity +=
      quantity;
  }

  const volume =
    getVolumeDiscount(
      totalQuantity,
      settings
    );

  const volumeDiscountValue =
    subtotal *
    volume.percent /
    100;

  const total =
    Math.max(
      estimatedCost,
      subtotal -
      volumeDiscountValue
    );

  const estimatedProfit =
    total -
    estimatedCost;

  return {
    subtotal,

    total_quantity:
      totalQuantity,

    volume_discount_percent:
      volume.percent,

    volume_discount_value:
      volumeDiscountValue,

    total,

    estimated_cost:
      estimatedCost,

    estimated_profit:
      estimatedProfit
  };
}


/* =========================================================
   CRIAÇÃO DE PEDIDO
   ========================================================= */

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
    typeof body !== "object"
  ) {
    return json(
      {
        error:
          "Dados do pedido inválidos."
      },
      400,
      origin,
      env
    );
  }

  const customerId =
    cleanString(
      body.customer_id
    );

  if (!customerId) {
    return json(
      {
        error:
          "Cliente obrigatório."
      },
      400,
      origin,
      env
    );
  }

  const items =
    Array.isArray(
      body.items
    )
      ? body.items
      : [];

  if (
    !items.length
  ) {
    return json(
      {
        error:
          "O pedido precisa ter pelo menos um item."
      },
      400,
      origin,
      env
    );
  }

  const clientsResult =
    await loadJsonArray(
      ADMIN_FILES.clients,
      env,
      defaultClients()
    );

  const customer =
    clientsResult.data.find(
      client =>
        String(
          client?.id
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

  const settingsFile =
    await getFile(
      ADMIN_FILES.settings,
      env
    );

  const settings =
    settingsFile
      ? normalizeSettings(
          parseJson(
            settingsFile.content,
            {}
          )
        )
      : defaultSettings();

  const totals =
    calculateOrderTotals(
      items,
      settings
    );

  const now =
    nowIso();

  const order = {
    id:
      cleanString(
        body.id
      ) ||
      crypto.randomUUID(),

    number:
      cleanString(
        body.number
      ) ||
      `PED-${Date.now()}`,

    customer_id:
      customerId,

    customer_snapshot:
      {
        ...customer
      },

    items:
      items.map(
        item => ({
          ...item,
          quantity:
            Math.max(
              1,
              Number(
                item?.quantity
              ) || 1
            ),
          unit_price:
            Number(
              item?.unit_price
            ) || 0,
          unit_cost:
            Number(
              item?.unit_cost
            ) || 0
        })
      ),

    subtotal:
      totals.subtotal,

    volume_discount_percent:
      totals.volume_discount_percent,

    volume_discount_value:
      totals.volume_discount_value,

    total:
      totals.total,

    estimated_cost:
      totals.estimated_cost,

    estimated_profit:
      totals.estimated_profit,

    status:
      cleanString(
        body.status
      ) ||
      "Orçamento",

    payment:
      body.payment &&
      typeof body.payment === "object"
        ? {
            method:
              cleanString(
                body.payment.method
              ),

            status:
              cleanString(
                body.payment.status
              ),

            paid:
              Boolean(
                body.payment.paid
              )
          }
        : {
            method: "",
            status: "",
            paid: false
          },

    notes:
      cleanString(
        body.notes
      ),

    created_at:
      now,

    updated_at:
      now
  };

  const result =
    await loadJsonArray(
      ADMIN_FILES.orders,
      env,
      defaultOrders()
    );

  const orders =
    result.data;

  orders.push(
    order
  );

  await saveJsonArray(
    ADMIN_FILES.orders,
    orders,
    `feat: criar pedido ${order.number}`,
    env,
    result.file?.sha || null
  );

  await syncBillingFromOrder(
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


/* =========================================================
   ATUALIZAÇÃO DE PEDIDO
   ========================================================= */

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
    cleanString(
      body?.id
    );

  if (!id) {
    return json(
      {
        error:
          "ID do pedido obrigatório."
      },
      400,
      origin,
      env
    );
  }

  const result =
    await loadJsonArray(
      ADMIN_FILES.orders,
      env,
      defaultOrders()
    );

  const orders =
    result.data;

  const index =
    orders.findIndex(
      order =>
        String(
          order?.id
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

  const old =
    orders[index];

  const settingsFile =
    await getFile(
      ADMIN_FILES.settings,
      env
    );

  const settings =
    settingsFile
      ? normalizeSettings(
          parseJson(
            settingsFile.content,
            {}
          )
        )
      : defaultSettings();

  const items =
    Array.isArray(
      body.items
    )
      ? body.items
      : old.items;

  const totals =
    calculateOrderTotals(
      items,
      settings
    );

  const updated = {
    ...old,

    items:
      items.map(
        item => ({
          ...item,
          quantity:
            Math.max(
              1,
              Number(
                item?.quantity
              ) || 1
            ),
          unit_price:
            Number(
              item?.unit_price
            ) || 0,
          unit_cost:
            Number(
              item?.unit_cost
            ) || 0
        })
      ),

    subtotal:
      totals.subtotal,

    volume_discount_percent:
      totals.volume_discount_percent,

    volume_discount_value:
      totals.volume_discount_value,

    total:
      totals.total,

    estimated_cost:
      totals.estimated_cost,

    estimated_profit:
      totals.estimated_profit,

    status:
      body.status !== undefined
        ? cleanString(
            body.status
          )
        : old.status,

    notes:
      body.notes !== undefined
        ? cleanString(
            body.notes
          )
        : old.notes,

    payment:
      body.payment !== undefined
        ? body.payment
        : old.payment,

    updated_at:
      nowIso()
  };

  orders[index] =
    updated;

  await saveJsonArray(
    ADMIN_FILES.orders,
    orders,
    `admin: atualizar pedido ${updated.number}`,
    env,
    result.file?.sha || null
  );

  await syncBillingFromOrder(
    updated,
    env
  );

  return json(
    {
      ok: true,
      order:
        updated
    },
    200,
    origin,
    env
  );
}


/* =========================================================
   FATURAMENTO
   ========================================================= */

function defaultBilling() {
  return [];
}


async function syncBillingFromOrder(
  order,
  env
) {
  const result =
    await loadJsonArray(
      ADMIN_FILES.billing,
      env,
      defaultBilling()
    );

  const billing =
    result.data;

  const index =
    billing.findIndex(
      item =>
        String(
          item?.order_id
        ) ===
        String(
          order?.id
        )
    );

  const record = {
    id:
      index >= 0
        ? billing[index].id
        : crypto.randomUUID(),

    order_id:
      order.id,

    order_number:
      order.number,

    customer_id:
      order.customer_id,

    customer_snapshot:
      order.customer_snapshot,

    total:
      numberOrZero(
        order.total
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
      cleanString(
        order.status
      ),

    payment:
      order.payment ||
      {
        method: "",
        status: "",
        paid: false
      },

    date:
      order.updated_at ||
      nowIso(),

    updated_at:
      nowIso()
  };

  if (index >= 0) {
    billing[index] =
      record;
  } else {
    billing.push(
      record
    );
  }

  await saveJsonArray(
    ADMIN_FILES.billing,
    billing,
    `admin: atualizar faturamento ${order.number}`,
    env,
    result.file?.sha || null
  );
}


async function getBilling(
  request,
  env,
  origin
) {
  const result =
    await loadJsonArray(
      ADMIN_FILES.billing,
      env,
      defaultBilling()
    );

  if (!result.file) {
    await saveJsonArray(
      ADMIN_FILES.billing,
      result.data,
      "chore: criar faturamento.json",
      env
    );
  }

  const url =
    new URL(
      request.url
    );

  const status =
    cleanString(
      url.searchParams.get(
        "status"
      )
    );

  const filtered =
    status
      ? result.data.filter(
          item =>
            String(
              item?.status
            ) === status
        )
      : result.data;

  let total =
    0;

  let cost =
    0;

  let profit =
    0;

  for (
    const item of filtered
  ) {
    total +=
      numberOrZero(
        item.total
      );

    cost +=
      numberOrZero(
        item.estimated_cost
      );

    profit +=
      numberOrZero(
        item.estimated_profit
      );
  }

  return json(
    {
      ok: true,

      billing:
        filtered,

      summary: {
        total,
        estimated_cost:
          cost,
        estimated_profit:
          profit,
        count:
          filtered.length
      }
    },
    200,
    origin,
    env
  );
}
