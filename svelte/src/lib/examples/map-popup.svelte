<script lang="ts">
	import type { TileflowAnnotation, TileflowInteractionState } from "@tileflow/interactions"
	import StoreIcon from "@lucide/svelte/icons/store"

	import { Button } from "$lib/components/ui/button"
	import { Map } from "$lib/components/ui/map"
	import { MapPin } from "$lib/components/ui/map-marker"
	import {
		MapPopup,
		MapPopupDescription,
		MapPopupFooter,
		MapPopupHeader,
		MapPopupTitle,
	} from "$lib/components/ui/map-popup"

	const shop: [number, number] = [-3.7035, 40.4172]

	const annotations: TileflowAnnotation[] = [
		{
			kind: "marker",
			id: "shop",
			coordinate: shop,
			ariaLabel: "Puerta del Sol store",
			popup: { content: { kind: "view", name: "shop" } },
		},
	]

	// Start with the popup open. Clicking the pin or closing the popup updates this state.
	let interaction = $state<TileflowInteractionState>({ popup: { kind: "annotation", id: "shop" } })
</script>

{#snippet marker()}
	<MapPin active={interaction.popup !== null}><StoreIcon /></MapPin>
{/snippet}

{#snippet popup()}
	<MapPopup>
		<MapPopupHeader>
			<MapPopupTitle>Puerta del Sol</MapPopupTitle>
			<MapPopupDescription>Calle de Preciados 12, Madrid</MapPopupDescription>
		</MapPopupHeader>
		<p class="text-xs">Flagship · Open 9:00–21:00</p>
		<MapPopupFooter>
			<Button size="sm">Directions</Button>
			<Button size="sm" variant="outline">Call</Button>
		</MapPopupFooter>
	</MapPopup>
{/snippet}

<Map
	{annotations}
	interactionState={interaction}
	onInteractionStateChange={(next) => (interaction = next)}
	center={[shop[0], shop[1] + 0.0025]}
	zoom={15.5}
	{marker}
	{popup}
/>
