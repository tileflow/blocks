<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements"

	import { cn } from "$lib/utils"

	/** A round pin in your primary colour. Render it from the map's marker snippet. */
	let { active = false, class: className, children, ...rest }: HTMLAttributes<HTMLSpanElement> & { active?: boolean } = $props()
</script>

<span
	data-slot="map-pin"
	data-active={active}
	class={cn(
		"grid size-7 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-transform duration-150 [&_svg]:size-3.5",
		"data-[active=true]:scale-125 data-[active=true]:ring-2 data-[active=true]:ring-ring data-[active=true]:ring-offset-1 data-[active=true]:ring-offset-background",
		className
	)}
	{...rest}
>
	{@render children?.()}
</span>
