import type { Metadata } from "next"

import { catalog } from "@/gallery/catalog"
import { ItemPage, itemTitle } from "@/gallery/item-page"

type Params = { params: Promise<{ name: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return catalog.flatMap((group) => group.items.map((item) => ({ name: item.name })))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { name } = await params
  return { title: `${itemTitle(name)} · Tileflow Blocks` }
}

export default async function Page({ params }: Params) {
  const { name } = await params
  return <ItemPage name={name} />
}
