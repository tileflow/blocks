import { getContext, setContext } from "svelte"
import { createSubscriber } from "svelte/reactivity"

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
	// mode-watcher and most theme switchers set a `dark` class on <html>.
	if (root.classList.contains("dark")) return "dark"
	if (root.classList.contains("light")) return "light"
	const dataTheme = root.dataset.theme
	if (dataTheme === "dark" || dataTheme === "light") return dataTheme
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

const subscribe = createSubscriber((update) => {
	const observer = new MutationObserver(update)
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class", "data-theme", "style"],
	})
	const media = window.matchMedia("(prefers-color-scheme: dark)")
	media.addEventListener("change", update)
	return () => {
		observer.disconnect()
		media.removeEventListener("change", update)
	}
})

/** The colour scheme your app shows now. Follows the theme toggle without a reload. */
export const colorScheme = {
	get current(): ColorScheme {
		if (typeof document === "undefined") return "light"
		subscribe()
		return readColorScheme()
	},
}

/**
 * How every map below setMapTheme() looks, for apps with more than one design theme.
 * - `light`: the light-mode base, `light` or the warmer `dawn`.
 * - `dark`: the dark-mode base, `dark` or the warmer `dusk`.
 * - `variant`: replaces the variant each map asks for.
 */
export type MapThemeSettings = {
	light?: "light" | "dawn"
	dark?: "dark" | "dusk"
	variant?: MapVariant
}

const key = Symbol("map-theme")

/** Sets the map theme for every <Map> below this component: `setMapTheme(() => ({ light: "dawn" }))`. */
export function setMapTheme(settings: () => MapThemeSettings) {
	setContext(key, settings)
}

/** The settings from the nearest setMapTheme(), or none. Call it while a component initialises. */
export function getMapThemeSettings(): () => MapThemeSettings {
	return getContext<(() => MapThemeSettings) | undefined>(key) ?? (() => ({}))
}

/**
 * The Streets theme for a colour scheme and variant. Streets publishes `light`, `dark`, `dawn`
 * and `dusk`, each plain, `-faded` and `-monochrome` (the light ones are `faded` and `monochrome`).
 */
export function mapTheme(scheme: ColorScheme, variant: MapVariant, settings: MapThemeSettings = {}): string {
	const base = scheme === "dark" ? (settings.dark ?? "dark") : (settings.light ?? "light")
	const resolved = settings.variant ?? variant
	if (resolved === "default") return base
	return base === "light" ? resolved : `${base}-${resolved}`
}
