<script lang="ts">
	import StoreLocator from "$lib/components/store-locator/store-locator.svelte"
	import { storeCategories, stores } from "$lib/components/store-locator/stores"

	// Replace the sample stores in $lib/components/store-locator/stores.ts with yours.
</script>

<StoreLocator {stores} categories={storeCategories} />
