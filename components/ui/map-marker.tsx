import * as React from "react"

import { cn } from "@/lib/utils"

/** A round pin in your primary colour. Return it from the map's renderMarker. */
function MapPin({
  active = false,
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & { active?: boolean }) {
  return (
    <span
      data-slot="map-pin"
      data-active={active}
      className={cn(
        "grid size-7 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-transform duration-150 [&_svg]:size-3.5",
        "data-[active=true]:scale-125 data-[active=true]:ring-2 data-[active=true]:ring-ring data-[active=true]:ring-offset-1 data-[active=true]:ring-offset-background",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/** A short label such as a price. The active tag switches to your primary colour. */
function MapPriceTag({
  active = false,
  className,
  ...props
}: React.ComponentProps<"span"> & { active?: boolean }) {
  return (
    <span
      data-slot="map-price-tag"
      data-active={active}
      className={cn(
        "inline-flex h-6 items-center rounded-full border bg-background px-2 text-xs font-semibold text-foreground tabular-nums shadow-sm transition-colors",
        "data-[active=true]:border-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground",
        className
      )}
      {...props}
    />
  )
}

export { MapPin, MapPriceTag }
