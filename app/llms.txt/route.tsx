import { llmsIndex } from "@/gallery/markdown"
import { markdownResponse } from "@/gallery/markdown-response"

export const dynamic = "force-static"

export function GET() {
  return markdownResponse(llmsIndex(), "text/plain")
}
