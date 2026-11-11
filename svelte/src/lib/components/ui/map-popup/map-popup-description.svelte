<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements"

	import { cn } from "$lib/utils"

	let { class: className, children, ...rest }: HTMLAttributes<HTMLParagraphElement> = $props()
</script>

<p data-slot="map-popup-description" class={cn("text-xs text-muted-foreground", className)} {...rest}>
	{@render children?.()}
</p>
