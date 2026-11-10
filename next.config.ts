import type { NextConfig } from "next"
import { withTileflow } from "@tileflow/next"

// `pnpm dev` and installed apps serve the map from the route in app/api/tileflow.
// `pnpm preview:build` exports the gallery as a static site instead: the map is prepared at build
// time into the same /api/tileflow paths, and the route (the only .ts file under app/) is left out.
const staticPreview = process.env.TILEFLOW_STATIC_PREVIEW === "1"

const nextConfig: NextConfig = staticPreview
  ? withTileflow(
      {
        output: "export",
        pageExtensions: ["tsx"],
        images: { unoptimized: true },
      },
      { base: "/api/tileflow" }
    )
  : {}

export default nextConfig
