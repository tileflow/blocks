import type { NextConfig } from "next"
import { withTileflow } from "@tileflow/next"

// The gallery prepares its map like any Next.js app that installs `map`: withTileflow serves it at
// /tileflow through app/api/tileflow in development and writes it to public/tileflow in builds.
// `pnpm preview:build` exports the gallery as a static site; the route (the only .ts file under
// app/) is left out because the export already holds the prepared map.
const staticPreview = process.env.TILEFLOW_STATIC_PREVIEW === "1"

// Markdown for agents: /items/<name>.md, or an item page asked for with `Accept: text/markdown`.
// preview/worker.ts does the same for the static preview.
const wantsMarkdown = [{ type: "header" as const, key: "accept", value: ".*text/markdown.*" }]

const nextConfig: NextConfig = staticPreview
  ? withTileflow({ output: "export", pageExtensions: ["tsx"], images: { unoptimized: true } })
  : withTileflow({
      async rewrites() {
        return {
          beforeFiles: [
            { source: "/items/:file(.+\\.md)", destination: "/md/items/:file" },
            { source: "/", has: wantsMarkdown, destination: "/index.md" },
            { source: "/items/:name", has: wantsMarkdown, destination: "/md/items/:name.md" },
          ],
          afterFiles: [],
          fallback: [],
        }
      },
    })

export default nextConfig
