// Builds the registry for the origin that serves it.
//
//   REGISTRY_URL=https://tileflow.dev/r node scripts/build-registry.mjs
//
// Writes dist/r/<item>.json (the current release) and dist/r/v/<version>/<item>.json
// (immutable copies that pinned installs and the tileflow.dev/blocks catalog use).
// registry.json names dependencies by their public URL, so installing straight from
// GitHub (tileflow/blocks/<item>#<tag>) also works; the build rewrites that origin.
import { execFileSync } from "node:child_process"
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"

const registryUrl = (process.env.REGISTRY_URL ?? "https://tileflow.dev/r").replace(/\/+$/, "")
const { version } = JSON.parse(await readFile("package.json", "utf8"))
const canonical = "https://tileflow.dev/r"
const built = "dist/.build"

await rm("dist", { recursive: true, force: true })
execFileSync("pnpm", ["exec", "shadcn", "build", "--output", built], { stdio: "inherit" })

async function write(directory, base) {
  await mkdir(directory, { recursive: true })
  for (const file of await readdir(built)) {
    const text = await readFile(path.join(built, file), "utf8")
    const resolved = text.replaceAll(`${canonical}/`, `${base}/`)
    await writeFile(path.join(directory, file), resolved)
  }
}

await write("dist/r", registryUrl)
await write(`dist/r/v/${version}`, `${registryUrl}/v/${version}`)
await rm(built, { recursive: true })
console.log(`Registry ${version} for ${registryUrl}: dist/r and dist/r/v/${version}`)
