// The tokenizer tileflow.dev uses for its code blocks (apps/web/app/_components/code-tokens.ts),
// so code here reads the same as on the site. Gallery only.

export type CodeTokenKind = "comment" | "function" | "keyword" | "number" | "plain" | "property" | "string"

export type CodeToken = Readonly<{ kind: CodeTokenKind; text: string }>

const keywords = new Set([
  "as", "async", "await", "catch", "class", "const", "default", "else", "export", "extends", "false",
  "for", "from", "function", "if", "import", "interface", "let", "new", "null", "private", "public",
  "readonly", "return", "satisfies", "throw", "true", "try", "type", "undefined", "var", "while",
])

const tokenPattern =
  /(\/\/.*|#.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:as|async|await|catch|class|const|default|else|export|extends|false|for|from|function|if|import|interface|let|new|null|private|public|readonly|return|satisfies|throw|true|try|type|undefined|var|while)\b|-?\b\d+(?:\.\d+)?\b|\b[A-Z][A-Z0-9_]+\b|\b[A-Za-z_$][\w$]*(?=\s*[:(]))/g

export function tokenizeCodeLine(line: string): readonly CodeToken[] {
  const tokens: CodeToken[] = []
  let cursor = 0
  for (const match of line.matchAll(tokenPattern)) {
    const text = match[0]
    const index = match.index ?? 0
    if (index > cursor) tokens.push({ kind: "plain", text: line.slice(cursor, index) })
    tokens.push({ kind: readTokenKind(text, line, index), text })
    cursor = index + text.length
  }
  if (cursor < line.length) tokens.push({ kind: "plain", text: line.slice(cursor) })
  return tokens
}

function readTokenKind(token: string, line: string, index: number): CodeTokenKind {
  if (token.startsWith("//") || token.startsWith("#")) return "comment"
  if (/^\s*:/.test(line.slice(index + token.length))) return "property"
  if (token.startsWith('"') || token.startsWith("'") || token.startsWith("`")) return "string"
  if (keywords.has(token)) return "keyword"
  if (/^-?\d/.test(token)) return "number"
  if (/^[A-Z][A-Z0-9_]+$/.test(token)) return "property"
  return "function"
}
