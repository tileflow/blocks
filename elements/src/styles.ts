import maplibreCss from "maplibre-gl/dist/maplibre-gl.css?inline"
import elementsCss from "./styles.css?inline"

// MapLibre's stylesheet sits in a sublayer, so the element rules beat it without !important, and
// both sit in the tileflow layer, so the page's own rules beat them.
const css = `@layer tileflow { @layer maplibre { ${maplibreCss} } }\n${elementsCss}`

const styled = new WeakSet<Document>()

/** Adds the stylesheet to a document once. */
export function adoptStyles(document: Document) {
  if (styled.has(document)) return
  styled.add(document)
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(css)
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
}
