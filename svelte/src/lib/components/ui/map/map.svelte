<script lang="ts" module>
	import type { LngLatBoundsLike, Map as MapLibreMap } from "maplibre-gl"
	import { getContext } from "svelte"

	import { cn } from "$lib/utils"

	const mapKey = Symbol("map")

	/** The loaded MapLibre map, or null until it loads. Call it in components inside <Map>. */
	export function useMap(): { readonly current: MapLibreMap | null } {
		return getContext<{ readonly current: MapLibreMap | null } | undefined>(mapKey) ?? { current: null }
	}

	/** Bounds around [lng, lat] positions, for map.fitBounds(). */
	export function boundsOf(positions: readonly (readonly [number, number])[]) {
		if (positions.length === 0) return undefined
		let [west, south] = positions[0]
		let [east, north] = positions[0]
		for (const [lng, lat] of positions) {
			west = Math.min(west, lng)
			east = Math.max(east, lng)
			south = Math.min(south, lat)
			north = Math.max(north, lat)
		}
		return [
			[west, south],
			[east, north],
		] satisfies LngLatBoundsLike
	}

	// Your design tokens, applied to what the map draws in the DOM. MapLibre's own
	// stylesheet is unlayered, so its rules need `!` to beat Tailwind utilities.
	const mapChrome = cn(
	"relative isolate h-full min-h-64 w-full overflow-hidden bg-muted font-sans",
	// Popups, tooltips, markers and clusters read these variables.
	"[--tileflow-interaction-surface:var(--popover)]",
	"[--tileflow-interaction-foreground:var(--popover-foreground)]",
	"[--tileflow-interaction-border-color:var(--border)]",
	"[--tileflow-interaction-border-radius:var(--radius)]",
	"[--tileflow-interaction-marker-color:var(--primary)]",
	"[--tileflow-interaction-cluster-color:var(--primary)]",
	"[--tileflow-interaction-shadow:0_4px_16px_oklch(0_0_0/0.14)]",
	// Markers and clusters share some variables with popups; give them their own values.
	"[&_.tileflow-interaction-marker]:[--tileflow-interaction-foreground:var(--primary-foreground)]",
	"[&_.tileflow-interaction-marker]:[--tileflow-interaction-border-color:var(--background)]",
	"[&_.tileflow-interaction-marker]:[--tileflow-interaction-border-radius:9999px]",
	"[&_.tileflow-interaction-cluster]:[--tileflow-interaction-foreground:var(--primary-foreground)]",
	"[&_.tileflow-interaction-cluster]:[--tileflow-interaction-border-color:var(--background)]",
	"[&_.tileflow-interaction-cluster]:text-xs [&_.tileflow-interaction-cluster]:font-medium",
	"[&_.tileflow-interaction-cluster:focus-visible]:outline-2 [&_.tileflow-interaction-cluster:focus-visible]:outline-ring",
	"[&_.tileflow-interaction-marker:focus-visible]:outline-2 [&_.tileflow-interaction-marker:focus-visible]:outline-ring",
	// Popup content brings its own surface, padding and shape.
	"[&_.maplibregl-popup-content]:bg-transparent! [&_.maplibregl-popup-content]:p-0! [&_.maplibregl-popup-content]:shadow-none!",
	"[&_.maplibregl-popup-tip]:hidden!",
	"[&_.tileflow-interaction-popup]:p-0! [&_.tileflow-interaction-tooltip]:px-2! [&_.tileflow-interaction-tooltip]:py-1! [&_.tileflow-interaction-tooltip]:text-xs",
	// The popup's own close button: it carries the label and takes focus on open.
	"[&_.tileflow-interaction-popup-close]:absolute [&_.tileflow-interaction-popup-close]:top-2 [&_.tileflow-interaction-popup-close]:right-2 [&_.tileflow-interaction-popup-close]:z-10",
	"[&_.tileflow-interaction-popup-close]:grid [&_.tileflow-interaction-popup-close]:size-6 [&_.tileflow-interaction-popup-close]:place-items-center [&_.tileflow-interaction-popup-close]:rounded-md",
	"[&_.tileflow-interaction-popup-close]:text-[0px] [&_.tileflow-interaction-popup-close]:text-muted-foreground! [&_.tileflow-interaction-popup-close]:after:text-sm [&_.tileflow-interaction-popup-close]:after:content-['✕']",
	"[&_.tileflow-interaction-popup-close:hover]:bg-muted! [&_.tileflow-interaction-popup-close:hover]:text-foreground! [&_.tileflow-interaction-popup-close:focus-visible]:outline-2 [&_.tileflow-interaction-popup-close:focus-visible]:outline-ring",
	// Zoom and compass buttons.
	"[&_.maplibregl-ctrl-group]:overflow-hidden [&_.maplibregl-ctrl-group]:rounded-md! [&_.maplibregl-ctrl-group]:border [&_.maplibregl-ctrl-group]:border-border [&_.maplibregl-ctrl-group]:bg-background! [&_.maplibregl-ctrl-group]:shadow-sm!",
	"[&_.maplibregl-ctrl-group_button+button]:border-border! [&_.maplibregl-ctrl-group_button:hover]:bg-accent!",
	"dark:[&_.maplibregl-ctrl-group_.maplibregl-ctrl-icon]:invert",
	// Attribution is required: restyle it, never hide it.
	"[&_.maplibregl-ctrl-attrib]:rounded-md! [&_.maplibregl-ctrl-attrib]:bg-background/80! [&_.maplibregl-ctrl-attrib]:text-[11px] [&_.maplibregl-ctrl-attrib]:text-muted-foreground [&_.maplibregl-ctrl-attrib]:backdrop-blur",
	"[&_.maplibregl-ctrl-attrib_a]:text-muted-foreground! dark:[&_.maplibregl-ctrl-attrib-button]:invert"
	)
