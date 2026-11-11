# Tileflow Blocks

Map components and blocks that you copy into your project and edit. They follow your shadcn/ui
theme: the map switches between light and dark with your theme toggle, and markers, clusters,
popups and controls use your `--primary`, `--popover`, `--border` and `--radius`. Street map data
comes from Tileflow World; no account or API key is needed.

The components are a thin layer over the published `@tileflow/*` packages. Rendering, clustering,
popups, accessibility and map data stay in those packages; the files here hold layout, styling and
the parts you are expected to change.

## Install in React

> **Pre-release.** The registry is not served at `tileflow.dev/r` yet, so the commands below do not
> work until it is.

In a React project with shadcn/ui (Next.js, Vite, React Router):

```sh
npx shadcn@latest add https://tileflow.dev/r/react/store-locator.json
```

This adds the store locator, the map components it uses and the map definition in
`tileflow.config.ts`. Replace the sample stores in `components/store-locator/stores.ts` with your
own data, and render `<StoreLocator stores={stores} categories={storeCategories} />` in a page.

Then let your framework prepare the map, so it is served at `/tileflow/manifest.json`:

- **Next.js:** add the route with `npx shadcn@latest add https://tileflow.dev/r/react/map-next.json`
  and wrap your config in `next.config.ts`:

  ```ts
  import { withTileflow } from "@tileflow/next"

  export default withTileflow(nextConfig)
  ```

- **Vite** (React Router, TanStack Start): install `@tileflow/vite` and add its plugin to
  `vite.config.ts`:

  ```ts
  import { tileflow } from "@tileflow/vite"

  export default defineConfig({ plugins: [tileflow(), react()] })
  ```

Install a single component with `npx shadcn@latest add https://tileflow.dev/r/react/map.json`.

| Item            | Type      | What it adds                                                          |
| --------------- | --------- | --------------------------------------------------------------------- |
| `map`           | component | `<Map>`, the theme bridge and `tileflow.config.ts`                    |
| `map-next`      | setup     | The route that serves the map while `next dev` runs                   |
| `map-marker`    | component | `MapPin` and `MapPriceTag` for `renderMarker`                         |
| `map-popup`     | component | Popup header, title, description and footer for `renderPopup`         |
| `map-controls`  | component | Show-my-location and full-screen buttons                              |
| `store-locator` | block     | Searchable store list synced with the map, filters and nearest-first  |

## Requirements

- React 18 or 19, Tailwind CSS 4 and shadcn/ui, with Next.js 15 or 16 (App Router) or Vite 5 to 8.
- MapLibre's worker comes from your bundle; nothing to copy.
- Keep the map attribution visible.

## Develop

```sh
pnpm install
pnpm dev                    # the gallery: every catalog item at http://localhost:3000
pnpm registry:build         # writes dist/r/<item>.json and dist/r/v/<version>/<item>.json
pnpm registry:dev           # serves dist/ like tileflow.dev/r/* does
pnpm check                  # lint, types, registry validation, registry and preview builds
pnpm test:install           # installs store-locator into new Next.js and Vite apps and opens each in Chromium
```

`pnpm test:install` needs Chromium for Playwright (`pnpm exec playwright install chromium`).

The files under `components/`, `lib/` and `app/` are the registry sources: `registry.json` points
at them, and the preview app renders them exactly as they are installed. Set `REGISTRY_URL` when
building for another origin, for example `REGISTRY_URL=http://localhost:8787/r`. Each stack is
served under its own path: `/r/react/<item>.json`.

## For agents

Every gallery page has a Markdown version with the install command, a usage example and the full
source of the files it adds: append `.md` to the page URL, or ask for the page with
`Accept: text/markdown`. `/llms.txt` lists every item, and `/llms-full.txt` holds every built item
in one file. `gallery/markdown.ts` writes them from the same sources as the HTML pages.

To check them against the [Agent-Friendly Documentation Spec](https://afdocs.dev/), serve the
static preview and run `afdocs` in another terminal:

```sh
TILEFLOW_BLOCKS_ORIGIN=http://localhost:8790 pnpm preview:build && pnpm preview:serve
npx afdocs@0.23.0 check http://localhost:8790/ --format scorecard
```

## Preview

`pnpm preview:build` exports the gallery as a static site to `out/`, with the map prepared at build
time, and `pnpm preview:serve` serves it locally through `preview/worker.ts`, which adds the Markdown
versions. The Preview workflow deploys it to
`blocks-preview.tileflow.dev`, which is limited to the Tileflow team.

## License

MIT. Map data and the Tileflow packages carry their own licenses and attribution.
