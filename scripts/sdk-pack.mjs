// Packs the SDK packages @tileflow/elements needs before they are on npm: @tileflow/dom and the
// core and interactions it builds on, from one local tileflow-sdk checkout, into .sdk-packs.
//
//   TILEFLOW_SDK_DIR=../tileflow-sdk pnpm sdk:pack
//
// Build the SDK first (pnpm build in the checkout). Then `pnpm --dir elements install`.
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync } from "node:fs"
import path from "node:path"

const sdk = path.resolve(process.env.TILEFLOW_SDK_DIR ?? "../tileflow-sdk")
const destination = path.resolve(".sdk-packs")
mkdirSync(destination, { recursive: true })

for (const name of ["core", "interactions", "dom"]) {
  const dir = path.join(sdk, "packages", name)
  if (!existsSync(path.join(dir, "dist"))) throw new Error(`${dir} is not built: run pnpm build in ${sdk}`)
  const result = spawnSync("pnpm", ["pack", "--pack-destination", destination], { cwd: dir, stdio: "inherit" })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
