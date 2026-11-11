// Builds the package: one ES module that defines the elements, and its type declarations.
// esbuild, not Vite's library mode, because Vite inlines `new URL(…, import.meta.url)` assets:
// the MapLibre worker URL must reach the app's bundler as written.
import { readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { build } from "esbuild"

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  format: "esm",
  target: "es2022",
  // The app installs and dedupes these.
  external: ["@tileflow/*", "maplibre-gl"],
  plugins: [
    {
      // `import css from "x.css?inline"` (as Vite reads it in the demo) becomes the file's text.
      name: "inline-css",
      setup(builder) {
        builder.onResolve({ filter: /\.css\?inline$/ }, (args) => ({
          // Node's resolution, since maplibre-gl itself is external.
          path: createRequire(path.join(args.resolveDir, "index.js")).resolve(args.path.slice(0, -"?inline".length)),
          namespace: "inline-css",
        }))
        builder.onLoad({ filter: /.*/, namespace: "inline-css" }, async (args) => ({
          contents: await readFile(args.path, "utf8"),
          loader: "text",
        }))
      },
    },
  ],
  logLevel: "info",
})
