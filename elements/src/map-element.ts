import {
  configureTileflowMapLibre,
  createTileflowMap,
  type TileflowMapController,
  type TileflowMapControllerOptions,
  type TileflowMapViews,
} from "@tileflow/dom"
import type { TileflowAnnotation, TileflowInteractionState } from "@tileflow/interactions"
import type { Map as MapLibreMap } from "maplibre-gl"

import { adoptStyles } from "./styles"
import { mapTheme, readColorScheme, subscribeColorScheme, type MapVariant } from "./theme"

type Annotation = TileflowAnnotation
type Options = TileflowMapControllerOptions<Annotation>
type MarkerState = { hovered?: boolean; focused?: boolean; selected?: boolean }
type AttributeOptions = Pick<
  Options,
  "source" | "theme" | "center" | "zoom" | "fitAnnotations" | "navigationControl" | "interactive" | "annotationClusters"
>

let workerConfigured = false

/**
 * Where MapLibre's worker is loaded from. Call it in the module that imports the elements, before
 * the maps start: with Vite, `import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"`.
 * Without it, the elements use `new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url)`,
 * which bundlers resolve in production builds but Vite's dev server does not serve as a worker.
 */
export function configureWorker(workerUrl: string) {
  configureTileflowMapLibre({ workerUrl })
  workerConfigured = true
}

function configureDefaultWorker() {
  if (workerConfigured) return
  workerConfigured = true
  // Bundlers copy the worker of the installed maplibre-gl next to your app.
  configureTileflowMapLibre({ workerUrl: new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href })
}

const numberPair = (value: string | null): [number, number] | undefined => {
  const parts = value?.split(",").map((part) => Number(part.trim()))
  return parts?.length === 2 && parts.every(Number.isFinite) ? [parts[0], parts[1]] : undefined
}

