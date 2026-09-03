const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const DEFAULT_CORS = "https://4maker3d.github.io";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, env)
      });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname.replace(/\/+$/, "") || "/";

      if (path === "/api/login" && request.method === "POST") {
        return handleLogin(request, env, origin);
      }

      if (path === "/api/session" && request.method === "GET") {
        const session = await authenticate(request, env);

        if (!session) {
          return json(
            { authenticated: false },
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

      if (path === "/api/logout" && request.method === "POST") {
        return json({ ok: true }, 200, origin, env);
      }

      const session = await authenticate(request, env);

      if (!session) {
        return json(
          { error: "Não autenticado." },
          401,
          origin,
          env
        );
      }

      if (path === "/api/products" && request.method === "GET") {
        return await listProducts(env, origin);
      }

      if (path === "/api/product" && request.method === "GET") {
        const folder = safeFolder(
          new URL(request.url).searchParams.get("folder")
        );

        if (!folder) {
          return json(
            { error: "Produto inválido." },
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

      if (path === "/api/product" && request.method === "PUT") {
        return await updateProduct(
          request,
          env,
          origin
        );
      }

      if (path === "/api/product" && request.method === "POST") {
        return await createProduct(
          request,
          env,
          origin
        );
      }

      return json(
        { error: "Rota não encontrada." },
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

          detail: error?.message || "",

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


function corsHeaders(origin, env) {
  const allowed = getAllowedOrigins(env);

  const allowOrigin =
    allowed.includes(origin)
      ? origin
      : DEFAULT_CORS;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "false",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization",
    "Access-Control-Allow-Methods":
      "GET, POST, PUT, OPTIONS",
    "Vary": "Origin"
  };
}


function getAllowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || DEFAULT_CORS)
    .split(",")
    .map(s => s.trim())
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
        ...corsHeaders(origin, env),
        ...extraHeaders
      }
    }
  );
}


async function handleLogin(
  request,
  env,
  origin
) {
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    "unknown";

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
    await request.json().catch(() => null);

  const username =
    String(body?.username || "");

  const password =
    String(body?.password || "");

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

  if (!userOk || !passOk) {
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
    Math.floor(Date.now() / 1000);

  const exp =
    now + 8 * 60 * 60;

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


async function authenticate(
  request,
  env
) {
  const auth =
    request.headers.get("Authorization") ||
    "";

  if (!auth.startsWith("Bearer ")) {
    return null;
  }

  const token =
    auth.slice(7).trim();

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
      JSON.stringify(payload)
    );

  const data =
    `${header}.${body}`;

  const signature =
    await hmac(
      data,
      secret
    );

  return `${data}.${signature}`;
}


async function verifySession(
  token,
  secret
) {
  const parts =
    token.split(".");

  if (parts.length !== 3) {
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
        fromBase64url(body)
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
    Math.floor(Date.now() / 1000)
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
      new TextEncoder().encode(secret),
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
      new TextEncoder().encode(data)
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

  const [ha, hb] =
    await Promise.all([
      crypto.subtle.digest(
        "SHA-256",
        enc.encode(String(a))
      ),
      crypto.subtle.digest(
        "SHA-256",
        enc.encode(String(b))
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
    diff |= aa[i] ^ bb[i];
  }

  return diff === 0;
}


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

  return item.count <= max;
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
    `${encodeURIComponent(env.GITHUB_OWNER)}/` +
    `${encodeURIComponent(env.GITHUB_REPO)}/` +
    `contents/${path}`;

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

  const response =
    await fetch(
      url,
      {
        ...options,
        headers
      }
    );

  return response;
}


async function getGitHubJson(
  path,
  env
) {
  const response =
    await github(
      `${path}?ref=${encodeURIComponent(
        env.GITHUB_BRANCH || "main"
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
        env.GITHUB_BRANCH || "main"
      )}`,
      {
        method: "GET"
      },
      env
    );

  if (response.status === 404) {
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
        `Modelos/${encodeURIComponent(
          folder
        )}/produto.json`,
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
        `Modelos/${encodeURIComponent(
          folder
        )}/dados.json`,
        env
      );

    let dataCreated =
      false;

    if (!dataFile) {
      const starter =
        defaultDados(product);

      dataFile =
        await putFile(
          `Modelos/${encodeURIComponent(
            folder
          )}/dados.json`,
          encodeUtf8(starter),
          `4Maker 3D: criar dados.json de ${folder}`,
          env
        );

      dataCreated =
        true;
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

      customization:
        product.customization ||
        "",

      colors:
        Array.isArray(
          product.colors
        )
          ? product.colors
          : [],

      hasData: true,

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
      `Modelos/${encodeURIComponent(
        folder
      )}/produto.json`,
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
      `Modelos/${encodeURIComponent(
        folder
      )}/dados.json`,
      env
    );

  let dataCreated =
    false;

  if (
    !dataFile &&
    ensureData
  ) {
    const starter =
      defaultDados(product);

    await putFile(
      `Modelos/${encodeURIComponent(
        folder
      )}/dados.json`,
      encodeUtf8(starter),
      `4Maker 3D: criar dados.json de ${folder}`,
      env
    );

    dataFile =
      await getFile(
        `Modelos/${encodeURIComponent(
          folder
        )}/dados.json`,
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
      : defaultDados(product);

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
    await request.json()
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
    typeof produto !== "object" ||
    !dados ||
    typeof dados !== "object"
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
      `Modelos/${encodeURIComponent(
        folder
      )}/produto.json`,
      env
    );

  const dataFile =
    await getFile(
      `Modelos/${encodeURIComponent(
        folder
      )}/dados.json`,
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
    `Modelos/${encodeURIComponent(
      folder
    )}/produto.json`,
    encodeUtf8(produto),
    `4Maker 3D: atualizar produto ${folder}`,
    env,
    productFile.sha
  );

  await putFile(
    `Modelos/${encodeURIComponent(
      folder
    )}/dados.json`,
    encodeUtf8(dados),
    `4Maker 3D: atualizar dados ${folder}`,
    env,
    dataFile?.sha || null
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
    await request.json()
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
    typeof produto !== "object"
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
      `Modelos/${encodeURIComponent(
        folder
      )}/produto.json`,
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
    `Modelos/${encodeURIComponent(
      folder
    )}/produto.json`,
    encodeUtf8(produto),
    `4Maker 3D: criar produto ${folder}`,
    env
  );

  await putFile(
    `Modelos/${encodeURIComponent(
      folder
    )}/dados.json`,
    encodeUtf8(dados),
    `4Maker 3D: criar dados ${folder}`,
    env
  );

  await putFile(
    `Modelos/${encodeURIComponent(
      folder
    )}/modelo.stl`,
    stlBase64,
    `4Maker 3D: adicionar STL ${folder}`,
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
   DADOS INTERNOS
   ========================================================= */


function defaultDados(
  produto = {}
) {
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
      new Date().toISOString(),

    updated_at:
      new Date().toISOString()
  };
}


/* =========================================================
   SEGURANÇA DE PASTA
   ========================================================= */


function safeFolder(value) {
  const folder =
    String(value || "")
      .trim();

  if (
    !folder ||
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


/* =========================================================
   BASE64 / UTF-8
   ========================================================= */


function encodeUtf8(value) {
  return base64urlToStandard(
    base64urlBytes(
      new TextEncoder().encode(
        JSON.stringify(
          value,
          null,
          4
        ) + "\n"
      )
    )
  );
}


function base64url(input) {
  if (
    typeof input === "string"
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


function base64urlBytes(bytes) {
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
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}


function base64urlToStandard(
  value
) {
  return (
    value
      .replace(/-/g, "+")
      .replace(/_/g, "/") +
    "=".repeat(
      (
        4 -
        value.length % 4
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
    atob(standard);

  const bytes =
    Uint8Array.from(
      binary,
      c => c.charCodeAt(0)
    );

  return new TextDecoder()
    .decode(bytes);
}


function decodeBase64Utf8(
  value
) {
  const clean =
    value.replace(
      /\s/g,
      ""
    );

  const binary =
    atob(clean);

  const bytes =
    Uint8Array.from(
      binary,
      c => c.charCodeAt(0)
    );

  return new TextDecoder()
    .decode(bytes);
}
