// Builds the registry of every stack for the origin that serves it.
//
//   REGISTRY_URL=https://tileflow.dev/r node scripts/build-registry.mjs
//
// Writes dist/r/<stack>/<item>.json (the current release) and dist/r/<stack>/v/<version>/<item>.json
// (immutable copies that pinned installs and the tileflow.dev/blocks catalog use). Each stack's
// registry.json names dependencies by their public URL, so installing straight from GitHub also
// works; the build rewrites that origin.
import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"

const registryUrl = (process.env.REGISTRY_URL ?? "https://tileflow.dev/r").replace(/\/+$/, "")
const { version } = JSON.parse(await readFile("package.json", "utf8"))
const canonical = "https://tileflow.dev/r"

// Each stack builds with its own CLI, from its own registry.json.
const stacks = [
  { name: "react", build: (out) => ["pnpm", ["exec", "shadcn", "build", "--output", out]] },
  {
    name: "svelte",
    registry: "svelte/registry.json",
    build: (out) => ["pnpm", ["--dir", "svelte", "exec", "shadcn-svelte", "registry", "build", "--output", path.resolve(out)]],
  },
]

await rm("dist", { recursive: true, force: true })

for (const stack of stacks) {
  if (stack.registry && !existsSync(stack.registry)) continue
  const built = `dist/.build-${stack.name}`
  const [command, args] = stack.build(built)
  execFileSync(command, args, { stdio: "inherit" })

  async function write(directory, base) {
    await mkdir(directory, { recursive: true })
    for (const file of await readdir(built)) {
      if (!file.endsWith(".json")) continue
      const text = await readFile(path.join(built, file), "utf8")
      await writeFile(path.join(directory, file), text.replaceAll(`${canonical}/${stack.name}/`, `${base}/`))
    }
  }

  await write(`dist/r/${stack.name}`, `${registryUrl}/${stack.name}`)
  await write(`dist/r/${stack.name}/v/${version}`, `${registryUrl}/${stack.name}/v/${version}`)
  await rm(built, { recursive: true })
  console.log(`Registry ${version} (${stack.name}) for ${registryUrl}: dist/r/${stack.name}`)
}
