import type { StackId } from "@/gallery/stacks"

// Where the gallery and the registry are served. Gallery only; nothing here is installed.

/** The gallery origin used in absolute links, for agents and Markdown readers. */
export const siteOrigin = (process.env.TILEFLOW_BLOCKS_ORIGIN ?? "https://blocks-preview.tileflow.dev").replace(/\/$/, "")

/** Where the shadcn CLIs fetch the items from: <registryBase>/<stack>/<item>.json. */
export const registryBase = "https://tileflow.dev/r"

/** False until the registry is served at registryBase. */
export const registryLive = false

export const registryItemUrl = (stack: StackId, name: string) => `${registryBase}/${stack}/${name}.json`

/** The page of an item: /items/<name> in the default stack, /items/<name>/<stack> in the others. */
export const itemPath = (name: string, stack?: StackId) =>
  stack === undefined || stack === "react" ? `/items/${name}` : `/items/${name}/${stack}`

export const itemMarkdownPath = (name: string, stack?: StackId) => `${itemPath(name, stack)}.md`
