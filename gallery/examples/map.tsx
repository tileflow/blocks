import { Map } from "@/components/ui/map"

// The map fills its parent, so give the parent a height.
export function MapExample() {
  return (
    <div className="h-full">
      <Map />
    </div>
  )
}
