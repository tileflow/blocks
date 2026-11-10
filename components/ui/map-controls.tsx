"use client"

import * as React from "react"
import { LocateFixedIcon, MaximizeIcon, MinimizeIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMap } from "@/components/ui/map"

/**
 * Locate and fullscreen buttons in your button style. Place it inside <Map>.
 * The map brings its own zoom and compass buttons.
 */
function MapControls({
  className,
  locate = true,
  fullscreen = true,
  onLocate,
}: {
  className?: string
  locate?: boolean
  fullscreen?: boolean
  /** Called with [lng, lat] after the map flies to the visitor. */
  onLocate?: (position: [number, number]) => void
}) {
  const map = useMap()
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [locating, setLocating] = React.useState(false)

  React.useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement !== null)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  function locateVisitor() {
    if (!map || !navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position: [number, number] = [coords.longitude, coords.latitude]
        map.flyTo({ center: position, zoom: Math.max(map.getZoom(), 13) })
        setLocating(false)
        onLocate?.(position)
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 10_000 }
    )
  }

  function toggleFullscreen() {
    const container = map?.getContainer().closest("[data-slot=map]")
    if (!container) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void container.requestFullscreen()
  }

  return (
    <div
      data-slot="map-controls"
      className={cn("absolute bottom-10 right-2.5 z-10 grid gap-1.5", className)}
    >
      {locate && (
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Show my location"
          disabled={!map || locating}
          onClick={locateVisitor}
          className="bg-background shadow-sm"
        >
          <LocateFixedIcon className={cn(locating && "animate-pulse")} />
        </Button>
      )}
      {fullscreen && (
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
          disabled={!map}
          onClick={toggleFullscreen}
          className="bg-background shadow-sm"
        >
          {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
        </Button>
      )}
    </div>
  )
}

export { MapControls }
