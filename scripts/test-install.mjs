// Installs the registry into new apps and checks that the store locator works in each.
//
//   node scripts/test-install.mjs            every environment
//   node scripts/test-install.mjs vite       one: next, vite
//
// Builds the registry for a local origin and serves it with the Worker (`wrangler dev`). For each
// environment it creates an app with `shadcn init`, adds `store-locator` from that origin, follows
// the setup the map item describes, builds and starts the app, and opens the store locator in
// Chromium: the map must reach its idle state with the sample stores on it, and switch to a dark
// map theme when the app switches to dark mode.
import { spawn } from "node:child_process"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import net from "node:net"
import os from "node:os"
import path from "node:path"
import { chromium } from "playwright"

// Free ports, so the test runs next to other local servers.
function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.on("error", reject)
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address()
      server.close(() => resolve(port))
    })
  })
}

const registryPort = await freePort()
const inspectorPort = await freePort()
const registryUrl = `http://localhost:${registryPort}/r`
const env = {
  ...process.env,
  CI: "true",
  NEXT_TELEMETRY_DISABLED: "1",
  WRANGLER_SEND_METRICS: "false",
}
const servers = []

function run(command, args, options = {}) {
  console.log(`$ ${command} ${args.join(" ")}`)
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", env, ...options })
    child.on("error", reject)
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} exited with ${code}`))
    )
  })
}

function serve(command, args, options = {}) {
  console.log(`$ ${command} ${args.join(" ")} &`)
  const child = spawn(command, args, {
    stdio: ["ignore", "inherit", "inherit"],
    env,
    detached: true,
    ...options,
  })
  servers.push({ name: args.join(" "), child })
}

async function waitFor(url, { timeoutMs = 120_000 } = {}) {
  const deadline = Date.now() + timeoutMs
  let last = "no response"
  while (Date.now() < deadline) {
    const stopped = servers.find(({ child }) => child.exitCode !== null)
    if (stopped)
      throw new Error(`${stopped.name} exited with ${stopped.child.exitCode}`)
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (response.ok) return
      last = `HTTP ${response.status}`
    } catch (error) {
      last = error.message
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000))
  }
  throw new Error(`${url} did not answer in time (${last})`)
}

function stopServers() {
  for (const { child } of servers) {
    try {
      process.kill(-child.pid, "SIGTERM")
    } catch {}
  }
}


// The page each environment renders: the usage example of the block.
const storeLocatorPage = `import { StoreLocator } from "@/components/store-locator/store-locator"
import { storeCategories, stores } from "@/components/store-locator/stores"

