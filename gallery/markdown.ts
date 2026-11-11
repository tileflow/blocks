import { catalog, defaultItemName } from "@/gallery/catalog"
import { itemDetails, type ItemDetails, type SourceFile } from "@/gallery/sources"
import { itemMarkdownPath, registryItemUrl, registryLive, siteOrigin } from "@/gallery/site"
import { liveStacks, soonStacks, type Stack, type StackId } from "@/gallery/stacks"

// The Markdown versions of the gallery, for agents: one page per item and stack, /llms.txt and
// /llms-full.txt. Each page carries the same content as its HTML page. Gallery only.

const indexDirective = `> For the index of every Tileflow Blocks item, see [llms.txt](${siteOrigin}/llms.txt).`

export const preRelease =
  "Pre-release: the registry is not served at tileflow.dev/r yet, so the install command works once it is."

function fence(code: string, language: string) {
  const longest = Math.max(0, ...[...code.matchAll(/`+/g)].map((match) => match[0].length))
  const ticks = "`".repeat(Math.max(3, longest + 1))
  return `${ticks}${language}\n${code.replace(/\n$/, "")}\n${ticks}`
}

const codeFence = (file: SourceFile) => fence(file.content, file.language)

const absolute = (name: string, stack?: StackId) => `${siteOrigin}${itemMarkdownPath(name, stack)}`

export const installCommand = (stack: Stack, name: string) => stack.install?.(registryItemUrl(stack.id, name)) ?? ""

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

export const setupSentence = "Set up the map once per project, for your framework:"

export const usageSentence = (stack: Stack) =>
  stack.default ? "This example is the one the gallery preview draws." : `This example draws the same map as the gallery preview, in ${stack.label}.`

/** One line naming the item in every stack, for agents choosing the variant to install. */
export function stacksSentence<Link>(details: ItemDetails, link: (name: string, stack: Stack) => Link): (string | Link)[] {
  const others = details.stacks.filter((entry) => entry.available && entry.stack.id !== details.stack.id).map((entry) => entry.stack)
  const parts: (string | Link)[] = []
  if (others.length) {
    parts.push("Also for ")
    others.forEach((stack, index) => parts.push(...(index ? [", "] : []), link(details.item.name, stack)))
    parts.push(". ")
  }
  parts.push(`Coming soon for ${soonStacks.map((stack) => stack.label).join(" and ")}.`)
  return parts
}

export async function itemMarkdown(name: string, stackId?: StackId): Promise<string | null> {
  const details = await itemDetails(name, stackId)
  if (!details || (stackId && !details.available)) return null
  const { group, item, stack } = details
  const title = stack.default ? item.title : `${item.title} for ${stack.label}`
  const lines: string[] = [`# ${title}`, "", indexDirective, "", item.description, ""]
  const kind = `Type: ${group.kind.toLowerCase()}.`
  lines.push(item.keyedApi ? `${kind} Uses a Tileflow API key for ${item.keyedApi}.` : kind, "")

  if (item.phase !== "built") {
    lines.push(`**Status:** ${statusSentence(item.phase)}`, "")
    if (item.phase === "soon" && item.why) lines.push(item.why, "")
  } else {
    lines.push(`Stack: ${stack.label}. ${stack.summary} ${stacksSentence(details, (other, candidate) => `[${candidate.label}](${absolute(other, candidate.id)})`).join("")}`, "")
    lines.push("## Install", "")
    if (!registryLive) lines.push(`> ${preRelease}`, "")
    lines.push("Run this command in the root of your project:", "", fence(installCommand(stack, item.name), "bash"), "")
    lines.push(addsSentence(details.files, details.dependencies), "")
    if (stack.setup?.length) {
      lines.push(setupSentence, "")
      for (const step of stack.setup) {
        lines.push(`### ${step.title}`, "", step.text, "")
        if (step.command) lines.push(fence(step.command, "bash"), "")
        if (step.code) lines.push(fence(step.code.content, step.code.language), "")
      }
    }
    if (stack.requirements) lines.push(`Requirements: ${stack.requirements}`, "")
    if (details.docs) lines.push(details.docs, "")
    if (details.example) lines.push("## Usage", "", usageSentence(stack), "", codeFence(details.example), "")
    lines.push("## Source", "", "The files the command adds, as they are installed.", "")
    for (const file of details.files) lines.push(`### \`${file.path}\``, "", codeFence(file), "")
  }

  if (details.uses.length) {
    lines.push(item.phase === "built" ? "## Built from" : "## Will be built from", "")
    for (const use of details.uses) {
      lines.push(
        use.inCatalog
          ? `- [${use.title}](${absolute(use.name, item.phase === "built" ? stack.id : undefined)}): ${use.description}`
          : `- \`${use.name}\`${use.name.startsWith("@") ? ": npm package." : `: ${stack.channel ?? "shadcn"} component.`}`
      )
    }
    lines.push("")
  }
  return lines.join("\n").replace(/\n+$/, "\n")
}

const builtItems = () => catalog.flatMap((group) => group.items.filter((item) => item.phase === "built"))

export function llmsIndex(): string {
  const lines = [
    "# Tileflow Blocks",
    "",
    `> Map components and blocks that you install into your app with the shadcn CLI of your framework. The files land in your project and the map follows your theme. Available for ${liveStacks.map((stack) => stack.label).join(" and ")}; coming soon for ${soonStacks.map((stack) => stack.label).join(" and ")}.`,
    "",
    "Pick the section for your project's framework and install an item by running its command in the root of your project. Each page has the command, the one-time map setup, a usage example and the full source of every file it adds.",
    "",
    registryLive ? "" : `${preRelease}`,
    "",
  ]
  for (const stack of liveStacks) {
    lines.push(`## ${stack.label}`, "", `${stack.summary} Requirements: ${stack.requirements}`, "")
    for (const group of catalog) {
      for (const item of group.items.filter((candidate) => candidate.phase === "built")) {
        lines.push(`- [${item.title}](${absolute(item.name, stack.id)}): ${group.kind}. ${item.description}`)
      }
    }
    lines.push("")
  }
  lines.push("## Coming soon", "", ...soonStacks.map((stack) => `- ${stack.label}: ${stack.summary}`), "")
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
  const header = ["# Tileflow Blocks: every built item", "", indexDirective, "", registryLive ? "" : preRelease, ""].join("\n")
  const sections: string[] = []
  for (const stack of liveStacks) {
    const pages = await Promise.all(builtItems().map((item) => itemMarkdown(item.name, stack.id)))
    // Each page starts with an H1; nest them under the stack's H2, below this file's own H1.
    const body = pages
      .filter((page): page is string => page !== null)
      .map((page) => nestHeadings(nestHeadings(page.replace(`\n${indexDirective}\n`, "\n"))))
      .join("\n")
    sections.push(`## ${stack.label}\n\n${stack.summary} Requirements: ${stack.requirements}\n\n${body}`)
  }
  return `${header.replace(/\n{3,}/g, "\n\n")}\n${sections.join("\n")}`
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
