// The colour scheme the page shows, and the Streets theme for it. The same rules as the React and
// Svelte map themes, without a framework.

export type ColorScheme = "light" | "dark"

/**
 * How much the base map competes with your content.
 * - `default`: full colour, for maps that are the content.
 * - `faded`: softer colour, so markers and panels read first.
 * - `monochrome`: neutral grey, for data colours such as choropleths.
 */
export type MapVariant = "default" | "faded" | "monochrome"

export type MapThemeSettings = {
  light?: "light" | "dawn"
  dark?: "dark" | "dusk"
}

export function readColorScheme(): ColorScheme {
  const root = document.documentElement
  // A dark or light class, as shadcn theme switchers and Tailwind set it.
  if (root.classList.contains("dark")) return "dark"
  if (root.classList.contains("light")) return "light"
  // A data-theme attribute, as most other theme switchers set it.
  const dataTheme = root.dataset.theme
  if (dataTheme === "dark" || dataTheme === "light") return dataTheme
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

const listeners = new Set<() => void>()
let stop: (() => void) | null = null

/** Calls `onChange` whenever the page's colour scheme may have changed. Returns the unsubscribe. */
export function subscribeColorScheme(onChange: () => void): () => void {
  listeners.add(onChange)
  if (!stop) {
    const notify = () => listeners.forEach((listener) => listener())
    const observer = new MutationObserver(notify)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] })
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    media.addEventListener("change", notify)
    stop = () => {
      observer.disconnect()
      media.removeEventListener("change", notify)
    }
  }
  return () => {
    listeners.delete(onChange)
    if (listeners.size === 0) {
      stop?.()
      stop = null
    }
  }
}

/**
 * The Streets theme for a colour scheme and variant. Streets publishes `light`, `dark`, `dawn`
 * and `dusk`, each plain, `-faded` and `-monochrome` (the light ones are `faded` and `monochrome`).
 */
export function mapTheme(scheme: ColorScheme, variant: MapVariant, settings: MapThemeSettings = {}): string {
  const base = scheme === "dark" ? (settings.dark ?? "dark") : (settings.light ?? "light")
  if (variant === "default") return base
  return base === "light" ? variant : `${base}-${variant}`
}
