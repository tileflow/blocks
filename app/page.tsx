import Link from "next/link"

import registry from "@/registry.json"

// Every registry item, so a reviewer can open each one. Blocks link to their page; components
// link to the map preview until each has its own gallery page.
const pages: Record<string, string> = {
  "store-locator": "/store-locator",
}

export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 p-6 md:p-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tileflow Blocks
        </h1>
        <p className="text-sm text-muted-foreground">
          Preview of every registry item. Press <kbd>d</kbd> to switch between
          light and dark.
        </p>
      </header>
      <ul className="divide-y rounded-lg border">
        {registry.items.map((item) => (
          <li key={item.name}>
            <Link
              href={pages[item.name] ?? "/preview/map"}
              className="flex flex-col gap-1 p-4 hover:bg-muted/50"
            >
              <span className="flex items-center gap-2 font-medium">
                {item.title}
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                  {item.type.replace("registry:", "")}
                </span>
              </span>
              <span className="text-sm text-muted-foreground">
                {item.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
