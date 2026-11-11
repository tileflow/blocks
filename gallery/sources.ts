import { readFile } from "node:fs/promises"
import path from "node:path"

import registry from "@/registry.json"
import { catalog, findCatalogItem, type CatalogGroup, type CatalogItem } from "@/gallery/catalog"
import { registryOrigin } from "@/gallery/site"

// What the gallery and its Markdown pages say about one item, read from registry.json and the
// files it installs. Gallery only.

export type SourceFile = { path: string; content: string }

export type ItemDetails = {
  group: CatalogGroup
  item: CatalogItem
  /** The registry item's own note, shown after install. */
  docs?: string
  /** npm packages the install adds. */
  dependencies: string[]
  /** The files the install adds, as they are in this repository. */
  files: SourceFile[]
  /** The usage example the preview draws. */
  example?: SourceFile
  uses: { name: string; title?: string; description?: string; inCatalog: boolean }[]
}

const read = (file: string) => readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), file), "utf8")

export async function itemDetails(name: string): Promise<ItemDetails | null> {
  const found = findCatalogItem(name)
  if (!found) return null
  const { group, item } = found
  const entry = item.phase === "built" ? registry.items.find((candidate) => candidate.name === name) : undefined
  const files = entry ? await Promise.all(entry.files.map(async (file) => ({ path: file.path, content: await read(file.path) }))) : []
  const examplePath = `gallery/examples/${name}.tsx`
  const example = entry ? { path: examplePath, content: await read(examplePath) } : undefined

  return {
    group,
    item,
    docs: entry && "docs" in entry ? entry.docs : undefined,
    dependencies: entry && "dependencies" in entry ? (entry.dependencies ?? []) : [],
    files,
    example,
    uses: item.uses.map((use) => {
      const other = findCatalogItem(use)?.item
      return { name: use, title: other?.title, description: other?.description, inCatalog: Boolean(other) }
    }),
  }
}

export const allItems = () => catalog.flatMap((group) => group.items.map((item) => ({ group, item })))

export const registryItemUrl = (name: string) => `${registryOrigin}/${name}.json`