</script>

<script lang="ts" generics="TAnnotation extends TileflowAnnotation = TileflowAnnotation">
	import "maplibre-gl/dist/maplibre-gl.css"
	import type { Snippet } from "svelte"
	import { setContext } from "svelte"
	import type { TileflowAnnotation } from "@tileflow/interactions"
	import { configureTileflowMapLibre, TileflowMap, type TileflowMapProps } from "@tileflow/svelte"

	import { colorScheme, getMapThemeSettings, mapTheme, type MapVariant } from "$lib/map-theme.svelte"

	// The bundler copies the worker of the installed maplibre-gl next to your app.
	if (typeof window !== "undefined") {
		configureTileflowMapLibre({
			workerUrl: new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href,
		})
	}

	type InteractiveProps = Extract<TileflowMapProps<TAnnotation>, { mode?: "interactive" }>

	type Props = Omit<InteractiveProps, "source" | "theme" | "height" | "mode" | "className"> & {
		/** A map from tileflow.config.ts. Defaults to "app". */
		map?: string
		/** Where the prepared map is served. The Vite plugin and `tileflow build` serve it at the default. */
		manifestUrl?: string
		/** How much the base map competes with your content. */
		variant?: MapVariant
		/** A Streets theme name. Overrides the theme that follows your app and setMapTheme(). */
		theme?: string
		class?: string
		/** Controls, legends and panels drawn over the map. They can call useMap(). */
		children?: Snippet
		/** Called with the MapLibre map once it has loaded. */
		onload?: (map: MapLibreMap) => void
	}

	let {
		map = "app",
		manifestUrl = "/tileflow/manifest.json",
		variant = "default",
		theme,
		class: className,
		children,
		onload,
		...rest
	}: Props = $props()

	const settings = getMapThemeSettings()
	let instance = $state<MapLibreMap | null>(null)
	setContext(mapKey, {
		get current() {
			return instance
		},
	})

	const resolvedTheme = $derived(theme ?? mapTheme(colorScheme.current, variant, settings()))
</script>

<!--
	Tileflow map that follows your app: light or dark with your theme toggle,
	and popups, markers, clusters and attribution in your design tokens.
-->
<div data-slot="map" class={cn(mapChrome, className)}>
	<TileflowMap
		{...(rest as InteractiveProps)}
		source={{ map, manifestUrl }}
		theme={resolvedTheme}
		themeTransition={{ duration: 300 }}
		height="100%"
		className="h-full w-full"
		on:load={(event) => {
			instance = event.detail
			onload?.(event.detail)
		}}
	/>
	{@render children?.()}
</div>
