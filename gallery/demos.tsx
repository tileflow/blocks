"use client"

import type * as React from "react"

import { MapExample } from "@/gallery/examples/map"
import { ControlsExample } from "@/gallery/examples/map-controls"
import { MarkerExample } from "@/gallery/examples/map-marker"
import { PopupExample } from "@/gallery/examples/map-popup"
import { StoreLocatorExample } from "@/gallery/examples/store-locator"

// The usage example of each built item, drawn in its preview. The item page shows the same file
// as the usage code. Gallery only.
export const demos: Record<string, React.ComponentType> = {
  map: MapExample,
  "map-marker": MarkerExample,
  "map-popup": PopupExample,
  "map-controls": ControlsExample,
  "store-locator": StoreLocatorExample,
}

/** The map alone, under the card of an item that is not built yet. */
export const PlaceholderDemo = MapExample
