import { readFile } from "node:fs/promises"
import path from "node:path"

import { catalog, findCatalogItem, type CatalogGroup, type CatalogItem } from "@/gallery/catalog"
import { findStack, stackHasItem, stacks, type Stack, type StackId } from "@/gallery/stacks"

// What the gallery and its Markdown pages say about one item in one stack, read from that stack's
// registry.json and the files it installs. Gallery only.

export type SourceFile = { path: string; content: string; language: string }

export type ItemDetails = {
  group: CatalogGroup
  item: CatalogItem
  stack: Stack
  /** False when the item is built but not offered in this stack yet. */
  available: boolean
  /** The registry item's own note, shown after install. */
  docs?: string
  /** npm packages the install adds. */
  dependencies: string[]
  /** The files the install adds, as they are in this repository. */
  files: SourceFile[]
  /** The usage example the preview draws (React) or that renders the same (other stacks). */
  example?: SourceFile
  uses: { name: string; title?: string; description?: string; inCatalog: boolean }[]
  /** Every stack, and whether the item exists there. */
  stacks: { stack: Stack; available: boolean }[]
}

type RegistryItem = { name: string; files: { path: string }[]; dependencies?: string[]; docs?: string }

const read = (file: string) => readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), file), "utf8")

const languages: Record<string, string> = { ".tsx": "tsx", ".ts": "ts", ".svelte": "svelte", ".json": "json", ".css": "css" }
const languageOf = (file: string) => languages[path.extname(file)] ?? ""

const registries = new Map<string, Promise<RegistryItem[]>>()
function registryItems(stack: Stack) {
  if (!stack.registry) return Promise.resolve([])
  let items = registries.get(stack.registry)
  if (!items) {
    items = read(stack.registry).then((text) => (JSON.parse(text) as { items: RegistryItem[] }).items)
    registries.set(stack.registry, items)
  }
  return items
}

export async function itemDetails(name: string, stackId?: StackId): Promise<ItemDetails | null> {
  const found = findCatalogItem(name)
  const stack = findStack(stackId)
  if (!found || !stack) return null
  const { group, item } = found
  const built = item.phase === "built"
  const available = stackHasItem(stack, built)
  const entry = available ? (await registryItems(stack)).find((candidate) => candidate.name === name) : undefined
  const files = entry
    ? await Promise.all(
        // Registry paths are relative to the folder of the stack's registry.json.
        entry.files.map(async (file) => ({
          path: file.path,
          content: await read(path.join(path.dirname(stack.registry ?? ""), file.path)),
          language: languageOf(file.path),
        }))
      )
    : []
  const examplePath = stack.examples && `${stack.examples.folder}/${name}.${stack.examples.extension}`
  const example =
    entry && examplePath ? { path: examplePath, content: await read(examplePath), language: stack.examples?.language ?? "" } : undefined

  return {
    group,
    item,
    stack,
    available: Boolean(entry),
    // The CLI prints the note as plain text; in Markdown its tags would read as HTML, so they become code.
    docs: entry?.docs?.replace(/<[^<>]+>/g, (tag) => `\`${tag}\``),
    dependencies: entry?.dependencies ?? [],
    files,
    example,
    uses: item.uses.map((use) => {
      const other = findCatalogItem(use)?.item
      return { name: use, title: other?.title, description: other?.description, inCatalog: Boolean(other) }
    }),
    stacks: stacks.map((candidate) => ({ stack: candidate, available: stackHasItem(candidate, built) })),
  }
}

export const allItems = () => catalog.flatMap((group) => group.items.map((item) => ({ group, item })))
