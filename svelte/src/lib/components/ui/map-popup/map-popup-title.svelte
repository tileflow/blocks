<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements"

	import { cn } from "$lib/utils"

	let { class: className, children, ...rest }: HTMLAttributes<HTMLHeadingElement> = $props()
</script>

<h3 data-slot="map-popup-title" class={cn("leading-snug font-medium", className)} {...rest}>
	{@render children?.()}
</h3>