const numberOf = (value: string | null) => {
  if (value === null || value.trim() === "") return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

const markerSelector = ":scope tileflow-marker"

let generatedIds = 0

/** The id a marker is known by on the map: its id attribute, or one made up once. */
export function markerId(marker: Element) {
  if (!marker.id) marker.id = `tileflow-marker-${++generatedIds}`
  return marker.id
}

/**
 * `<tileflow-map>`: a Tileflow map that follows your page between light and dark, with markers,
 * popups and controls in your design tokens. Give it, or its parent, a height.
 *
 * Attributes: `map` (default "app"), `manifest-url` (default "/tileflow/manifest.json"), `variant`
 * (default, faded or monochrome), `theme` (a Streets theme, instead of following the page),
 * `light` (light or dawn), `dark` (dark or dusk), `center` ("lng,lat"), `zoom`, `fit-markers`,
 * `navigation` (zoom and compass buttons), `cluster-max-zoom` (groups nearby markers up to that
 * zoom) and `static` (no input).
 *
 * Events: `tileflow-load` (detail: the MapLibre map), `tileflow-error` (detail: `{code, error}`)
 * and `tileflow-interaction` (detail: the map's interaction event).
 */
export class TileflowMapElement extends HTMLElement {
  static observedAttributes = [
    "map",
    "manifest-url",
    "variant",
    "theme",
    "light",
    "dark",
    "center",
    "zoom",
    "fit-markers",
    "navigation",
    "cluster-max-zoom",
    "static",
  ]

  #controller: TileflowMapController<Annotation> | null = null
  #canvas: HTMLDivElement | null = null
  #unsubscribe: (() => void) | null = null
  #markersQueued = false
  /** The element each marker is drawn in, and its last pointer state, while it is on the map. */
  #drawn = new WeakMap<Element, { element: HTMLElement; state?: MarkerState }>()
  #reflecting = false
  #ready: Promise<MapLibreMap>
  #resolveReady!: (map: MapLibreMap) => void

  constructor() {
    super()
    this.#ready = new Promise((resolve) => (this.#resolveReady = resolve))
  }

  /** Settles with the MapLibre map once it has loaded. */
  get ready(): Promise<MapLibreMap> {
    return this.#ready
  }

  /** The MapLibre map, or null until it loads. */
  get map(): MapLibreMap | null {
    return this.#controller?.getMap() ?? null
  }

  /** The @tileflow/dom controller, for options the attributes do not cover. Null while disconnected. */
  get controller(): TileflowMapController<Annotation> | null {
    return this.#controller
  }

  connectedCallback() {
    adoptStyles(this.ownerDocument)
    // Mount after the importing module has run, so configureWorker() right after the import
    // still applies.
    queueMicrotask(() => this.#mount())
  }

  #mount() {
    if (this.#controller || !this.isConnected) return
    configureDefaultWorker()
    this.#canvas = document.createElement("div")
    this.#canvas.className = "tileflow-map-canvas"
    this.prepend(this.#canvas)
    this.dataset.scheme = readColorScheme()

    this.#controller = createTileflowMap(
      this.#canvas,
      {
        ...this.#attributeOptions(),
        ...this.#markerOptions(),
        defaultInteractionState: this.#openState(),
        themeTransition: { duration: 300 },
        views: this.#viewsFor(this.#hasPopups()),
        onLoad: (map) => {
          this.#resolveReady(map)
          this.dispatchEvent(new CustomEvent("tileflow-load", { detail: map }))
        },
        onError: (failure) => {
          if (this.dispatchEvent(new CustomEvent("tileflow-error", { detail: failure, cancelable: true }))) {
            console.error(`<tileflow-map> ${failure.code}`, failure.error)
          }
        },
        onInteractionEvent: (event) => this.dispatchEvent(new CustomEvent("tileflow-interaction", { detail: event })),
        onInteractionStateChange: (state) => this.#reflectOpen(state),
      },
      { sessionSource: "tileflow-elements", statusElement: this }
    )
    this.#unsubscribe = subscribeColorScheme(() => {
      this.dataset.scheme = readColorScheme()
      this.#controller?.update({ theme: this.#theme() })
    })
  }

  disconnectedCallback() {
    // Moving the element disconnects and connects it again in one task; keep the map then.
    queueMicrotask(() => {
      if (this.isConnected || !this.#controller) return
      this.#controller.destroy()
      this.#controller = null
      this.#unsubscribe?.()
      this.#unsubscribe = null
      this.#canvas?.remove()
      this.#canvas = null
      this.#ready = new Promise((resolve) => (this.#resolveReady = resolve))
    })
  }

  attributeChangedCallback() {
    this.#controller?.update(this.#attributeOptions())
  }

  /** Called by <tileflow-marker> when a marker is added, removed or changed. */
  markersChanged() {
    if (this.#markersQueued || !this.#controller) return
    this.#markersQueued = true
    queueMicrotask(() => {
      this.#markersQueued = false
      this.#controller?.update({ ...this.#markerOptions(), views: this.#viewsFor(this.#hasPopups()) })
    })
  }

  /** Called by <tileflow-marker> when its active attribute changes. */
  markerActiveChanged(marker: Element) {
    const drawn = this.#drawn.get(marker)
    if (drawn) this.#markActive(marker, drawn.element, drawn.state)
  }

  #markActive(marker: Element | null, element: HTMLElement, state?: MarkerState) {
    const active = Boolean(state?.hovered || state?.focused || state?.selected || marker?.hasAttribute("active"))
    element.toggleAttribute("data-active", active)
    marker?.toggleAttribute("data-active", active)
  }

  /** Called by <tileflow-marker> when its open attribute changes. */
  markerOpenChanged(marker: Element) {
    if (this.#reflecting || !this.#controller) return
    const id = markerId(marker)
    const open = marker.hasAttribute("open")
    const current = this.#controller.getInteractionState().popup
    const isCurrent = current?.kind === "annotation" && current.id === id
    if (open && !isCurrent) this.#controller.setInteractionState({ popup: { kind: "annotation", id } })
    else if (!open && isCurrent) this.#controller.setInteractionState({ popup: null })
  }

  #markers(): Element[] {
    return [...this.querySelectorAll(markerSelector)].filter((marker) => marker.closest("tileflow-map") === this)
  }

  #theme() {
    const theme = this.getAttribute("theme")
    if (theme) return theme
    const variant = (this.getAttribute("variant") ?? "default") as MapVariant
    return mapTheme(readColorScheme(), variant, {
      light: (this.getAttribute("light") as "light" | "dawn" | null) ?? undefined,
      dark: (this.getAttribute("dark") as "dark" | "dusk" | null) ?? undefined,
    })
  }

  #attributeOptions(): AttributeOptions {
    const center = numberPair(this.getAttribute("center"))
    const zoom = numberOf(this.getAttribute("zoom"))
    const clusterMaxZoom = numberOf(this.getAttribute("cluster-max-zoom"))
    return {
      source: {
        map: this.getAttribute("map") ?? "app",
        manifestUrl: this.getAttribute("manifest-url") ?? "/tileflow/manifest.json",
      },
      theme: this.#theme(),
      center,
      zoom,
      fitAnnotations: this.hasAttribute("fit-markers") ? { padding: 48, maxZoom: 15 } : undefined,
      navigationControl: this.hasAttribute("navigation") ? { position: "top-right" } : undefined,
      interactive: !this.hasAttribute("static"),
      annotationClusters: clusterMaxZoom === undefined ? undefined : { clusterMaxZoom },
    }
  }

  #markerOptions(): Pick<Options, "annotations"> {
    const annotations: Annotation[] = []
    for (const marker of this.#markers()) {
      const coordinate = [numberOf(marker.getAttribute("lng")), numberOf(marker.getAttribute("lat"))]
      if (coordinate[0] === undefined || coordinate[1] === undefined) continue
      const id = markerId(marker)
      annotations.push({
        kind: "marker",
        id,
        coordinate: coordinate as [number, number],
        ariaLabel: marker.getAttribute("label") ?? marker.textContent?.trim() ?? id,
        ...(marker.querySelector(":scope > tileflow-popup") ? { popup: { content: { kind: "view", name: id } } } : {}),
      })
    }
    return { annotations }
  }

  #openState(): TileflowInteractionState {
    const open = this.#markers().find((marker) => marker.hasAttribute("open") && marker.querySelector(":scope > tileflow-popup"))
    return { popup: open ? { kind: "annotation", id: markerId(open) } : null }
  }

  #reflectOpen(state: TileflowInteractionState) {
    const openId = state.popup?.kind === "annotation" ? state.popup.id : null
    this.#reflecting = true
    try {
      for (const marker of this.#markers()) {
        const open = marker.id === openId
        if (open === marker.hasAttribute("open")) continue
        marker.toggleAttribute("open", open)
        marker.dispatchEvent(new CustomEvent("toggle", { detail: { open } }))
      }
    } finally {
      this.#reflecting = false
    }
  }

  #hasPopups() {
    return this.#markers().some((marker) => marker.querySelector(":scope > tileflow-popup"))
  }

  #markerViews?: TileflowMapViews<Annotation>
  #allViews?: TileflowMapViews<Annotation>

  /** The same objects each time, so the map only redraws when popups come or go. */
  #viewsFor(popups: boolean): TileflowMapViews<Annotation> {
    if (!this.#allViews) {
      this.#allViews = this.#views()
      this.#markerViews = { marker: this.#allViews.marker }
    }
    return popups ? this.#allViews : (this.#markerViews as TileflowMapViews<Annotation>)
  }

  #find(id: string) {
    return this.#markers().find((marker) => marker.id === id) ?? null
  }

  /** Draws each marker's own content, and its popup, by moving the nodes onto the map and back. */
  #views(): TileflowMapViews<Annotation> {
    return {
      marker: (element, context) => {
        const marker = this.#find(context.annotation.id)
        const nodes = marker ? [...marker.childNodes].filter((node) => !(node instanceof Element && node.localName === "tileflow-popup")) : []
        const hasContent = nodes.some((node) => node instanceof Element || node.textContent?.trim())
        element.append(...(hasContent ? nodes : [document.createElement("tileflow-pin")]))
        const mark = (state?: MarkerState) => {
          if (marker) this.#drawn.set(marker, { element, state })
          this.#markActive(marker, element, state)
        }
        mark(context.state)
        return {
          update: (next) => mark(next.state),
          destroy: () => {
            if (marker) this.#drawn.delete(marker)
            if (marker && hasContent) marker.prepend(...nodes)
          },
        }
      },
      popup: (element, context) => {
        if (!("annotation" in context) || !context.annotation) return
        const popup = this.#find(context.annotation.id)?.querySelector(":scope > tileflow-popup")
        if (!popup) return
        const nodes = [...popup.childNodes]
        element.append(...nodes)
        // Any button marked data-popup-close closes the popup, like the close button.
        const onClick = (event: Event) => {
          if ((event.target as Element | null)?.closest("[data-popup-close]")) context.close()
        }
        element.addEventListener("click", onClick)
        return {
          destroy: () => {
            element.removeEventListener("click", onClick)
            popup.append(...nodes)
          },
        }
      },
    }
  }
}
