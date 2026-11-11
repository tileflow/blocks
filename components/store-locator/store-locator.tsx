"use client"

import * as React from "react"
import type { Map as MapLibreMap } from "maplibre-gl"
import type {
  TileflowAnnotation,
  TileflowAnnotationViewContext,
  TileflowInteractionState,
} from "@tileflow/interactions"
import { MapPinIcon, NavigationIcon, SearchIcon, StoreIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Map, boundsOf } from "@/components/ui/map"
import { MapControls } from "@/components/ui/map-controls"
import { MapPin } from "@/components/ui/map-marker"
import {
  MapPopup,
  MapPopupDescription,
  MapPopupFooter,
  MapPopupHeader,
  MapPopupTitle,
} from "@/components/ui/map-popup"
import type { Store, StoreCategory } from "./stores"

type StoreAnnotation = TileflowAnnotation & { data: { id: string } }

const fold = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

function kilometres(from: [number, number], to: [number, number]) {
  const rad = Math.PI / 180
  const dLat = (to[1] - from[1]) * rad
  const dLng = (to[0] - from[0]) * rad
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(from[1] * rad) * Math.cos(to[1] * rad) * Math.sin(dLng / 2) ** 2
  return 12_742 * Math.asin(Math.sqrt(a))
}

export function StoreLocator({
  stores,
  categories,
  className,
}: {
  stores: Store[]
  categories: StoreCategory[]
  className?: string
}) {
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState<StoreCategory | null>(null)
  const [origin, setOrigin] = React.useState<[number, number] | null>(null)
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const [interaction, setInteraction] = React.useState<TileflowInteractionState>({
    popup: null,
  })
  const [map, setMap] = React.useState<MapLibreMap | null>(null)
  const listRef = React.useRef<HTMLUListElement>(null)

  const selectedId =
    interaction.popup?.kind === "annotation" ? interaction.popup.id : null

  const visible = React.useMemo(() => {
    const needle = fold(query.trim())
    const matches = stores.filter(
      (store) =>
        (!category || store.category === category) &&
        fold(`${store.name} ${store.address} ${store.city}`).includes(needle)
    )
    if (!origin) return matches
    return [...matches].sort(
      (a, b) => kilometres(origin, a.coordinates) - kilometres(origin, b.coordinates)
    )
  }, [stores, query, category, origin])

  const annotations = React.useMemo<StoreAnnotation[]>(
    () =>
      visible.map((store) => ({
        kind: "marker",
        id: store.id,
        coordinate: store.coordinates,
        ariaLabel: `${store.name}, ${store.address}`,
        data: { id: store.id },
        // renderPopup draws this view; without it the marker opens nothing.
        popup: { content: { kind: "view", name: "store" } },
      })),
    [visible]
  )

  // Frame the visible stores whenever the filter changes.
  React.useEffect(() => {
    const bounds = boundsOf(visible.map((store) => store.coordinates))
    if (map && bounds) map.fitBounds(bounds, { padding: 64, maxZoom: 14, duration: 600 })
  }, [map, visible])

  // Keep the selected store visible in the list.
  React.useEffect(() => {
    if (!selectedId) return
    listRef.current
      ?.querySelector(`[data-store="${selectedId}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [selectedId])

  function select(store: Store) {
    setInteraction({ popup: { kind: "annotation", id: store.id } })
    map?.flyTo({ center: store.coordinates, zoom: Math.max(map.getZoom(), 14) })
  }

  const byId = (id: string) => stores.find((store) => store.id === id)

  return (
    <div
      className={cn(
        "grid h-full min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] overflow-hidden rounded-xl border bg-background md:grid-cols-[22rem_minmax(0,1fr)] md:grid-rows-1",
        className
      )}
    >
      <aside className="order-2 flex min-h-0 flex-col border-t md:order-1 md:border-t-0 md:border-r">
        <div className="grid gap-3 border-b p-4">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, street or city"
              aria-label="Search stores"
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Store type">
            <Button
              size="xs"
              variant={category === null ? "default" : "outline"}
              aria-pressed={category === null}
              onClick={() => setCategory(null)}
            >
              All
            </Button>
            {categories.map((item) => (
              <Button
                key={item}
                size="xs"
                variant={category === item ? "default" : "outline"}
                aria-pressed={category === item}
                onClick={() => setCategory(category === item ? null : item)}
              >
                {item}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground" role="status">
            {visible.length} of {stores.length} stores
            {origin && " · nearest first"}
          </p>
        </div>
        <ul ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-2">
          {visible.map((store) => (
            <li key={store.id}>
              <button
                type="button"
                data-store={store.id}
                aria-current={store.id === selectedId}
                onClick={() => select(store)}
                onPointerEnter={() => setHoveredId(store.id)}
                onPointerLeave={() => setHoveredId(null)}
                className="grid w-full gap-1 rounded-lg p-3 text-left text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-[current=true]:bg-muted"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium">{store.name}</span>
                  <Badge variant="secondary">{store.category}</Badge>
                </span>
                <span className="text-muted-foreground">
                  {store.address}, {store.city}
                </span>
                <span className="text-xs text-muted-foreground">
                  Open {store.hours}
                  {origin && ` · ${kilometres(origin, store.coordinates).toFixed(1)} km`}
                </span>
              </button>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="grid place-items-center gap-1 p-8 text-center text-sm text-muted-foreground">
              <MapPinIcon className="size-5" />
              No stores match your search.
            </li>
          )}
        </ul>
      </aside>

      <Map<StoreAnnotation>
        variant="faded"
        className="order-1 md:order-2"
        annotations={annotations}
        annotationClusters={{ clusterMaxZoom: 12 }}
        interactionState={interaction}
        onInteractionStateChange={setInteraction}
        onLoad={setMap}
        renderMarker={({ annotation }) => (
          <MapPin active={annotation.id === selectedId || annotation.id === hoveredId}>
            <StoreIcon />
          </MapPin>
        )}
        renderPopup={({
          annotation,
        }: TileflowAnnotationViewContext<StoreAnnotation>) => {
          const store = byId(annotation.data.id)
          if (!store) return null
          const [lng, lat] = store.coordinates
          return (
            <MapPopup>
              <MapPopupHeader>
                <MapPopupTitle>{store.name}</MapPopupTitle>
                <MapPopupDescription>
                  {store.address}, {store.city}
                </MapPopupDescription>
              </MapPopupHeader>
              <p className="text-xs">
                {store.category} · Open {store.hours}
              </p>
              <MapPopupFooter>
                <a
                  className={buttonVariants({ size: "sm" })}
                  href={`https://www.openstreetmap.org/directions?to=${lat}%2C${lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <NavigationIcon /> Directions
                </a>
                <a
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                  href={`tel:${store.phone.replaceAll(" ", "")}`}
                >
                  Call
                </a>
              </MapPopupFooter>
            </MapPopup>
          )
        }}
      >
        <MapControls onLocate={setOrigin} />
      </Map>
    </div>
  )
}