export default function StoreLocatorPage() {
  return (
    <main style={{ height: "100svh", padding: 16 }}>
      <StoreLocator stores={stores} categories={storeCategories} />
    </main>
  )
}
`

async function edit(file, change) {
  const text = await readFile(file, "utf8")
  const next = change(text)
  if (next === text) throw new Error(`${file} did not change`)
  await writeFile(file, next)
}

// Each environment: how shadcn creates it, the setup the map item asks for, and how it serves.
const environments = {
  next: {
    template: "next",
    async setup(app) {
      await add(app, "map-next")
      await edit(path.join(app, "next.config.ts"), (text) =>
        text
          .replace(/^/, 'import { withTileflow } from "@tileflow/next"\n')
          .replace("export default nextConfig", "export default withTileflow(nextConfig)")
      )
      await mkdir(path.join(app, "app/store-locator"), { recursive: true })
      await writeFile(path.join(app, "app/store-locator/page.tsx"), storeLocatorPage)
    },
    build: ["pnpm", ["exec", "next", "build"]],
    start: (port) => ["pnpm", ["exec", "next", "start", "--port", String(port)]],
    page: "/store-locator",
  },
  vite: {
    template: "vite",
    async setup(app) {
      await run("pnpm", ["add", "-D", "@tileflow/vite@0.1.0-alpha.26"], { cwd: app })
      await edit(path.join(app, "vite.config.ts"), (text) =>
        text
          .replace(/^/, 'import { tileflow } from "@tileflow/vite"\n')
          .replace(/plugins:\s*\[/, "plugins: [tileflow(), ")
      )
      await writeFile(path.join(app, "src/App.tsx"), storeLocatorPage.replace("StoreLocatorPage", "App"))
    },
    build: ["pnpm", ["exec", "vite", "build"]],
    start: (port) => ["pnpm", ["exec", "vite", "preview", "--port", String(port), "--strictPort"]],
    page: "/",
  },
}

async function add(app, item) {
  await run("pnpm", ["exec", "shadcn", "add", `${registryUrl}/react/${item}.json`, "--yes", "--cwd", app])
}

async function check(name, environment, workspace) {
  const app = path.join(workspace, name)
  await run("pnpm", ["exec", "shadcn", "init", "--template", environment.template, "--defaults", "--name", name, "--no-monorepo", "--cwd", workspace])
  await add(app, "store-locator")
  await environment.setup(app)
  const [buildCommand, buildArgs] = environment.build
  await run(buildCommand, buildArgs, { cwd: app })
  const appPort = await freePort()
  const appUrl = `http://localhost:${appPort}`
  const [startCommand, startArgs] = environment.start(appPort)
  serve(startCommand, startArgs, { cwd: app })
  await waitFor(appUrl)
  await waitFor(`${appUrl}/tileflow/manifest.json`)

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: "light" })
    const errors = []
    page.on("pageerror", (error) => errors.push(String(error)))
    await page.goto(`${appUrl}${environment.page}`)

    // The map goes back to loading whenever the block moves the camera, so keep the state
    // that the wait saw rather than reading it again.
    const settled = await page.waitForFunction(
      () => {
        const state = document.querySelector("[data-tileflow-state]")?.getAttribute("data-tileflow-state")
        return state === "idle" || state === "error" ? state : false
      },
      undefined,
      { timeout: 60_000 }
    )
    const state = await settled.jsonValue()
    if (state !== "idle") throw new Error(`${name}: the map ended in the ${state} state:\n${errors.join("\n")}`)
    const pins = page.locator(
      // Markers inside a cluster are hidden; count what the visitor sees.
      ".tileflow-interaction-marker:visible, .tileflow-interaction-cluster:visible"
    )
    await pins.first().waitFor({ timeout: 30_000 })
    const lightTheme = await page.locator("[data-tileflow-theme]").getAttribute("data-tileflow-theme")
    if (lightTheme?.startsWith("dark")) throw new Error(`${name}: light mode shows the ${lightTheme} map theme`)

    await page.evaluate(() => {
      document.documentElement.classList.remove("light")
      document.documentElement.classList.add("dark")
    })
    await page.locator('[data-tileflow-theme^="dark"]').waitFor({ timeout: 30_000 })
    const darkTheme = await page.locator("[data-tileflow-theme]").getAttribute("data-tileflow-theme")

    if (errors.length > 0) throw new Error(`${name}: page errors:\n${errors.join("\n")}`)
    console.log(`${name}: store-locator idle with ${await pins.count()} markers or clusters; themes ${lightTheme} → ${darkTheme}`)
  } finally {
    await browser.close()
  }
}

const selected = process.argv.slice(2)
for (const name of selected) if (!environments[name]) throw new Error(`Unknown environment ${name}. Use: ${Object.keys(environments).join(", ")}`)
const workspace = await mkdtemp(path.join(os.tmpdir(), "tileflow-blocks-install-"))

try {
  await run("pnpm", ["registry:build"], { env: { ...env, REGISTRY_URL: registryUrl } })
  serve("pnpm", ["exec", "wrangler", "dev", "--config", "worker/wrangler.jsonc", "--local", "--port", String(registryPort), "--inspector-port", String(inspectorPort)])
  await waitFor(`${registryUrl}/react/store-locator.json`)
  for (const name of selected.length ? selected : Object.keys(environments)) {
    await check(name, environments[name], workspace)
  }
} finally {
  stopServers()
  await rm(workspace, { recursive: true, force: true })
}
