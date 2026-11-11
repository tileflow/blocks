import { defaultItemName } from "@/gallery/catalog"
import { ItemPage } from "@/gallery/item-page"

// The gallery opens on the store locator; every item has its page at /items/<name>.
export default function Page() {
  return <ItemPage name={defaultItemName} />
}
