import { resolve } from "node:path"
import { tileflow } from "@tileflow/vite"
import { defineConfig } from "vite"

// The demo pages under examples/, served with the map prepared by @tileflow/vite as any app would.
export default defineConfig({
  plugins: [tileflow()],
  // The examples import the package by name, as an app would; here it is the source.
  resolve: { alias: { "@tileflow/elements": resolve(import.meta.dirname, "src/index.ts") } },
  build: {
    outDir: "dist-demo",
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "index.html"),
        map: resolve(import.meta.dirname, "examples/map.html"),
        "map-marker": resolve(import.meta.dirname, "examples/map-marker.html"),
        "map-popup": resolve(import.meta.dirname, "examples/map-popup.html"),
        "map-controls": resolve(import.meta.dirname, "examples/map-controls.html"),
        "store-locator": resolve(import.meta.dirname, "examples/store-locator.html"),
      },
    },
  },
})
