import type { TileflowMapElement } from "./map-element"

/**
 * `<tileflow-marker lng lat label>`: a marker on the enclosing <tileflow-map>. Its children are the
 * marker (a round <tileflow-pin> when it has none), and a <tileflow-popup> child opens on click.
 *
 * Attributes: `lng`, `lat`, `label` (what screen readers announce), `open` (the popup is open;
 * kept current as people open and close it) and `active` (draws the marker as active).
 * Event: `toggle` when the popup opens or closes, with `detail.open`.
 */
export class TileflowMarkerElement extends HTMLElement {
  static observedAttributes = ["lng", "lat", "label", "id", "open", "active"]

  #map: TileflowMapElement | null = null

  connectedCallback() {
    this.#map = this.closest("tileflow-map") as TileflowMapElement | null
    this.#map?.markersChanged?.()
  }

  disconnectedCallback() {
    this.#map?.markersChanged?.()
    this.#map = null
  }

  attributeChangedCallback(name: string, previous: string | null, value: string | null) {
    if (previous === value) return
    if (name === "open") this.#map?.markerOpenChanged?.(this)
    else if (name === "active") this.#map?.markerActiveChanged?.(this)
    else this.#map?.markersChanged?.()
  }
}

/** `<tileflow-popup>`: the content of a marker's popup. The map draws it when the popup opens. */
export class TileflowPopupElement extends HTMLElement {
  connectedCallback() {
    ;(this.closest("tileflow-map") as TileflowMapElement | null)?.markersChanged?.()
  }
}

/** `<tileflow-pin>` and `<tileflow-price-tag>` are styled with CSS only; these give them a class. */
export class TileflowPinElement extends HTMLElement {}
export class TileflowPriceTagElement extends HTMLElement {}
