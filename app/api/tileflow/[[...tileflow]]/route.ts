import { createTileflowRouteHandlers } from "@tileflow/next/server"

// Next.js only. In development, withTileflow in next.config.ts sends /tileflow/* here: this route
// builds tileflow.config.ts and serves the map's manifest, styles and assets. Production builds
// write the same files to public/tileflow instead.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const { GET, HEAD } = createTileflowRouteHandlers({ routeBase: "/api/tileflow" })
