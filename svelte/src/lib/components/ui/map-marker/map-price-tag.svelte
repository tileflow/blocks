<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements"

	import { cn } from "$lib/utils"

	/** A short label such as a price. The active tag switches to your primary colour. */
	let { active = false, class: className, children, ...rest }: HTMLAttributes<HTMLSpanElement> & { active?: boolean } = $props()
</script>

<span
	data-slot="map-price-tag"
	data-active={active}
	class={cn(
		"inline-flex h-6 items-center rounded-full border bg-background px-2 text-xs font-semibold text-foreground tabular-nums shadow-sm transition-colors",
		"data-[active=true]:border-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground",
		className
	)}
	{...rest}
>
	{@render children?.()}
</span>
