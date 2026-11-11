import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter, Newsreader, Nunito } from "next/font/google"

import "./globals.css"
import "@/gallery/gallery.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

// The gallery's design presets preview the items in these fonts.
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" })
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Tileflow Blocks",
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased font-sans",
        geist.variable,
        fontMono.variable,
        nunito.variable,
        newsreader.variable,
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
