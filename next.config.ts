import type { NextConfig } from "next"
import { withTileflow } from "@tileflow/next"

// `pnpm dev` and installed apps serve the map from the route in app/api/tileflow.
// `pnpm preview:build` exports the gallery as a static site instead: the map is prepared at build
// time into the same /api/tileflow paths, and the route (the only .ts file under app/) is left out.
const staticPreview = process.env.TILEFLOW_STATIC_PREVIEW === "1"

// Markdown for agents: /items/<name>.md, or an item page asked for with `Accept: text/markdown`.
// preview/worker.ts does the same for the static preview.
const wantsMarkdown = [{ type: "header" as const, key: "accept", value: ".*text/markdown.*" }]

const nextConfig: NextConfig = staticPreview
  ? withTileflow(
      {
        output: "export",
        pageExtensions: ["tsx"],
        images: { unoptimized: true },
      },
      { base: "/api/tileflow" }
    )
  : {
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
    }

export default nextConfig
