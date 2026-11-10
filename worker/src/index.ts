// Registry items are public JSON. Any origin may read them; nothing else is served.
const ITEM =
  /^\/r\/(?:v\/\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?\/)?[a-z0-9-]+\.json$/
const PINNED = /^\/r\/v\//

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, HEAD, OPTIONS",
}

function notFound(path: string) {
  return Response.json(
    { error: "not_found", message: `No registry item at ${path}.` },
    { status: 404, headers: { ...cors, "cache-control": "public, max-age=60" } }
  )
}

type Env = { ASSETS: Fetcher }

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers: cors })
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response(null, {
        status: 405,
        headers: { ...cors, allow: "GET, HEAD, OPTIONS" },
      })
    }
    if (!ITEM.test(url.pathname)) return notFound(url.pathname)

    const asset = await env.ASSETS.fetch(
      new Request(new URL(url.pathname, url.origin), request)
    )
    if (!asset.ok) return notFound(url.pathname)

    const headers = new Headers(asset.headers)
    for (const [name, value] of Object.entries(cors)) headers.set(name, value)
    headers.set("content-type", "application/json; charset=utf-8")
    headers.set("x-content-type-options", "nosniff")
    headers.set(
      "cache-control",
      PINNED.test(url.pathname)
        ? "public, max-age=31536000, immutable"
        : "public, max-age=300, stale-while-revalidate=86400"
    )
    return new Response(asset.body, { status: 200, headers })
  },
}

export default worker
