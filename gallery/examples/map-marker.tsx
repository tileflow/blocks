"use client"

import * as React from "react"
import type { TileflowAnnotation } from "@tileflow/interactions"
import { CoffeeIcon } from "lucide-react"

import { Map } from "@/components/ui/map"
import { MapPin, MapPriceTag } from "@/components/ui/map-marker"

type Place = { id: string; kind: "price" | "pin" | "stop"; label: string; at: [number, number] }

const places: Place[] = [
  { id: "a", kind: "price", label: "€420", at: [-3.7012, 40.4205] },
  { id: "b", kind: "price", label: "€385", at: [-3.6935, 40.4152] },
  { id: "c", kind: "price", label: "€510", at: [-3.7105, 40.4128] },
  { id: "d", kind: "pin", label: "Café", at: [-3.7068, 40.4247] },
  { id: "e", kind: "stop", label: "1", at: [-3.6889, 40.4228] },
  { id: "f", kind: "stop", label: "2", at: [-3.6962, 40.4093] },
]

export function MarkerExample() {
  const [hovered, setHovered] = React.useState<string | null>("b")
  const annotations = React.useMemo<TileflowAnnotation[]>(
    () =>
      places.map((place) => ({
        kind: "marker",
        id: place.id,
        coordinate: place.at,
        ariaLabel: place.kind === "stop" ? `Stop ${place.label}` : place.label,
      })),
    []
  )

  return (
    <Map
      annotations={annotations}
      center={[-3.6998, 40.4168]}
      zoom={14}
      renderMarker={({ annotation }) => {
        const place = places.find((candidate) => candidate.id === annotation.id)
        if (!place) return null
        if (place.kind === "pin")
          return (
            <MapPin>
              <CoffeeIcon />
            </MapPin>
          )
        if (place.kind === "stop") return <MapPin className="text-xs font-semibold">{place.label}</MapPin>
        return (
          <MapPriceTag active={hovered === place.id} onPointerEnter={() => setHovered(place.id)}>
            {place.label}
          </MapPriceTag>
        )
      }}
    />
  )
}
