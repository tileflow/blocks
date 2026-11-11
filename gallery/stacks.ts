// The stacks every catalog item can be offered in, and how each one installs and sets up the map.
// The HTML pages and the Markdown versions both read this. Gallery only.

export type StackId = "react" | "svelte" | "html" | "vue"

export type SetupStep = {
  /** Where the step applies, such as "Next.js". */
  title: string
  text: string
  /** A command to run first, such as adding a setup item. */
  command?: string
  code?: { language: string; label: string; content: string }
}

export type Stack = {
  id: StackId
  label: string
  /** The page for an item in this stack: /items/<name> for the default stack, /items/<name>/<stack> otherwise. */
  default?: boolean
  /** What the items of this stack are, in one line. */
  summary: string
  /** The command that installs an item, from its registry URL. Missing while the stack has no items. */
  install?: (url: string) => string
  /** The shadcn-style CLI and where it is listed. */
  channel?: string
  requirements?: string
  setup?: SetupStep[]
  /** Folder of the usage examples, as `<folder>/<item>.<extension>`. */
  examples?: { folder: string; extension: string; language: string }
  /** The registry.json that lists this stack's items. */
  registry?: string
  /** A stack installed as one npm package instead of a registry: its items and what each adds. */
  package?: {
    name: string
    /** `files`: files to copy, from `source` in this repository to `path` in the project. */
    items: Record<string, { docs: string; files?: { path: string; source: string }[] }>
  }
}

