"use client"

import { useSyncExternalStore } from "react"

export type ColorScheme = "light" | "dark"

/**
 * How much the base map competes with your content.
 * - `default`: full colour, for maps that are the content.
 * - `faded`: softer colour, so markers and panels read first.
 * - `monochrome`: neutral grey, for data colours such as choropleths.
 */
export type MapVariant = "default" | "faded" | "monochrome"

function readColorScheme(): ColorScheme {
  const root = document.documentElement
  // next-themes with attribute="class", the shadcn default.
  if (root.classList.contains("dark")) return "dark"
  if (root.classList.contains("light")) return "light"
  // next-themes with attribute="data-theme", and most other theme switchers.
  const dataTheme = root.dataset.theme
  if (dataTheme === "dark" || dataTheme === "light") return dataTheme
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function subscribeColorScheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme", "style"],
  })
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  media.addEventListener("change", onChange)
  return () => {
    observer.disconnect()
    media.removeEventListener("change", onChange)
  }
}

/** The colour scheme your app shows now. Follows the theme toggle without a reload. */
export function useColorScheme(): ColorScheme {
  return useSyncExternalStore(
    subscribeColorScheme,
    readColorScheme,
    () => "light"
  )
}

/**
 * The Streets theme for a colour scheme and variant. Streets publishes
 * `light`, `dark`, `faded`, `dark-faded`, `monochrome` and `dark-monochrome`.
 */
export function mapTheme(scheme: ColorScheme, variant: MapVariant): string {
  if (variant === "default") return scheme
  return scheme === "dark" ? `dark-${variant}` : variant
}
