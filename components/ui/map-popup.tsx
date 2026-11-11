import * as React from "react"

import { cn } from "@/lib/utils"

// The map draws the popup surface and its close button with your --popover,
// --border and --radius. These parts lay out what goes inside, like a Card.

function MapPopup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="map-popup"
      className={cn("relative grid w-64 gap-2 p-3 text-sm", className)}
      {...props}
    />
  )
}

function MapPopupHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="map-popup-header"
      className={cn("grid gap-0.5 pr-6", className)}
      {...props}
    />
  )
}

function MapPopupTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="map-popup-title"
      className={cn("leading-snug font-medium", className)}
      {...props}
    />
  )
}

function MapPopupDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="map-popup-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function MapPopupFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="map-popup-footer"
      className={cn("flex items-center gap-2 pt-1", className)}
      {...props}
    />
  )
}

export {
  MapPopup,
  MapPopupDescription,
  MapPopupFooter,
  MapPopupHeader,
  MapPopupTitle,
}
