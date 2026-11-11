import { StoreLocator } from "@/components/store-locator/store-locator"
import { storeCategories, stores } from "@/components/store-locator/stores"

// Replace the sample stores in components/store-locator/stores.ts with yours.
export function StoreLocatorExample() {
  return <StoreLocator stores={stores} categories={storeCategories} />
}
