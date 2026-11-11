import { catalog } from "@/gallery/catalog"
import { itemPath, siteOrigin } from "@/gallery/site"
import { stackItemPages } from "@/gallery/stacks"

export const dynamic = "force-static"

// Every item page, and each built item in the other stacks. /llms.txt lists the same pages for agents.
export function GET() {
  const urls = catalog
    .flatMap((group) => group.items)
    .map((item) => itemPath(item.name))
    .concat(stackItemPages(catalog.flatMap((group) => group.items)).map(({ name, stack }) => itemPath(name, stack)))
    .map((path) => `  <url><loc>${siteOrigin}${path}</loc></url>`)
    .join("\n")
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  })
}
