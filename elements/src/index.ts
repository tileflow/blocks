import { TileflowMapControlsElement } from "./controls-element"
import { TileflowMapElement } from "./map-element"
import { TileflowMarkerElement, TileflowPinElement, TileflowPopupElement, TileflowPriceTagElement } from "./marker-element"

// Importing the package defines the elements, once per page.
const elements: [string, CustomElementConstructor][] = [
  ["tileflow-map", TileflowMapElement],
  ["tileflow-marker", TileflowMarkerElement],
  ["tileflow-popup", TileflowPopupElement],
  ["tileflow-pin", TileflowPinElement],
  ["tileflow-price-tag", TileflowPriceTagElement],
  ["tileflow-map-controls", TileflowMapControlsElement],
]
for (const [name, element] of elements) {
  if (!customElements.get(name)) customElements.define(name, element)
}

export { configureWorker, TileflowMapElement } from "./map-element"
export { TileflowMarkerElement, TileflowPinElement, TileflowPopupElement, TileflowPriceTagElement } from "./marker-element"
export { TileflowMapControlsElement } from "./controls-element"
export { mapTheme, type ColorScheme, type MapThemeSettings, type MapVariant } from "./theme"

declare global {
  interface HTMLElementTagNameMap {
    "tileflow-map": TileflowMapElement
    "tileflow-marker": TileflowMarkerElement
    "tileflow-popup": TileflowPopupElement
    "tileflow-pin": TileflowPinElement
    "tileflow-price-tag": TileflowPriceTagElement
    "tileflow-map-controls": TileflowMapControlsElement
  }
}
