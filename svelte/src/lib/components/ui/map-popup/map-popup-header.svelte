<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements"

	import { cn } from "$lib/utils"

	let { class: className, children, ...rest }: HTMLAttributes<HTMLDivElement> = $props()
</script>

<div data-slot="map-popup-header" class={cn("grid gap-0.5 pr-6", className)} {...rest}>
	{@render children?.()}
</div>
