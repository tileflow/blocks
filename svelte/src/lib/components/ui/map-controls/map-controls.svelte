<script lang="ts">
	import LocateFixedIcon from "@lucide/svelte/icons/locate-fixed"
	import MaximizeIcon from "@lucide/svelte/icons/maximize"
	import MinimizeIcon from "@lucide/svelte/icons/minimize"

	import { cn } from "$lib/utils"
	import { Button } from "$lib/components/ui/button"
	import { useMap } from "$lib/components/ui/map"

	/**
	 * Locate and fullscreen buttons in your button style. Place it inside <Map>.
	 * The map brings its own zoom and compass buttons.
	 */
	let {
		class: className,
		locate = true,
		fullscreen = true,
		onlocate,
	}: {
		class?: string
		locate?: boolean
		fullscreen?: boolean
		/** Called with [lng, lat] after the map flies to the visitor. */
		onlocate?: (position: [number, number]) => void
	} = $props()

	const map = useMap()
	let isFullscreen = $state(false)
	let locating = $state(false)

	$effect(() => {
		const onChange = () => (isFullscreen = document.fullscreenElement !== null)
		document.addEventListener("fullscreenchange", onChange)
		return () => document.removeEventListener("fullscreenchange", onChange)
	})

	function locateVisitor() {
		const current = map.current
		if (!current || !navigator.geolocation) return
		locating = true
		navigator.geolocation.getCurrentPosition(
			({ coords }) => {
				const position: [number, number] = [coords.longitude, coords.latitude]
				current.flyTo({ center: position, zoom: Math.max(current.getZoom(), 13) })
				locating = false
				onlocate?.(position)
			},
			() => (locating = false),
			{ enableHighAccuracy: false, timeout: 10_000 }
		)
	}

	function toggleFullscreen() {
		const container = map.current?.getContainer().closest("[data-slot=map]")
		if (!container) return
		if (document.fullscreenElement) void document.exitFullscreen()
		else void container.requestFullscreen()
	}
</script>

<div data-slot="map-controls" class={cn("absolute right-2.5 bottom-10 z-10 grid gap-1.5", className)}>
	{#if locate}
		<Button
			variant="outline"
			size="icon-sm"
			aria-label="Show my location"
			disabled={!map.current || locating}
			onclick={locateVisitor}
			class="bg-background shadow-sm"
		>
			<LocateFixedIcon class={cn(locating && "animate-pulse")} />
		</Button>
	{/if}
	{#if fullscreen}
		<Button
			variant="outline"
			size="icon-sm"
			aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
			disabled={!map.current}
			onclick={toggleFullscreen}
			class="bg-background shadow-sm"
		>
			{#if isFullscreen}<MinimizeIcon />{:else}<MaximizeIcon />{/if}
		</Button>
	{/if}
</div>
