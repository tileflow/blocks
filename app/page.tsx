import type { Metadata } from "next"

import { defaultItemName } from "@/gallery/catalog"
import { ItemPage } from "@/gallery/item-page"
import { siteOrigin } from "@/gallery/site"

// The gallery opens on the store locator; every item has its page at /items/<name>.
export const metadata: Metadata = {
  alternates: { types: { "text/markdown": `${siteOrigin}/index.md` } },
}

export default function Home() {
  return <ItemPage name={defaultItemName} />
}
