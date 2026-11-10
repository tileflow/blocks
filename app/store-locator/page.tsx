import { StoreLocator } from "@/components/store-locator/store-locator"
import { storeCategories, stores } from "@/components/store-locator/stores"

export default function StoreLocatorPage() {
  return (
    <main className="mx-auto flex h-svh max-w-7xl flex-col gap-4 p-4 md:p-6">
      <header className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Find a store</h1>
        <p className="text-sm text-muted-foreground">
          Search by name or street, filter by type, or show the stores nearest to you.
        </p>
      </header>
      <StoreLocator stores={stores} categories={storeCategories} className="min-h-0 flex-1" />
    </main>
  )
}
