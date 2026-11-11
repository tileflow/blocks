<script lang="ts">
	// The map draws the popup surface and its close button with your --popover,
	// --border and --radius. These parts lay out what goes inside, like a Card.
	import type { HTMLAttributes } from "svelte/elements"

	import { cn } from "$lib/utils"

	let { class: className, children, ...rest }: HTMLAttributes<HTMLDivElement> = $props()
</script>

<div data-slot="map-popup" class={cn("relative grid w-64 gap-2 p-3 text-sm", className)} {...rest}>
	{@render children?.()}
</div>
