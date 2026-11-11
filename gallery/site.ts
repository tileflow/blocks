// Where the gallery and the registry are served. Gallery only; nothing here is installed.

/** The gallery origin used in absolute links, for agents and Markdown readers. */
export const siteOrigin = (process.env.TILEFLOW_BLOCKS_ORIGIN ?? "https://blocks-preview.tileflow.dev").replace(/\/$/, "")

/** Where `npx shadcn add` fetches the items from. */
export const registryOrigin = "https://tileflow.dev/r"

/** False until the registry is served at registryOrigin. */
export const registryLive = false

export const itemPath = (name: string) => `/items/${name}`
export const itemMarkdownPath = (name: string) => `/items/${name}.md`
export const installCommand = (name: string) => `npx shadcn@latest add ${registryOrigin}/${name}.json`

export const requirements =
  "Next.js 15 or 16 with the App Router, React 18 or 19, Tailwind CSS 4 and shadcn/ui. Street map data comes from Tileflow; no account or API key is needed for the map."
