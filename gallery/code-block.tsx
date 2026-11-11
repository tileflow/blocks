import { CopyButton } from "@/gallery/controls"
import { tokenizeCodeLine, type CodeTokenKind } from "@/gallery/code-tokens"

// Code in the tileflow.dev palette, highlighted at build time so it is in the HTML. Gallery only.

const tokenClass: Record<Exclude<CodeTokenKind, "plain">, string> = {
  comment: "text-(--site-code-comment) italic",
  function: "text-(--site-code-function)",
  keyword: "text-(--site-code-keyword) font-semibold",
  number: "text-(--site-code-number)",
  property: "text-(--site-code-property)",
  string: "text-(--site-code-string)",
}

export function HighlightedCode({ code }: { code: string }) {
  const lines = code.replace(/\n$/, "").split("\n")
  return (
    <pre className="overflow-auto p-5 font-mono text-[13px] leading-[1.68]">
      <code>
        {lines.map((line, index) => (
          // The newline stays in the text, so copying the code or reading the page as text keeps
          // the lines.
          <span key={index} className="block min-h-[1.68em]">
            {tokenizeCodeLine(line).map((token, tokenIndex) =>
              token.kind === "plain" ? (
                token.text
              ) : (
                <span key={tokenIndex} className={tokenClass[token.kind]}>
                  {token.text}
                </span>
              )
            )}
            {index < lines.length - 1 ? "\n" : null}
          </span>
        ))}
      </code>
    </pre>
  )
}

export function CodeBlock({ label, code, maxHeight = true }: { label: string; code: string; maxHeight?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-(--site-code-rule) bg-(--site-code) text-(--site-code-fg)">
      <figcaption className="flex min-h-11 items-center justify-between gap-3 border-b border-(--site-code-rule) py-1.5 pr-1.5 pl-4 font-mono text-xs text-(--site-code-muted)">
        <span className="min-w-0 truncate">{label}</span>
        <CopyButton text={code} label={`Copy ${label}`} />
      </figcaption>
      <div className={maxHeight ? "max-h-[32rem] overflow-auto" : undefined}>
        <HighlightedCode code={code} />
      </div>
    </figure>
  )
}
