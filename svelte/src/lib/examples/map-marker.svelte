<script lang="ts">
	import type { TileflowAnnotation } from "@tileflow/interactions"
	import CoffeeIcon from "@lucide/svelte/icons/coffee"

	import { Map } from "$lib/components/ui/map"
	import { MapPin, MapPriceTag } from "$lib/components/ui/map-marker"

	type Place = { id: string; kind: "price" | "pin" | "stop"; label: string; at: [number, number] }

	const places: Place[] = [
		{ id: "a", kind: "price", label: "€420", at: [-3.7012, 40.4205] },
		{ id: "b", kind: "price", label: "€385", at: [-3.6935, 40.4152] },
		{ id: "c", kind: "price", label: "€510", at: [-3.7105, 40.4128] },
		{ id: "d", kind: "pin", label: "Café", at: [-3.7068, 40.4247] },
		{ id: "e", kind: "stop", label: "1", at: [-3.6889, 40.4228] },
		{ id: "f", kind: "stop", label: "2", at: [-3.6962, 40.4093] },
	]

	let hovered = $state<string | null>("b")

	const annotations: TileflowAnnotation[] = places.map((place) => ({
		kind: "marker",
		id: place.id,
		coordinate: place.at,
		ariaLabel: place.kind === "stop" ? `Stop ${place.label}` : place.label,
	}))
</script>

{#snippet marker({ annotation }: { annotation: TileflowAnnotation })}
	{@const place = places.find((candidate) => candidate.id === annotation.id)}
	{#if place?.kind === "pin"}
		<MapPin><CoffeeIcon /></MapPin>
	{:else if place?.kind === "stop"}
		<MapPin class="text-xs font-semibold">{place.label}</MapPin>
	{:else if place}
		<MapPriceTag active={hovered === place.id} onpointerenter={() => (hovered = place.id)}>{place.label}</MapPriceTag>
	{/if}
{/snippet}

<Map {annotations} center={[-3.6998, 40.4168]} zoom={14} {marker} />
