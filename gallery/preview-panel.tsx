"use client"

import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { MapThemeProvider, useColorScheme } from "@/lib/map-theme"
import type { CatalogItem } from "@/gallery/catalog"
import { PlaceholderDemo, demos } from "@/gallery/demos"
import { presets, usePreset } from "@/gallery/presets"

// The live preview of an item in the chosen design preset. Gallery only; agents read the
// Markdown page instead, so the whole panel is left out of it.

export function PreviewPanel({ item, status, fullPage }: { item: CatalogItem; status: string; fullPage?: string }) {
  const { preset } = usePreset()
  const Demo = demos[item.name]

  return (
    <section aria-label="Preview" data-markdown-ignore className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PresetPicker />
        {fullPage && (
          <Link
            href={fullPage}
            target="_blank"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-(--site-rule) px-3.5 text-sm font-medium hover:border-(--site-rule-strong)"
          >
            Open full page <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
      <MapThemeProvider value={preset.map}>
        <div
          data-preset={preset.name}
          className="relative h-[34rem] overflow-hidden rounded-3xl border border-(--site-rule) bg-background text-foreground [&>*]:rounded-none [&>*]:border-0"
        >
          {Demo ? (
            <Demo />
          ) : (
            <>
              <PlaceholderDemo />
              <div className="absolute inset-0 z-20 grid place-items-center bg-background/55 p-6">
                <div className="flex max-w-sm flex-col gap-2 rounded-[calc(var(--radius)*2)] border bg-popover p-6 text-popover-foreground shadow-lg">
                  <div className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">{status}</div>
                  <div className="text-xl font-semibold tracking-[-0.01em]">Not built yet</div>
                  <p className="text-sm leading-relaxed text-muted-foreground">This preview shows {item.title.toLowerCase()} once it ships.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </MapThemeProvider>
    </section>
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
              selected ? "border-(--site-fg) bg-(--site-raised)" : "border-(--site-rule) bg-(--site-canvas) hover:border-(--site-rule-strong)"
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
