import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronDownIcon, KeyRoundIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { catalog, findCatalogItem, type CatalogItem } from "@/gallery/catalog"
import { CodeBlock } from "@/gallery/code-block"
import { CopyButton, FileTabs, SchemeToggle } from "@/gallery/controls"
import { addsSentence, installCommand, preReleaseFor, setupSentence, sourceSentence, stacksSentence, statusSentence, usageSentence } from "@/gallery/markdown"
import { PreviewPanel } from "@/gallery/preview-panel"
import { itemMarkdownPath, itemPath, registryLive } from "@/gallery/site"
import { itemDetails, type ItemDetails } from "@/gallery/sources"
import type { StackId } from "@/gallery/stacks"

// One gallery page: the catalog menu and the item it shows. The page carries the same content as
// the item's Markdown version (gallery/markdown.ts); parts only people use are marked
// data-markdown-ignore. Gallery only.

const statusLabel = { built: "Preview", soon: "Soon", later: "Later" } as const
const mono = "font-mono text-[11px] tracking-[0.08em] uppercase"
const sectionTitle = "text-xl font-semibold tracking-[-0.01em]"
const prose = "max-w-3xl text-[15px] leading-relaxed text-(--site-fg-secondary)"

export async function ItemPage({ name, stack: stackId }: { name: string; stack?: StackId }) {
  const details = await itemDetails(name, stackId)
  if (!details || (stackId && !details.available)) notFound()
  const { group, item, stack } = details
  const built = item.phase === "built"
  const markdownPath = itemMarkdownPath(item.name, stack.id)

  return (
    <div className="min-h-svh bg-(--site-canvas) text-(--site-fg) font-sans">
      {/* For agents, near the top of every page and outside the navigation. */}
      <p className="sr-only">
        A Markdown version of this page is at <a href={markdownPath}>{markdownPath}</a>, and the index of
        every Tileflow Blocks item is at <a href="/llms.txt">/llms.txt</a>.
      </p>
      <GalleryHeader />
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-start gap-x-10 px-4 md:px-6">
        <CatalogMenu current={item.name} stack={stack.id} />
        <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-10 pt-8 pb-20 md:pt-10">
          <div className="flex max-w-3xl flex-col gap-3.5">
            <div data-markdown-ignore className={cn(mono, "flex items-center gap-2.5 text-xs text-(--site-fg-muted)")}>
              <span>Blocks</span>
              <span aria-hidden="true">/</span>
              <span>{group.kind}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl leading-tight font-semibold tracking-[-0.03em] md:text-[40px]">
                {item.title}
                {!stack.default && <span className="sr-only"> for {stack.label}</span>}
              </h1>
              <span
                data-markdown-ignore
                className={cn(
                  mono,
                  "rounded-full border px-2.5 py-1",
                  built ? "border-(--site-rule-strong) text-(--site-fg)" : "border-(--site-rule) bg-(--site-raised) text-(--site-fg-secondary)"
                )}
              >
                {statusLabel[item.phase]}
              </span>
            </div>
            <p className="text-lg leading-relaxed text-(--site-fg-secondary)">{item.description}</p>
            {item.keyedApi && (
              <p className="flex items-center gap-2 text-sm text-(--site-fg-secondary)">
                <KeyRoundIcon className="size-4" aria-hidden="true" />
                Uses a Tileflow API key for {item.keyedApi}.
              </p>
            )}
            {!built && (
              <p className={prose}>
                <strong className="font-semibold text-(--site-fg)">Status:</strong> {statusSentence(item.phase as "soon" | "later")}
                {item.phase === "soon" && item.why ? ` ${item.why}` : ""}
              </p>
            )}
          </div>

          <PreviewPanel
            item={item}
            status={statusLabel[item.phase]}
            fullPage={item.name === "store-locator" ? "/store-locator" : undefined}
          />

          {built && (
            <section aria-labelledby="install" className="flex flex-col gap-3">
              <h2 id="install" className={sectionTitle}>
                Install
              </h2>
              <StackPicker details={details} />
              <p className={prose}>
                Stack: {stack.label}. {stack.summary}{" "}
                {stacksSentence(details, (other, candidate) => (
                  <Link key={candidate.id} href={`${itemPath(other, candidate.id)}#install`} className="underline underline-offset-3">
                    {candidate.label}
                  </Link>
                ))}
              </p>
              {!registryLive && <p className="text-[13px] text-(--site-fg-muted)">{preReleaseFor(stack)}</p>}
              <p className={prose}>Run this command in the root of your project:</p>
              <Command text={installCommand(stack, item.name)} label="Copy install command" />
              <p className={prose}>{inlineCode(addsSentence(details.files, details.dependencies, stack))}</p>
              {stack.setup && stack.setup.length > 0 && (
                <>
                  <p className={prose}>{setupSentence}</p>
                  {stack.setup.map((step) => (
                    <div key={step.title} className="flex flex-col gap-3 pt-1">
                      <h3 className="text-base font-semibold">{step.title}</h3>
                      <p className={prose}>{step.text}</p>
                      {step.command && <Command text={step.command} label={`Copy the ${step.title} setup command`} />}
                      {step.code && <CodeBlock label={step.code.label} code={step.code.content} maxHeight={false} />}
                    </div>
                  ))}
                </>
              )}
              {stack.requirements && <p className={prose}>Requirements: {stack.requirements}</p>}
              {details.docs && <p className={prose}>{inlineCode(details.docs)}</p>}
            </section>
          )}

          {details.example && (
            <section aria-labelledby="usage" className="flex flex-col gap-3">
              <h2 id="usage" className={sectionTitle}>
                Usage
              </h2>
              <p className={prose}>{usageSentence(stack)}</p>
              <CodeBlock label="Example" code={details.example.content} />
            </section>
          )}

          {built && details.files.length > 0 && (
            <section aria-labelledby="source" className="flex flex-col gap-3">
              <h2 id="source" className={sectionTitle}>
                Source
              </h2>
              <p className={prose}>{sourceSentence(stack)}</p>
              <FileTabs paths={details.files.map((file) => file.path)}>
                {details.files.map((file) => (
                  <CodeBlock key={file.path} label={file.path} code={file.content} />
                ))}
              </FileTabs>
            </section>
          )}

          {details.uses.length > 0 && (
            <section aria-labelledby="uses" className="flex flex-col gap-3">
              <h2 id="uses" className={sectionTitle}>
                {built ? "Built from" : "Will be built from"}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {details.uses.map((use) => (
                  <li key={use.name}>
                    {use.inCatalog ? (
                      <Link
                        href={itemPath(use.name, built ? stack.id : undefined)}
                        className="inline-flex rounded-full border border-(--site-rule) px-3 py-1.5 font-mono text-xs text-(--site-fg-secondary) hover:border-(--site-rule-strong)"
                      >
                        {use.name}
                      </Link>
                    ) : (
                      <span className="inline-flex rounded-full border border-(--site-rule) px-3 py-1.5 font-mono text-xs text-(--site-fg-secondary)">
                        {use.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export function itemTitle(name: string) {
  return findCatalogItem(name)?.item.title ?? "Item"
}

function Command({ text, label }: { text: string; label: string }) {
  return (
    <div className="flex max-w-3xl items-center gap-3 rounded-[14px] border border-(--site-rule) bg-(--site-surface) py-2 pr-2 pl-4.5">
      <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[13px] whitespace-nowrap">{text}</code>
      <CopyButton text={text} label={label} className="size-9 border border-(--site-rule-strong) bg-(--site-canvas) hover:bg-(--site-raised)" />
    </div>
  )
}

/** The stacks of the item: links for the ones it exists in, the rest marked Soon. Same preview in all. */
function StackPicker({ details }: { details: ItemDetails }) {
  return (
    <nav aria-label="Stack" data-markdown-ignore className="flex flex-wrap gap-1.5">
      {details.stacks.map(({ stack, available }) => {
        const current = stack.id === details.stack.id
        const pill = "inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 text-sm"
        return available ? (
          <Link
            key={stack.id}
            href={`${itemPath(details.item.name, stack.id)}#install`}
            scroll={false}
            aria-current={current ? "page" : undefined}
            className={cn(
              pill,
              current
                ? "border-(--site-fg) bg-(--site-raised) font-semibold text-(--site-fg)"
                : "border-(--site-rule) text-(--site-fg-secondary) hover:border-(--site-rule-strong)"
            )}
          >
            {stack.label}
          </Link>
        ) : (
          <span key={stack.id} aria-disabled="true" className={cn(pill, "border-dashed border-(--site-rule) text-(--site-fg-muted)")}>
            {stack.label}
            <span className="font-mono text-[10px] tracking-[0.06em] uppercase">Soon</span>
          </span>
        )
      })}
    </nav>
  )
}

/** Renders `code` spans of a Markdown sentence. */
function inlineCode(sentence: string) {
  return sentence.split(/(`[^`]+`)/).map((part, index) =>
    part.startsWith("`") ? (
      <code key={index} className="rounded-md bg-(--site-raised) px-1.5 py-0.5 font-mono text-[13px] text-(--site-fg)">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    )
  )
}

function GalleryHeader() {
  return (
    <header data-markdown-ignore className="border-b border-(--site-rule)">
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
        <div className="ml-auto">
          <SchemeToggle />
        </div>
      </div>
    </header>
  )
}

function CatalogMenu({ current, stack }: { current: string; stack: StackId }) {
  const groups = (
    <div className="flex flex-col gap-7">
      {catalog.map((group) => (
        <div key={group.title} className="flex flex-col gap-0.5">
          <h2 className="px-2.5 pb-2 font-mono text-[11px] font-normal tracking-[0.08em] text-(--site-fg-muted) uppercase">{group.title}</h2>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.name}>
                <MenuLink item={item} active={item.name === current} stack={stack} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )

  return (
    <nav aria-label="Catalog" data-markdown-ignore className="w-full md:w-auto md:max-w-68 md:flex-[1_1_240px]">
      {/* Phones: the catalog folds away so the item comes first. */}
      <details className="group pt-4 md:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-[12px] border border-(--site-rule) px-3.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span>
            <span className="text-(--site-fg-muted)">Catalog · </span>
            {findCatalogItem(current)?.item.title}
          </span>
          <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="pt-5 pb-2">{groups}</div>
      </details>
      <div className="hidden pt-8 pb-12 md:block">{groups}</div>
    </nav>
  )
}

function MenuLink({ item, active, stack }: { item: CatalogItem; active: boolean; stack: StackId }) {
  return (
    <Link
      // Built items keep the chosen stack; the others have one page.
      href={itemPath(item.name, item.phase === "built" ? stack : undefined)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-9 items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-sm transition-colors hover:bg-(--site-raised)",
        active && "bg-(--site-raised) font-semibold text-(--site-fg)",
        !active && item.phase === "later" && "text-(--site-fg-muted)"
      )}
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
