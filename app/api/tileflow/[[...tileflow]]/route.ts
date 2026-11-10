import { createTileflowRouteHandlers } from "@tileflow/next/server"

// Builds tileflow.config.ts and serves the map's manifest, styles and assets.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const { GET, HEAD } = createTileflowRouteHandlers({ base: "/api/tileflow" })
