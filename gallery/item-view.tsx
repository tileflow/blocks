"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { CheckIcon, CopyIcon, ExternalLinkIcon, KeyRoundIcon, MoonIcon, SunIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { MapThemeProvider, useColorScheme } from "@/lib/map-theme"
import type { CatalogItem } from "@/gallery/catalog"
import { PlaceholderDemo, demos } from "@/gallery/demos"
import { presets, usePreset } from "@/gallery/presets"

const statusLabel = { built: "Preview", soon: "Soon", later: "Later" } as const

const mono = "font-mono text-[11px] tracking-[0.08em] uppercase"

export function ItemView({
  item,
  kind,
  files,
  installUrl,
  uses,
  fullPage,
}: {
  item: CatalogItem
  kind: string
  files: { path: string; content: string }[]
  installUrl: string
  uses: { name: string; inCatalog: boolean }[]
  fullPage?: string
}) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview")
  const built = item.phase === "built"

  return (
    <div className="flex flex-col gap-7">
      <div className="flex max-w-3xl flex-col gap-3.5">
        <div className={cn(mono, "flex items-center gap-2.5 text-xs text-(--site-fg-muted)")}>
          <span>Blocks</span>
          <span aria-hidden="true">/</span>
          <span>{kind}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl leading-tight font-semibold tracking-[-0.03em] md:text-[40px]">{item.title}</h1>
          <span
            className={cn(
              mono,
              "rounded-full border px-2.5 py-1",
              built
                ? "border-(--site-rule-strong) text-(--site-fg)"
                : "border-(--site-rule) bg-(--site-raised) text-(--site-fg-secondary)"
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
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="View" className="flex gap-1 rounded-full bg-(--site-raised) p-1">
          {(["preview", "code"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              disabled={value === "code" && !built}
              onClick={() => setTab(value)}
              className={cn(
                "min-h-9 rounded-full px-4 text-sm font-medium capitalize disabled:opacity-50",
                tab === value
                  ? "bg-(--site-canvas) text-(--site-fg) shadow-sm"
                  : "text-(--site-fg-secondary)"
              )}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PresetPicker />
          <SchemeToggle />
          {fullPage && (
            <Link
              href={fullPage}
              target="_blank"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-(--site-rule) px-3.5 text-sm font-medium"
            >
              Full page <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      {tab === "preview" || !built ? <Preview item={item} /> : <Code files={files} />}

      <section aria-labelledby="install" className="flex flex-col gap-3">
        <h2 id="install" className="text-xl font-semibold tracking-[-0.01em]">
          Install
        </h2>
        <InstallCommand command={`npx shadcn@latest add ${installUrl}`} />
        {!built && <p className="text-[13px] text-(--site-fg-muted)">The command works once this item ships.</p>}
      </section>

      <section aria-labelledby="uses" className="flex flex-col gap-3">
        <h2 id="uses" className="text-xl font-semibold tracking-[-0.01em]">
          Built from
        </h2>
        <ul className="flex flex-wrap gap-2">
          {uses.map((use) => (
            <li key={use.name}>
              {use.inCatalog ? (
                <Link
                  href={`/items/${use.name}`}
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
    </div>
  )
}

function Preview({ item }: { item: CatalogItem }) {
  const { preset } = usePreset()
  const Demo = demos[item.name]

  return (
    <MapThemeProvider value={preset.map}>
      <div
        data-preset={preset.name}
        className="relative h-[34rem] overflow-hidden rounded-3xl border border-(--site-rule) bg-background text-foreground"
      >
        {Demo ? (
          <Demo />
        ) : (
          <>
            <PlaceholderDemo />
            <div className="absolute inset-0 z-20 grid place-items-center bg-background/55 p-6">
              <div className="flex max-w-md flex-col gap-2.5 rounded-[calc(var(--radius)*2)] border bg-popover p-6 text-popover-foreground shadow-lg">
                <div className={cn(mono, "text-muted-foreground")}>{statusLabel[item.phase]}</div>
                <div className="text-xl font-semibold tracking-[-0.01em]">{item.title} is not built yet</div>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.why}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </MapThemeProvider>
  )
}

function Code({ files }: { files: { path: string; content: string }[] }) {
  const [active, setActive] = React.useState(0)
  const file = files[active]
  if (!file) return null

  return (
    <div className="overflow-hidden rounded-3xl border border-(--site-code-rule) bg-(--site-code) text-(--site-code-fg)">
      <div role="tablist" aria-label="Files" className="flex gap-1 overflow-x-auto border-b border-(--site-code-rule) px-3 py-2">
        {files.map((candidate, index) => (
          <button
            key={candidate.path}
            type="button"
            role="tab"
            aria-selected={index === active}
            onClick={() => setActive(index)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 font-mono text-xs",
              index === active ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
            )}
          >
            {candidate.path}
          </button>
        ))}
      </div>
      <pre className="max-h-[34rem] overflow-auto p-5 font-mono text-[13px] leading-relaxed">
        <code>{file.content}</code>
      </pre>
    </div>
  )
}

function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = React.useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be refused; the command stays selectable.
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-(--site-rule) bg-(--site-surface) py-3 pr-3 pl-4.5">
      <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[13px] whitespace-nowrap">{command}</code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy install command"}
        className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-(--site-rule-strong) bg-(--site-canvas)"
      >
        {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      </button>
    </div>
  )
}

function PresetPicker() {
  const { preset: current, setPreset } = usePreset()
  const scheme = useColorScheme()

  return (
    <div role="group" aria-label="App theme" className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[13px] text-(--site-fg-muted)">Your app theme</span>
      {presets.map((preset) => {
        const [primary, land] = preset.swatch[scheme]
        const selected = preset.name === current.name
        return (
          <button
            key={preset.name}
            type="button"
            aria-pressed={selected}
            onClick={() => setPreset(preset.name)}
            className={cn(
              "flex min-h-9 items-center gap-2 rounded-full border py-0 pr-3.5 pl-2 text-[13px] font-medium",
              selected
                ? "border-(--site-fg) bg-(--site-raised)"
                : "border-(--site-rule) bg-(--site-canvas)"
            )}
          >
            <span aria-hidden="true" className="flex size-5 overflow-hidden rounded-full border border-(--site-rule)">
              <span className="flex-1" style={{ background: primary }} />
              <span className="flex-1" style={{ background: land }} />
            </span>
            {preset.label}
          </button>
        )
      })}
    </div>
  )
}

function SchemeToggle() {
  const { setTheme } = useTheme()
  const scheme = useColorScheme()

  return (
    <div role="group" aria-label="Colour scheme" className="flex gap-1 rounded-full border border-(--site-rule) p-1">
      {(
        [
          ["light", "Light", SunIcon],
          ["dark", "Dark", MoonIcon],
        ] as const
      ).map(([value, label, Icon]) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={scheme === value}
          onClick={() => setTheme(value)}
          className={cn(
            "grid size-8 place-items-center rounded-full",
            scheme === value ? "bg-(--site-raised)" : ""
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  )
}
