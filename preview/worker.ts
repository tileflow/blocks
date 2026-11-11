// Serves the static gallery from `pnpm preview:build`, adding the Markdown versions for agents:
// /items/<name>.md, /items/<name>/<stack>.md, and any page asked for with `Accept: text/markdown`. next.config.ts does the
// same in development.

type Env = { ASSETS: Fetcher }

// /items/<name> is the default stack, /items/<name>/<stack> the others.
const page = /^\/items\/([a-z0-9-]+)(?:\/([a-z]+))?\/?$/
const markdownFile = /^\/items\/([a-z0-9-]+)(?:\/([a-z]+))?\.md$/

const itemAsset = ([, name, stack]: RegExpMatchArray) => (stack ? `/md/stacks/${stack}/${name}.md` : `/md/items/${name}.md`)

/** True when the request ranks Markdown at least as high as HTML. */
function prefersMarkdown(accept: string | null) {
  if (!accept) return false
  const weights = new Map<string, number>()
  for (const part of accept.split(",")) {
    const [type, ...parameters] = part.trim().toLowerCase().split(";")
    const q = parameters.map((parameter) => parameter.trim()).find((parameter) => parameter.startsWith("q="))
    weights.set(type.trim(), q ? Number(q.slice(2)) || 0 : 1)
  }
  const markdown = weights.get("text/markdown") ?? 0
  return markdown > 0 && markdown >= (weights.get("text/html") ?? 0)
}

function markdownAsset(pathname: string, accept: string | null): string | null {
  const file = pathname.match(markdownFile)
  if (file) return itemAsset(file)
  if (pathname === "/index.md") return pathname
  if (!prefersMarkdown(accept)) return null
  if (pathname === "/") return "/index.md"
  const item = pathname.match(page)
  return item ? itemAsset(item) : null
}

const markdownAlternate = (pathname: string) => {
  if (pathname === "/") return "/index.md"
  const item = pathname.match(page)
  return item ? `${item[0].replace(/\/$/, "")}.md` : null
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method !== "GET" && request.method !== "HEAD") return env.ASSETS.fetch(request)

    const asset = markdownAsset(url.pathname, request.headers.get("accept"))
    if (asset) {
      const response = await env.ASSETS.fetch(new Request(new URL(asset, url.origin), request))
      if (!response.ok) return response
      const headers = new Headers(response.headers)
      headers.set("content-type", "text/markdown; charset=utf-8")
      headers.set("vary", "Accept")
      headers.set("x-robots-tag", "noindex, nofollow")
      return new Response(response.body, { status: 200, headers })
    }

    const response = await env.ASSETS.fetch(request)
    const alternate = markdownAlternate(url.pathname)
    const headers = new Headers(response.headers)
    if (alternate && response.ok) {
      headers.append("link", `<${alternate}>; rel="alternate"; type="text/markdown"`)
      headers.set("vary", "Accept")
    }
    if (url.pathname.endsWith(".txt")) headers.set("content-type", "text/plain; charset=utf-8")
    // The preview is for the team only; public/_headers says the same for plain assets.
    headers.set("x-robots-tag", "noindex, nofollow")
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
  },
}

export default worker
