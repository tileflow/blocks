"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { CheckIcon, CopyIcon, MoonIcon, SunIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useColorScheme } from "@/lib/map-theme"

// The small interactive parts of the gallery pages. Gallery only.

export function CopyButton({ text, label, className }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be refused; the text stays selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className={cn("grid size-8 shrink-0 place-items-center rounded-lg hover:bg-white/10", className)}
    >
      {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
    </button>
  )
}

/** Light and dark for the whole gallery. */
export function SchemeToggle() {
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
          className={cn("grid size-7 place-items-center rounded-full", scheme === value ? "bg-(--site-raised)" : "")}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  )
}

/** File tabs over code blocks. Every file stays in the HTML; only the chosen one shows. */
export function FileTabs({ paths, children }: { paths: string[]; children: React.ReactNode[] }) {
  const [active, setActive] = React.useState(0)
  const id = React.useId()
  if (paths.length < 2) return <>{children}</>

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Files" className="flex flex-wrap gap-1.5">
        {paths.map((path, index) => (
          <button
            key={path}
            id={`${id}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-controls={`${id}-panel-${index}`}
            onClick={() => setActive(index)}
            className={cn(
              "min-h-8 rounded-full border px-3 font-mono text-xs",
              index === active
                ? "border-(--site-fg) bg-(--site-raised) text-(--site-fg)"
                : "border-(--site-rule) text-(--site-fg-secondary) hover:border-(--site-rule-strong)"
            )}
          >
            {path}
          </button>
        ))}
      </div>
      {children.map((child, index) => (
        <div
          key={paths[index]}
          id={`${id}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          hidden={index !== active}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
