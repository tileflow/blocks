import { llmsFull } from "@/gallery/markdown"
import { markdownResponse } from "@/gallery/markdown-response"

export const dynamic = "force-static"

export async function GET() {
  return markdownResponse(await llmsFull(), "text/plain")
}
