"use client"

import * as React from "react"
import type { TileflowAnnotation, TileflowInteractionState } from "@tileflow/interactions"
import { StoreIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Map } from "@/components/ui/map"
import { MapPin } from "@/components/ui/map-marker"
import {
  MapPopup,
  MapPopupDescription,
  MapPopupFooter,
  MapPopupHeader,
  MapPopupTitle,
} from "@/components/ui/map-popup"

const shop: [number, number] = [-3.7035, 40.4172]

const annotations: TileflowAnnotation[] = [
  {
    kind: "marker",
    id: "shop",
    coordinate: shop,
    ariaLabel: "Puerta del Sol store",
    popup: { content: { kind: "view", name: "shop" } },
  },
]

export function PopupExample() {
  // Start with the popup open. Clicking the pin or closing the popup updates this state.
  const [interaction, setInteraction] = React.useState<TileflowInteractionState>({
    popup: { kind: "annotation", id: "shop" },
  })

  return (
    <Map
      annotations={annotations}
      interactionState={interaction}
      onInteractionStateChange={setInteraction}
      center={[shop[0], shop[1] + 0.0025]}
      zoom={15.5}
      renderMarker={() => (
        <MapPin active={interaction.popup !== null}>
          <StoreIcon />
        </MapPin>
      )}
      renderPopup={() => (
        <MapPopup>
          <MapPopupHeader>
            <MapPopupTitle>Puerta del Sol</MapPopupTitle>
            <MapPopupDescription>Calle de Preciados 12, Madrid</MapPopupDescription>
          </MapPopupHeader>
          <p className="text-xs">Flagship · Open 9:00–21:00</p>
          <MapPopupFooter>
            <Button size="sm">Directions</Button>
            <Button size="sm" variant="outline">
              Call
            </Button>
          </MapPopupFooter>
        </MapPopup>
      )}
    />
  )
}
