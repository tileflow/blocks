"use client"

import * as React from "react"
import type {
  TileflowAnnotation,
  TileflowInteractionState,
} from "@tileflow/interactions"
import { CoffeeIcon, StoreIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Map } from "@/components/ui/map"
import { MapControls } from "@/components/ui/map-controls"
import { MapPin, MapPriceTag } from "@/components/ui/map-marker"
import {
  MapPopup,
  MapPopupDescription,
  MapPopupFooter,
  MapPopupHeader,
  MapPopupTitle,
} from "@/components/ui/map-popup"
import { StoreLocator } from "@/components/store-locator/store-locator"
import { storeCategories, stores } from "@/components/store-locator/stores"

// What each built item looks like in use, drawn with the registry components exactly as they
// are installed. Gallery only.

type DemoAnnotation = TileflowAnnotation & { data: { label: string } }

function MapDemo() {
  return <Map />
}

const homes: { id: string; price: string; at: [number, number]; kind: "pin" | "stop" | "price" }[] = [
  { id: "a", price: "€420", at: [-3.7012, 40.4205], kind: "price" },
  { id: "b", price: "€385", at: [-3.6935, 40.4152], kind: "price" },
  { id: "c", price: "€510", at: [-3.7105, 40.4128], kind: "price" },
  { id: "d", price: "", at: [-3.7068, 40.4247], kind: "pin" },
  { id: "e", price: "1", at: [-3.6889, 40.4228], kind: "stop" },
  { id: "f", price: "2", at: [-3.6962, 40.4093], kind: "stop" },
]

function MarkerDemo() {
  const [hovered, setHovered] = React.useState<string | null>("b")
  const annotations = React.useMemo<DemoAnnotation[]>(
    () =>
      homes.map((home) => ({
        kind: "marker",
        id: home.id,
        coordinate: home.at,
        ariaLabel: home.kind === "stop" ? `Stop ${home.price}` : home.price || "Café",
        data: { label: home.price },
      })),
    []
  )
  return (
    <Map<DemoAnnotation>
      annotations={annotations}
      center={[-3.6998, 40.4168]}
      zoom={14}
      renderMarker={({ annotation }) => {
        const home = homes.find((candidate) => candidate.id === annotation.id)
        if (!home) return null
        if (home.kind === "pin")
          return (
            <MapPin>
              <CoffeeIcon />
            </MapPin>
          )
        if (home.kind === "stop") return <MapPin className="text-xs font-semibold">{home.price}</MapPin>
        return (
          <MapPriceTag
            active={hovered === home.id}
            onPointerEnter={() => setHovered(home.id)}
          >
            {home.price}
          </MapPriceTag>
        )
      }}
    />
  )
}

const shop: [number, number] = [-3.7035, 40.4172]

function PopupDemo() {
  const [interaction, setInteraction] = React.useState<TileflowInteractionState>({
    popup: { kind: "annotation", id: "shop" },
  })
  const annotations = React.useMemo<DemoAnnotation[]>(
    () => [
      {
        kind: "marker",
        id: "shop",
        coordinate: shop,
        ariaLabel: "Puerta del Sol store",
        data: { label: "Puerta del Sol" },
        popup: { content: { kind: "view", name: "shop" } },
      },
    ],
    []
  )
  return (
    <Map<DemoAnnotation>
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
            <span className={buttonVariants({ size: "sm" })}>Directions</span>
            <span className={buttonVariants({ size: "sm", variant: "outline" })}>Call</span>
          </MapPopupFooter>
        </MapPopup>
      )}
    />
  )
}

function ControlsDemo() {
  return (
    <Map>
      <MapControls />
    </Map>
  )
}

function StoreLocatorDemo() {
  return (
    <StoreLocator
      stores={stores}
      categories={storeCategories}
      className="rounded-none border-0"
    />
  )
}

export const demos: Record<string, React.ComponentType> = {
  map: MapDemo,
  "map-marker": MarkerDemo,
  "map-popup": PopupDemo,
  "map-controls": ControlsDemo,
  "store-locator": StoreLocatorDemo,
}

/** The map alone, under the card of an item that is not built yet. */
export const PlaceholderDemo = MapDemo
