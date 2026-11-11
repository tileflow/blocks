import type { Map as MapLibreMap } from "maplibre-gl"

import type { TileflowMapElement } from "./map-element"

const svg = (paths: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`

const icons = {
  locate: svg('<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'),
  enter: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  exit: svg('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>'),
}

/**
 * `<tileflow-map-controls>`: show my location and full screen buttons, over the bottom right of the
 * enclosing <tileflow-map>. Add the map's navigation attribute for zoom and compass buttons.
 *
 * Attributes: `no-locate` and `no-fullscreen` leave a button out.
 * Event: `tileflow-locate` after the map flies to the visitor, with `detail` [lng, lat].
 */
export class TileflowMapControlsElement extends HTMLElement {
  static observedAttributes = ["no-locate", "no-fullscreen"]

  #map: MapLibreMap | null = null
  #locate = this.#button("Show my location", icons.locate, () => this.#locateVisitor())
  #fullscreen = this.#button("Full screen", icons.enter, () => this.#toggleFullscreen())
  #onFullscreenChange = () => this.#syncFullscreen()

  connectedCallback() {
    this.replaceChildren(
      ...(this.hasAttribute("no-locate") ? [] : [this.#locate]),
      ...(this.hasAttribute("no-fullscreen") ? [] : [this.#fullscreen])
    )
    document.addEventListener("fullscreenchange", this.#onFullscreenChange)
    const host = this.closest("tileflow-map") as TileflowMapElement | null
    void host?.ready?.then((map) => {
      this.#map = map
      this.#locate.disabled = !navigator.geolocation
      this.#fullscreen.disabled = !document.fullscreenEnabled
    })
  }

  disconnectedCallback() {
    document.removeEventListener("fullscreenchange", this.#onFullscreenChange)
  }

  attributeChangedCallback() {
    if (this.isConnected) this.connectedCallback()
  }

  #button(label: string, icon: string, onClick: () => void) {
    const button = document.createElement("button")
    button.type = "button"
    button.ariaLabel = label
    button.disabled = true
    button.innerHTML = icon
    button.addEventListener("click", onClick)
    return button
  }

  #locateVisitor() {
    const map = this.#map
    if (!map || !navigator.geolocation) return
    this.#locate.disabled = true
    this.#locate.ariaBusy = "true"
    const done = () => {
      this.#locate.disabled = false
      this.#locate.ariaBusy = "false"
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position: [number, number] = [coords.longitude, coords.latitude]
        map.flyTo({ center: position, zoom: Math.max(map.getZoom(), 13) })
        done()
        this.dispatchEvent(new CustomEvent("tileflow-locate", { detail: position }))
      },
      done,
      { enableHighAccuracy: false, timeout: 10_000 }
    )
  }

  #toggleFullscreen() {
    const host = this.closest("tileflow-map")
    if (!host) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void host.requestFullscreen()
  }

  #syncFullscreen() {
    const full = document.fullscreenElement !== null && document.fullscreenElement === this.closest("tileflow-map")
    this.#fullscreen.ariaLabel = full ? "Exit full screen" : "Full screen"
    this.#fullscreen.innerHTML = full ? icons.exit : icons.enter
  }
}
