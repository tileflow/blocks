<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements"

	import { cn } from "$lib/utils"

	let { class: className, children, ...rest }: HTMLAttributes<HTMLDivElement> = $props()
</script>

<div data-slot="map-popup-footer" class={cn("flex items-center gap-2 pt-1", className)} {...rest}>
	{@render children?.()}
</div>
