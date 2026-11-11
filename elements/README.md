# @tileflow/elements

Tileflow map components as custom elements, for any web page: plain HTML, a CMS, Angular or a
framework without its own Tileflow Blocks. A map that follows your page between light and dark,
with markers, popups and controls in your design tokens.

> Pre-release. The package is not on npm yet: it builds on `@tileflow/dom`, which is not released.

```html
<tileflow-map center="-3.7035,40.4186" zoom="15">
  <tileflow-marker lng="-3.7035" lat="40.4172" label="Puerta del Sol store">
    <tileflow-popup>
      <div class="tileflow-popup">
        <h3 class="tileflow-popup-title">Puerta del Sol</h3>
      </div>
    </tileflow-popup>
  </tileflow-marker>
  <tileflow-map-controls></tileflow-map-controls>
</tileflow-map>
```

## Install

```sh
npm install @tileflow/elements@alpha @tileflow/core@alpha @tileflow/maps@alpha maplibre-gl
npm install --save-dev @tileflow/vite@alpha
```

The map is defined in `tileflow.config.ts` and prepared by your build: with Vite, add `tileflow()`
from `@tileflow/vite` to the plugins. It serves the map at `/tileflow/manifest.json` in development
and writes it into the build. Then import the package once; it defines every element.

```js
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"
import { configureWorker } from "@tileflow/elements"

// Vite: MapLibre's worker, for the dev server and the build.
configureWorker(workerUrl)
```

Call `configureWorker` in the module that imports the package. Other bundlers resolve the default,
`new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url)`, in their builds.

## Elements

| Element | What it is |
| --- | --- |
| `<tileflow-map>` | The map. It fills its parent, so give the parent a height. |
| `<tileflow-marker>` | A marker. Its children are what the map draws; a round pin when it has none. |
| `<tileflow-popup>` | The popup of the marker it is in. It opens when the marker is clicked. |
| `<tileflow-pin>`, `<tileflow-price-tag>` | Marker shapes in your primary colour. |
| `<tileflow-map-controls>` | Show my location and full screen buttons. |

### `<tileflow-map>`

| Attribute | Meaning |
| --- | --- |
| `map` | A map from `tileflow.config.ts`. Default `app`. |
| `manifest-url` | Where the prepared map is served. Default `/tileflow/manifest.json`. |
| `variant` | `default`, `faded` (markers read first) or `monochrome` (for data colours). |
| `light`, `dark` | The base theme for each mode: `light` or `dawn`, `dark` or `dusk`. |
| `theme` | A Streets theme, instead of following the page. |
| `center`, `zoom` | The view, as `"lng,lat"` and a number. |
| `fit-markers` | Fit the view to the markers. |
| `cluster-max-zoom` | Group nearby markers up to this zoom. |
| `navigation` | The map's zoom and compass buttons. |
| `static` | The map takes no input. |

The map follows a `dark` or `light` class or a `data-theme` attribute on `<html>`, and the system
setting otherwise. `ready` settles with the MapLibre map, `map` returns it once loaded, and
`controller` is the `@tileflow/dom` controller for options the attributes do not cover.

Events: `tileflow-load` (detail: the MapLibre map), `tileflow-error` (detail: `{code, error}`; call
`preventDefault()` to stop the console error) and `tileflow-interaction`.

### `<tileflow-marker>`

`lng`, `lat` and `label`, which screen readers announce. `open` opens its popup, and the map keeps
it current as people open and close popups; each change fires `toggle` with `detail.open`. `active`
draws the marker as active, as hover, focus and selection do.

The map draws the marker's own nodes, so listeners you add to them keep working. In a popup, any
element with `data-popup-close` closes it.

### `<tileflow-map-controls>`

`no-locate` and `no-fullscreen` leave a button out. `tileflow-locate` fires after the map flies to
the visitor, with `detail` `[lng, lat]`.

## Theme

The elements read your shadcn variables when the page defines them: `--background`, `--foreground`,
`--popover`, `--primary`, `--muted`, `--border`, `--ring`, `--radius` and their pairs. Without them
they use neutral defaults in light and dark. Set any of them on `tileflow-map` to theme one map. All
rules sit in the `tileflow` cascade layer, so your own CSS wins.

Popup content can use `tileflow-popup`, `tileflow-popup-header`, `tileflow-popup-title`,
`tileflow-popup-description` and `tileflow-popup-footer` for a card layout.

## Develop

`@tileflow/elements` is its own pnpm workspace until `@tileflow/dom` is on npm. From the repository
root:

```sh
TILEFLOW_SDK_DIR=../tileflow-sdk pnpm sdk:pack   # packs core, interactions and dom from a built SDK
pnpm --dir elements install
pnpm --dir elements dev                          # the examples, at http://localhost:5173
pnpm --dir elements build
pnpm test:install html                           # installs the pack into a new Vite site
```

The examples in `examples/` are the pages the Tileflow Blocks gallery shows.
