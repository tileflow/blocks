// Installs the registry into a new shadcn app and checks that the store locator works there.
//
//   node scripts/test-install.mjs
//
// Builds the registry for a local origin and serves it with the Worker (`wrangler dev`). Then it
// creates an app with `shadcn init`, adds `store-locator` from that origin, builds and starts the
// app, and opens /store-locator in Chromium: the map must reach its idle state with the sample
// stores on it, and switch to a dark map theme when the app switches to dark mode.
import { spawn } from "node:child_process"
import { mkdtemp, rm } from "node:fs/promises"
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
const appPort = await freePort()
const registryUrl = `http://localhost:${registryPort}/r`
const appUrl = `http://localhost:${appPort}`
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

const workspace = await mkdtemp(
  path.join(os.tmpdir(), "tileflow-blocks-install-")
)
const app = path.join(workspace, "app")

try {
  await run("pnpm", ["registry:build"], {
    env: { ...env, REGISTRY_URL: registryUrl },
  })
  serve("pnpm", [
    "exec",
    "wrangler",
    "dev",
    "--config",
    "worker/wrangler.jsonc",
    "--local",
    "--port",
    String(registryPort),
    "--inspector-port",
    String(inspectorPort),
  ])
  await waitFor(`${registryUrl}/store-locator.json`)

  await run("pnpm", [
    "exec",
    "shadcn",
    "init",
    "--defaults",
    "--name",
    "app",
    "--no-monorepo",
    "--cwd",
    workspace,
  ])
  await run("pnpm", [
    "exec",
    "shadcn",
    "add",
    `${registryUrl}/store-locator.json`,
    "--yes",
    "--cwd",
    app,
  ])
  await run("pnpm", ["exec", "next", "build"], { cwd: app })
  serve("pnpm", ["exec", "next", "start", "--port", String(appPort)], {
    cwd: app,
  })
  await waitFor(appUrl)
  // The map route compiles the map on its first request, which can take longer than the map
  // runtime waits for its manifest. Warm it up so this test checks the installed files, not
  // that first request.
  await waitFor(`${appUrl}/api/tileflow/manifest.json`)

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "light",
    })
    const errors = []
    page.on("pageerror", (error) => errors.push(String(error)))
    await page.goto(`${appUrl}/store-locator`)

    // The map goes back to loading whenever the block moves the camera, so keep the state
    // that the wait saw rather than reading it again.
    const settled = await page.waitForFunction(
      () => {
        const state = document
          .querySelector("[data-tileflow-state]")
          ?.getAttribute("data-tileflow-state")
        return state === "idle" || state === "error" ? state : false
      },
      undefined,
      { timeout: 60_000 }
    )
    const state = await settled.jsonValue()
    if (state !== "idle")
      throw new Error(
        `the map ended in the ${state} state:\n${errors.join("\n")}`
      )
    const pins = page.locator(
      // Markers inside a cluster are hidden; count what the visitor sees.
      ".tileflow-interaction-marker:visible, .tileflow-interaction-cluster:visible"
    )
    await pins.first().waitFor({ timeout: 30_000 })
    const lightTheme = await page
      .locator("[data-tileflow-theme]")
      .getAttribute("data-tileflow-theme")
    if (lightTheme?.startsWith("dark"))
      throw new Error(`light mode shows the ${lightTheme} map theme`)

    await page.evaluate(() => {
      document.documentElement.classList.remove("light")
      document.documentElement.classList.add("dark")
    })
    await page
      .locator('[data-tileflow-theme^="dark"]')
      .waitFor({ timeout: 30_000 })
    const darkTheme = await page
      .locator("[data-tileflow-theme]")
      .getAttribute("data-tileflow-theme")

    if (errors.length > 0) throw new Error(`page errors:\n${errors.join("\n")}`)
    console.log(
      `store-locator: idle with ${await pins.count()} markers or clusters; themes ${lightTheme} → ${darkTheme}`
    )
  } finally {
    await browser.close()
  }
} finally {
  stopServers()
  await rm(workspace, { recursive: true, force: true })
}
