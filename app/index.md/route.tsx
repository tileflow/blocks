import { homeMarkdown } from "@/gallery/markdown"
import { markdownResponse } from "@/gallery/markdown-response"

export const dynamic = "force-static"

// The home page shows the default item, so its Markdown is that item's page.
export async function GET() {
  return markdownResponse((await homeMarkdown()) ?? "")
}
