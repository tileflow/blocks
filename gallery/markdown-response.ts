// Markdown and llms.txt responses. In the static preview the files are served as assets and
// preview/worker.ts sets these headers; `pnpm dev` uses them as they are.
export function markdownResponse(body: string, type = "text/markdown") {
  return new Response(body, {
    headers: { "content-type": `${type}; charset=utf-8`, "cache-control": "public, max-age=0, must-revalidate" },
  })
}
