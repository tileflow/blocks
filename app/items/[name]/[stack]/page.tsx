import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { catalog } from "@/gallery/catalog"
import { ItemPage, itemTitle } from "@/gallery/item-page"
import { itemMarkdownPath, siteOrigin } from "@/gallery/site"
import { findStack, liveStacks } from "@/gallery/stacks"

// A built item in a stack other than the default one: /items/<name>/<stack>. Same preview, that
// stack's install, setup, example and source.

type Params = { params: Promise<{ name: string; stack: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return liveStacks
    .filter((stack) => !stack.default)
    .flatMap((stack) =>
      catalog.flatMap((group) => group.items.filter((item) => item.phase === "built").map((item) => ({ name: item.name, stack: stack.id })))
    )
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { name, stack: id } = await params
  const stack = findStack(id)
  if (!stack) notFound()
  return {
    title: `${itemTitle(name)} for ${stack.label} · Tileflow Blocks`,
    alternates: { types: { "text/markdown": `${siteOrigin}${itemMarkdownPath(name, stack.id)}` } },
  }
}

export default async function Page({ params }: Params) {
  const { name, stack: id } = await params
  const stack = findStack(id)
  if (!stack) notFound()
  return <ItemPage name={name} stack={stack.id} />
}
