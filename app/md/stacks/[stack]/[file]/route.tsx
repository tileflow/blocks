import { notFound } from "next/navigation"

import { catalog } from "@/gallery/catalog"
import { itemMarkdown } from "@/gallery/markdown"
import { markdownResponse } from "@/gallery/markdown-response"
import { findStack, liveStacks } from "@/gallery/stacks"

// The Markdown page of an item in a stack other than the default one. Readers ask for
// /items/<name>/<stack>.md: next.config.ts rewrites that here in development, and
// preview/worker.ts does it in the static preview.

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return liveStacks
    .filter((stack) => !stack.default)
    .flatMap((stack) =>
      catalog.flatMap((group) => group.items.filter((item) => item.phase === "built").map((item) => ({ stack: stack.id, file: `${item.name}.md` })))
    )
}

export async function GET(_request: Request, { params }: { params: Promise<{ stack: string; file: string }> }) {
  const { stack: id, file } = await params
  const stack = findStack(id)
  const markdown = stack && file.endsWith(".md") ? await itemMarkdown(file.slice(0, -3), stack.id) : null
  if (!markdown) notFound()
  return markdownResponse(markdown)
}
