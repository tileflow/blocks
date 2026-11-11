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

/** Whether an item exists in a stack: built items exist in every stack that has an installer. */
export const stackHasItem = (stack: Stack, built: boolean) => built && stack.install !== undefined

/** The stacks that have items, the default one first. */
export const liveStacks = stacks.filter((stack) => stack.install !== undefined)

/** The stacks shown as coming soon. */
export const soonStacks = stacks.filter((stack) => stack.install === undefined)
