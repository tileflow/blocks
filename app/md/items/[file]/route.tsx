import { notFound } from "next/navigation"

import { catalog } from "@/gallery/catalog"
import { itemMarkdown } from "@/gallery/markdown"
import { markdownResponse } from "@/gallery/markdown-response"

// Each item's Markdown page. Readers ask for /items/<name>.md: next.config.ts rewrites that here
// in development, and preview/worker.ts does it in the static preview.

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return catalog.flatMap((group) => group.items.map((item) => ({ file: `${item.name}.md` })))
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const markdown = file.endsWith(".md") ? await itemMarkdown(file.slice(0, -3)) : null
  if (!markdown) notFound()
  return markdownResponse(markdown)
}
