import { catalog, defaultItemName } from "@/gallery/catalog"
import { itemDetails, type SourceFile } from "@/gallery/sources"
import { installCommand, itemMarkdownPath, registryLive, requirements, siteOrigin } from "@/gallery/site"

// The Markdown versions of the gallery, for agents: one page per item, /llms.txt and
// /llms-full.txt. Each page carries the same content as its HTML page. Gallery only.

const indexDirective = `> For the index of every Tileflow Blocks item, see [llms.txt](${siteOrigin}/llms.txt).`

export const preRelease =
  "Pre-release: the registry is not served at tileflow.dev/r yet, so the install command works once it is."

const languages: Record<string, string> = { ".tsx": "tsx", ".ts": "ts", ".json": "json", ".css": "css" }

function fence(code: string, language: string) {
  const longest = Math.max(0, ...[...code.matchAll(/`+/g)].map((match) => match[0].length))
  const ticks = "`".repeat(Math.max(3, longest + 1))
  return `${ticks}${language}\n${code.replace(/\n$/, "")}\n${ticks}`
}

const codeFence = (file: SourceFile) => fence(file.content, languages[file.path.slice(file.path.lastIndexOf("."))] ?? "")

const absolute = (name: string) => `${siteOrigin}${itemMarkdownPath(name)}`

export function statusSentence(phase: "soon" | "later") {
  return phase === "soon"
    ? "Coming soon. It is not built yet, so there is nothing to install."
    : "Planned for a later release. It is not built yet, so there is nothing to install."
}

export function addsSentence(files: SourceFile[], dependencies: string[]) {
  const list = files.map((file) => `\`${file.path}\``).join(", ")
  const packages = dependencies.length ? ` and installs ${dependencies.map((name) => `\`${name}\``).join(", ")}` : ""
  return `The command adds ${list}${packages}. It also adds the items this one is built from, if your project does not have them.`
}

export async function itemMarkdown(name: string): Promise<string | null> {
  const details = await itemDetails(name)
  if (!details) return null
  const { group, item } = details
  const lines: string[] = [`# ${item.title}`, "", indexDirective, "", item.description, ""]
  const kind = `Type: ${group.kind.toLowerCase()}.`
  lines.push(item.keyedApi ? `${kind} Uses a Tileflow API key for ${item.keyedApi}.` : kind, "")

  if (item.phase !== "built") {
    lines.push(`**Status:** ${statusSentence(item.phase)}`, "")
    if (item.phase === "soon" && item.why) lines.push(item.why, "")
  } else {
    lines.push("## Install", "")
    if (!registryLive) lines.push(`> ${preRelease}`, "")
    lines.push("Run this command in the root of your project:", "", fence(installCommand(item.name), "bash"), "")
    lines.push(addsSentence(details.files, details.dependencies), "")
    lines.push(`Requirements: ${requirements}`, "")
    if (details.docs) lines.push(details.docs, "")
    if (details.example) {
      lines.push("## Usage", "", `This example is the one the gallery preview draws.`, "", codeFence(details.example), "")
    }
    lines.push("## Source", "", "The files the command adds, as they are installed.", "")
    for (const file of details.files) lines.push(`### \`${file.path}\``, "", codeFence(file), "")
  }

  if (details.uses.length) {
    lines.push(item.phase === "built" ? "## Built from" : "## Will be built from", "")
    for (const use of details.uses) {
      lines.push(
        use.inCatalog
          ? `- [${use.title}](${absolute(use.name)}): ${use.description}`
          : `- \`${use.name}\`${use.name.startsWith("@") ? ": npm package." : ": shadcn/ui component."}`
      )
    }
    lines.push("")
  }
  return lines.join("\n").replace(/\n+$/, "\n")
}

export function llmsIndex(): string {
  const lines = [
    "# Tileflow Blocks",
    "",
    "> Map components and blocks for React and Next.js apps that use shadcn/ui. You install each item with the shadcn CLI, the files land in your project, and the map follows your shadcn theme.",
    "",
    `Install an item by running its command in the root of your project. Each page below has the command, a usage example and the full source of every file it adds. Requirements: ${requirements}`,
    "",
    registryLive ? "" : `${preRelease}`,
    "",
  ]
  for (const group of catalog) {
    const built = group.items.filter((item) => item.phase === "built")
    if (!built.length) continue
    lines.push(`## ${group.title}`, "")
    for (const item of built) lines.push(`- [${item.title}](${absolute(item.name)}): ${item.description}`)
    lines.push("")
  }
  lines.push("## Not built yet", "", "These items are planned. They have no install command yet.", "")
  for (const group of catalog) {
    for (const item of group.items.filter((candidate) => candidate.phase !== "built")) {
      lines.push(`- [${item.title}](${absolute(item.name)}): ${group.kind}. ${item.description}`)
    }
  }
  lines.push("", "## Optional", "", `- [Every built item in one file](${siteOrigin}/llms-full.txt): the pages above with all their source, for agents that read everything at once.`, "")
  return lines.join("\n").replace(/\n{3,}/g, "\n\n")
}

export async function llmsFull(): Promise<string> {
  const pages = await Promise.all(
    catalog.flatMap((group) => group.items.filter((item) => item.phase === "built").map((item) => itemMarkdown(item.name)))
  )
  const header = [
    "# Tileflow Blocks: every built item",
    "",
    indexDirective,
    "",
    `Requirements: ${requirements}`,
    "",
    registryLive ? "" : preRelease,
    "",
  ].join("\n")
  // Each page starts with an H1; nest them under this file's own H1.
  const body = pages
    .filter((page): page is string => page !== null)
    .map((page) => nestHeadings(page.replace(`\n${indexDirective}\n`, "\n")))
    .join("\n")
  return `${header.replace(/\n{3,}/g, "\n\n")}\n${body}`
}

/** Moves every heading one level down, leaving code blocks alone. */
function nestHeadings(page: string) {
  let fenceMarker: string | null = null
  return page
    .split("\n")
    .map((line) => {
      const opening = line.match(/^(`{3,})/)
      if (opening) {
        if (fenceMarker === null) fenceMarker = opening[1]
        else if (line.startsWith(fenceMarker) && line.trim() === line.trim().replace(/[^`]/g, "")) fenceMarker = null
        return line
      }
      return fenceMarker === null && /^#{1,5} /.test(line) ? `#${line}` : line
    })
    .join("\n")
}

export const homeMarkdown = () => itemMarkdown(defaultItemName)
