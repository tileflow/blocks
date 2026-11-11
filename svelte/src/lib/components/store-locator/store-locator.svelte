<script lang="ts">
	import type { Map as MapLibreMap } from "maplibre-gl"
	import type { TileflowAnnotation, TileflowInteractionState } from "@tileflow/interactions"
	import MapPinIcon from "@lucide/svelte/icons/map-pin"
	import NavigationIcon from "@lucide/svelte/icons/navigation"
	import SearchIcon from "@lucide/svelte/icons/search"
	import StoreIcon from "@lucide/svelte/icons/store"

	import { cn } from "$lib/utils"
	import { Badge } from "$lib/components/ui/badge"
	import { Button, buttonVariants } from "$lib/components/ui/button"
	import { Input } from "$lib/components/ui/input"
	import { Map, boundsOf } from "$lib/components/ui/map"
	import { MapControls } from "$lib/components/ui/map-controls"
	import { MapPin } from "$lib/components/ui/map-marker"
	import {
		MapPopup,
		MapPopupDescription,
		MapPopupFooter,
		MapPopupHeader,
		MapPopupTitle,
	} from "$lib/components/ui/map-popup"
	import type { Store, StoreCategory } from "./stores"

	type StoreAnnotation = TileflowAnnotation & { data: { id: string } }

	let { stores, categories, class: className }: { stores: Store[]; categories: StoreCategory[]; class?: string } =
		$props()

	const fold = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

	function kilometres(from: [number, number], to: [number, number]) {
		const rad = Math.PI / 180
		const dLat = (to[1] - from[1]) * rad
		const dLng = (to[0] - from[0]) * rad
		const a = Math.sin(dLat / 2) ** 2 + Math.cos(from[1] * rad) * Math.cos(to[1] * rad) * Math.sin(dLng / 2) ** 2
		return 12_742 * Math.asin(Math.sqrt(a))
	}

	let query = $state("")
	let category = $state<StoreCategory | null>(null)
	let origin = $state<[number, number] | null>(null)
	let hoveredId = $state<string | null>(null)
	let interaction = $state<TileflowInteractionState>({ popup: null })
	let map = $state<MapLibreMap | null>(null)
	let list = $state<HTMLUListElement>()

	const selectedId = $derived(interaction.popup?.kind === "annotation" ? interaction.popup.id : null)

	const visible = $derived.by(() => {
		const needle = fold(query.trim())
		const matches = stores.filter(
			(store) =>
				(!category || store.category === category) &&
				fold(`${store.name} ${store.address} ${store.city}`).includes(needle)
		)
		if (!origin) return matches
		const from = origin
		return [...matches].sort((a, b) => kilometres(from, a.coordinates) - kilometres(from, b.coordinates))
	})

	const annotations = $derived<StoreAnnotation[]>(
		visible.map((store) => ({
			kind: "marker",
			id: store.id,
			coordinate: store.coordinates,
			ariaLabel: `${store.name}, ${store.address}`,
			data: { id: store.id },
			// The popup snippet draws this view; without it the marker opens nothing.
			popup: { content: { kind: "view", name: "store" } },
		}))
	)

	// Frame the visible stores whenever the filter changes.
	$effect(() => {
		const bounds = boundsOf(visible.map((store) => store.coordinates))
		if (map && bounds) map.fitBounds(bounds, { padding: 64, maxZoom: 14, duration: 600 })
	})

	// Keep the selected store visible in the list.
	$effect(() => {
		if (!selectedId) return
		list?.querySelector(`[data-store="${selectedId}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" })
	})

	function select(store: Store) {
		interaction = { popup: { kind: "annotation", id: store.id } }
		map?.flyTo({ center: store.coordinates, zoom: Math.max(map.getZoom(), 14) })
	}

	const byId = (id: string) => stores.find((store) => store.id === id)
</script>

{#snippet marker({ annotation }: { annotation: StoreAnnotation })}
	<MapPin active={annotation.id === selectedId || annotation.id === hoveredId}>
		<StoreIcon />
	</MapPin>
{/snippet}

{#snippet popup(context: { target: { kind: string; annotation?: StoreAnnotation } })}
	{@const store = context.target.annotation ? byId(context.target.annotation.data.id) : undefined}
	{#if store}
		{@const [lng, lat] = store.coordinates}
		<MapPopup>
			<MapPopupHeader>
				<MapPopupTitle>{store.name}</MapPopupTitle>
				<MapPopupDescription>{store.address}, {store.city}</MapPopupDescription>
			</MapPopupHeader>
			<p class="text-xs">{store.category} · Open {store.hours}</p>
			<MapPopupFooter>
				<a
					class={buttonVariants({ size: "sm" })}
					href={`https://www.openstreetmap.org/directions?to=${lat}%2C${lng}`}
					target="_blank"
					rel="noreferrer"
				>
					<NavigationIcon /> Directions
				</a>
				<a class={buttonVariants({ size: "sm", variant: "outline" })} href={`tel:${store.phone.replaceAll(" ", "")}`}>
					Call
				</a>
			</MapPopupFooter>
		</MapPopup>
	{/if}
{/snippet}

<div
	class={cn(
		"grid h-full min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] overflow-hidden rounded-xl border bg-background md:grid-cols-[22rem_minmax(0,1fr)] md:grid-rows-1",
		className
	)}
>
	<aside class="order-2 flex min-h-0 flex-col border-t md:order-1 md:border-t-0 md:border-r">
		<div class="grid gap-3 border-b p-4">
			<div class="relative">
				<SearchIcon class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					bind:value={query}
					placeholder="Search by name, street or city"
					aria-label="Search stores"
					class="pl-8"
				/>
			</div>
			<div class="flex flex-wrap gap-1.5" role="group" aria-label="Store type">
				<Button
					size="xs"
					variant={category === null ? "default" : "outline"}
					aria-pressed={category === null}
					onclick={() => (category = null)}
				>
					All
				</Button>
				{#each categories as item (item)}
					<Button
						size="xs"
						variant={category === item ? "default" : "outline"}
						aria-pressed={category === item}
						onclick={() => (category = category === item ? null : item)}
					>
						{item}
					</Button>
				{/each}
			</div>
			<p class="text-xs text-muted-foreground" role="status">
				{visible.length} of {stores.length} stores{origin ? " · nearest first" : ""}
			</p>
		</div>
		<ul bind:this={list} class="min-h-0 flex-1 overflow-y-auto p-2">
			{#each visible as store (store.id)}
				<li>
					<button
						type="button"
						data-store={store.id}
						aria-current={store.id === selectedId}
						onclick={() => select(store)}
						onpointerenter={() => (hoveredId = store.id)}
						onpointerleave={() => (hoveredId = null)}
						class="grid w-full gap-1 rounded-lg p-3 text-left text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-[current=true]:bg-muted"
					>
						<span class="flex items-center justify-between gap-2">
							<span class="font-medium">{store.name}</span>
							<Badge variant="secondary">{store.category}</Badge>
						</span>
						<span class="text-muted-foreground">{store.address}, {store.city}</span>
						<span class="text-xs text-muted-foreground">
							Open {store.hours}{origin ? ` · ${kilometres(origin, store.coordinates).toFixed(1)} km` : ""}
						</span>
					</button>
				</li>
			{:else}
				<li class="grid place-items-center gap-1 p-8 text-center text-sm text-muted-foreground">
					<MapPinIcon class="size-5" />
					No stores match your search.
				</li>
			{/each}
		</ul>
	</aside>

	<Map
		variant="faded"
		class="order-1 md:order-2"
		{annotations}
		annotationClusters={{ clusterMaxZoom: 12 }}
		interactionState={interaction}
		onInteractionStateChange={(next) => (interaction = next)}
		onload={(loaded) => (map = loaded)}
		{marker}
		{popup}
	>
		<MapControls onlocate={(position) => (origin = position)} />
	</Map>
</div>
