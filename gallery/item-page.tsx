import { readFile } from "node:fs/promises"
import path from "node:path"
import Link from "next/link"
import { notFound } from "next/navigation"

import registry from "@/registry.json"
import { catalog, findCatalogItem, type CatalogItem } from "@/gallery/catalog"
import { ItemView } from "@/gallery/item-view"

// One gallery page: the catalog menu and the item it shows. Gallery only.

const registryOrigin = "https://tileflow.dev/r"

async function sourceFiles(name: string) {
  const entry = registry.items.find((item) => item.name === name)
  if (!entry) return []
  return Promise.all(
    entry.files.map(async (file) => ({
      path: file.path,
      content: await readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), file.path), "utf8"),
    }))
  )
}

export async function ItemPage({ name }: { name: string }) {
  const found = findCatalogItem(name)
  if (!found) notFound()
  const { group, item } = found
  const files = item.phase === "built" ? await sourceFiles(item.name) : []
  const known = new Set(catalog.flatMap((entry) => entry.items.map((candidate) => candidate.name)))

  return (
    <div className="min-h-svh bg-(--site-canvas) text-(--site-fg) font-sans">
      <GalleryHeader />
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-start gap-x-10 px-4 md:px-6">
        <CatalogMenu current={item.name} />
        <main className="min-w-0 flex-[999_1_560px] pt-8 pb-20 md:pt-10">
          <ItemView
            item={item}
            kind={group.kind}
            files={files}
            installUrl={`${registryOrigin}/${item.name}.json`}
            uses={item.uses.map((use) => ({ name: use, inCatalog: known.has(use) }))}
            fullPage={item.name === "store-locator" ? "/store-locator" : undefined}
          />
        </main>
      </div>
    </div>
  )
}

export function itemTitle(name: string) {
  return findCatalogItem(name)?.item.title ?? "Item"
}

function GalleryHeader() {
  return (
    <header className="border-b border-(--site-rule)">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 md:px-6">
        <a href="https://tileflow.dev" aria-label="Tileflow" className="inline-flex h-8 items-start gap-[5px] text-(--site-fg)">
          <span className="self-center text-[22px] leading-none font-bold tracking-[-0.035em]">Tileflow</span>
          {/* The site's own symbol, so the mark always matches tileflow.dev. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://tileflow.dev/brand/site-symbol.svg" alt="" width={16} height={16} className="size-4 dark:invert" />
        </a>
        <span aria-hidden="true" className="text-(--site-fg-muted)">/</span>
        <Link href="/" className="text-[15px] font-medium text-(--site-fg)">
          Blocks
        </Link>
        <span className="ml-1 rounded-full border border-(--site-rule-strong) px-2 py-0.5 font-mono text-[10px] tracking-[0.06em] text-(--site-fg-secondary) uppercase">
          Preview
        </span>
      </div>
    </header>
  )
}

function CatalogMenu({ current }: { current: string }) {
  return (
    <nav aria-label="Catalog" className="flex w-full flex-col gap-7 pt-8 pb-6 md:w-auto md:max-w-68 md:flex-[1_1_240px] md:pb-12">
      {catalog.map((group) => (
        <div key={group.title} className="flex flex-col gap-0.5">
          <h2 className="px-2.5 pb-2 font-mono text-[11px] font-normal tracking-[0.08em] text-(--site-fg-muted) uppercase">
            {group.title}
          </h2>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.name}>
                <MenuLink item={item} active={item.name === current} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function MenuLink({ item, active }: { item: CatalogItem; active: boolean }) {
  return (
    <Link
      href={`/items/${item.name}`}
      aria-current={active ? "page" : undefined}
      className={[
        "flex min-h-9 items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-sm transition-colors hover:bg-(--site-raised)",
        active ? "bg-(--site-raised) font-semibold text-(--site-fg)" : "",
        !active && item.phase === "later" ? "text-(--site-fg-muted)" : "",
      ].join(" ")}
    >
      <span className="flex-1">{item.title}</span>
      {item.phase === "soon" && (
        <span className="rounded-full border border-(--site-rule-strong) bg-(--site-canvas) px-1.5 py-px font-mono text-[10px] tracking-[0.06em] text-(--site-fg-secondary) uppercase">
          Soon
        </span>
      )}
      {item.phase === "later" && (
        <span className="rounded-full bg-(--site-raised) px-1.5 py-px font-mono text-[10px] tracking-[0.06em] text-(--site-fg-muted) uppercase">
          Later
        </span>
      )}
    </Link>
  )
}
