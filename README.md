# Tileflow Blocks

Map components and blocks for React and Next.js that you copy into your project and edit. They
follow your shadcn/ui theme: the map switches between light and dark with your theme toggle, and
markers, clusters, popups and controls use your `--primary`, `--popover`, `--border` and
`--radius`. Street map data comes from Tileflow World; no account or API key is needed.

The components are a thin layer over the published `@tileflow/react`, `@tileflow/core` and
`@tileflow/interactions` packages. Rendering, clustering, popups, accessibility and map data stay
in those packages; the files here hold layout, styling and the parts you are expected to change.

## Install

> **Pre-release.** The registry is not served at `tileflow.dev/r` yet, so the commands below do not
> work until it is.

In a Next.js App Router project with shadcn/ui:

```sh
npx shadcn@latest add https://tileflow.dev/r/store-locator.json
```

This adds the store locator page at `/store-locator`, the map components it uses, the map
definition in `tileflow.config.ts`, and the route that serves the map at `/api/tileflow`. Replace
the sample stores in `components/store-locator/stores.ts` with your own data.

Install a single component with `npx shadcn@latest add https://tileflow.dev/r/map.json`.

| Item            | Type      | What it adds                                                          |
| --------------- | --------- | --------------------------------------------------------------------- |
| `map`           | component | `<Map>`, the theme bridge, `tileflow.config.ts` and the map route     |
| `map-marker`    | component | `MapPin` and `MapPriceTag` for `renderMarker`                         |
| `map-popup`     | component | Popup header, title, description and footer for `renderPopup`         |
| `map-controls`  | component | Show-my-location and full-screen buttons                              |
| `store-locator` | block     | Searchable store list synced with the map, filters and nearest-first  |

## Requirements

- Next.js 15 or 16 with the App Router, React 18 or 19, Tailwind CSS 4 and shadcn/ui.
- The map loads its manifest from `/api/tileflow` and MapLibre's worker from your bundle.
  `next.config.ts` does not need changes.
- Keep the map attribution visible.

## Develop

```sh
pnpm install
pnpm dev                    # previews every item at http://localhost:3000
pnpm registry:build         # writes dist/r/<item>.json and dist/r/v/<version>/<item>.json
pnpm registry:dev           # serves dist/ like tileflow.dev/r/* does
pnpm check                  # lint, types, registry validation, registry and preview builds
pnpm test:install           # installs store-locator into a new shadcn app and opens it in Chromium
```

`pnpm test:install` needs Chromium for Playwright (`pnpm exec playwright install chromium`).

## Preview

`pnpm preview:build` exports the gallery as a static site to `out/`, with the map prepared at build
time, and `pnpm preview:serve` serves it locally. The Preview workflow deploys it to
`blocks-preview.tileflow.dev`, which is limited to the Tileflow team.

The files under `components/`, `lib/` and `app/` are the registry sources: `registry.json` points
at them, and the preview app renders them exactly as they are installed. Set `REGISTRY_URL` when
building for another origin, for example `REGISTRY_URL=http://localhost:8787/r`.

## License

MIT. Map data and the Tileflow packages carry their own licenses and attribution.