export const stacks: Stack[] = [
  {
    id: "react",
    label: "React",
    default: true,
    summary: "shadcn/ui components that you copy into your React app and edit.",
    install: (url) => `npx shadcn@latest add ${url}`,
    channel: "shadcn",
    requirements: "React 18 or 19, Tailwind CSS 4 and shadcn/ui, with Next.js 15 or 16 (App Router) or Vite 5 to 8 (React Router, TanStack Start).",
    setup: [
      {
        title: "Next.js",
        text: "Add the route that serves the map while next dev runs, and wrap your config in next.config.ts with withTileflow. next build writes the prepared map to public/tileflow.",
        command: "npx shadcn@latest add https://tileflow.dev/r/react/map-next.json",
        code: {
          language: "ts",
          label: "next.config.ts",
          content: `import type { NextConfig } from "next"
import { withTileflow } from "@tileflow/next"

const nextConfig: NextConfig = {}

export default withTileflow(nextConfig)`,
        },
      },
      {
        title: "Vite",
        text: "Install @tileflow/vite as a dev dependency and add its plugin. It serves the map in development and writes it into the build.",
        command: "npm install --save-dev @tileflow/vite@alpha",
        code: {
          language: "ts",
          label: "vite.config.ts",
          content: `import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { tileflow } from "@tileflow/vite"

export default defineConfig({ plugins: [tileflow(), react()] })`,
        },
      },
    ],
    examples: { folder: "gallery/examples", extension: "tsx", language: "tsx" },
    registry: "registry.json",
  },
  {
    id: "svelte",
    label: "Svelte",
    summary: "shadcn-svelte components that you copy into your SvelteKit app and edit.",
    install: (url) => `npx shadcn-svelte@latest add ${url}`,
    channel: "shadcn-svelte",
    requirements: "Svelte 5, SvelteKit 2 or 3, Tailwind CSS 4 and shadcn-svelte. The map follows the dark class that mode-watcher sets.",
    setup: [
      {
        title: "SvelteKit",
        text: "Install @tileflow/vite as a dev dependency and add its plugin before sveltekit(). With SvelteKit 3, shadcn-svelte's $lib imports also need the alias shown.",
        command: "npm install --save-dev @tileflow/vite@alpha",
        code: {
          language: "ts",
          label: "vite.config.ts",
          content: `import tailwindcss from "@tailwindcss/vite"
import { sveltekit } from "@sveltejs/kit/vite"
import { tileflow } from "@tileflow/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    tileflow(),
    tailwindcss(),
    // SvelteKit 3 only: the alias for shadcn-svelte's $lib imports.
    sveltekit({ alias: { $lib: "src/lib" } }),
  ],
})`,
        },
      },
    ],
    examples: { folder: "svelte/src/lib/examples", extension: "svelte", language: "svelte" },
    registry: "svelte/registry.json",
  },
  {
    id: "html",
    label: "Web Components",
    summary: "Custom elements for any web page: plain HTML, a CMS, Angular or another framework.",
    install: () => "npm install @tileflow/elements@alpha @tileflow/core@alpha @tileflow/maps@alpha maplibre-gl",
    channel: "npm",
    requirements: "A current browser and a build that prepares the map: Vite 5 to 8 with @tileflow/vite. The elements follow a dark or light class, or data-theme, on the html element.",
    setup: [
      {
        title: "Vite",
        text: "Define the map in tileflow.config.ts, add the @tileflow/vite plugin, and import the package once with MapLibre's worker. The import defines every element.",
        command: "npm install --save-dev @tileflow/vite@alpha",
        code: {
          language: "ts",
          label: "vite.config.ts and main.ts",
          content: `// vite.config.ts
import { tileflow } from "@tileflow/vite"
import { defineConfig } from "vite"

export default defineConfig({ plugins: [tileflow()] })

// main.ts, or a module script in your page
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"
import { configureWorker } from "@tileflow/elements"

configureWorker(workerUrl)`,
        },
      },
    ],
    examples: { folder: "elements/examples", extension: "html", language: "html" },
    package: {
      name: "@tileflow/elements",
      items: {
        map: {
          docs: "<tileflow-map> fills its parent, so give the parent a height. It draws the map named by its map attribute (default app) from tileflow.config.ts. Attributes: variant (default, faded or monochrome), light and dark (the base theme of each mode), theme (a fixed Streets theme), center and zoom, fit-markers, cluster-max-zoom, navigation and static.",
          files: [{ path: "tileflow.config.ts", source: "elements/tileflow.config.ts" }],
        },
        "map-marker": {
          docs: "Each <tileflow-marker lng lat label> inside a map is a marker. Its children are what the map draws: a <tileflow-pin>, a <tileflow-price-tag> or your own HTML; a round pin when it has none. The active attribute draws it as active, as hover, focus and selection do.",
        },
        "map-popup": {
          docs: "A <tileflow-popup> inside a marker opens when the marker is clicked. The open attribute opens it, and the map keeps it current as people open and close popups, firing toggle. Lay out the content with the tileflow-popup classes; any element with data-popup-close closes it.",
        },
        "map-controls": {
          docs: "<tileflow-map-controls> inside a map adds show my location and full screen buttons; no-locate and no-fullscreen leave one out. It fires tileflow-locate with [lng, lat]. The map's navigation attribute adds zoom and compass buttons.",
        },
        "store-locator": {
          docs: "The store locator is a page to copy, built with the elements: a searchable list synced with the map, with filters, popups and nearest first. Replace the sample stores in stores.js with yours.",
          files: [{ path: "stores.js", source: "elements/examples/stores.js" }],
        },
      },
    },
  },
  {
    id: "vue",
    label: "Vue",
    summary: "shadcn-vue components that you copy into your Vue or Nuxt app and edit.",
  },
]

export const defaultStack = stacks.find((stack) => stack.default) as Stack

export function findStack(id: string | undefined): Stack | undefined {
  return id === undefined ? defaultStack : stacks.find((stack) => stack.id === id)
}

/** Whether an item exists in a stack: built items, in every stack that has an installer and lists them. */
export const stackHasItem = (stack: Stack, built: boolean, name?: string) =>
  built && stack.install !== undefined && (!stack.package || name === undefined || name in stack.package.items)

/** The stacks that have items, the default one first. */
export const liveStacks = stacks.filter((stack) => stack.install !== undefined)

/** Every built item in every stack but the default one: the pages at /items/<name>/<stack>. */
export function stackItemPages(items: { name: string; phase: string }[]) {
  return liveStacks
    .filter((stack) => !stack.default)
    .flatMap((stack) => items.filter((item) => stackHasItem(stack, item.phase === "built", item.name)).map((item) => ({ name: item.name, stack: stack.id })))
}

/** The stacks shown as coming soon. */
export const soonStacks = stacks.filter((stack) => stack.install === undefined)
