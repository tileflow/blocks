"use client"

import * as React from "react"

import type { MapThemeSettings } from "@/lib/map-theme"

// Design themes the gallery previews with. Each one is a set of shadcn tokens (gallery.css,
// [data-preset]) plus the map theme that suits it. They show that the items follow any app
// theme; none of them is installed.

export type PresetName = "default" | "soft" | "editorial" | "vivid"

export type Preset = {
  name: PresetName
  label: string
  /** Swatches for the picker: primary colour and map land, light then dark. */
  swatch: { light: [string, string]; dark: [string, string] }
  map: MapThemeSettings
}

export const presets: Preset[] = [
  { name: "default", label: "Default", swatch: { light: ["#171717", "#f3f2ef"], dark: ["#e5e5e5", "#1c1c1e"] }, map: {} },
  { name: "soft", label: "Soft", swatch: { light: ["#e0573d", "#f7efe6"], dark: ["#f28a6c", "#241c22"] }, map: { light: "dawn", dark: "dusk" } },
  { name: "editorial", label: "Editorial", swatch: { light: ["#111111", "#f4f4f4"], dark: ["#f5f5f5", "#161616"] }, map: { variant: "monochrome" } },
  { name: "vivid", label: "Vivid", swatch: { light: ["#6d28d9", "#f6f6fb"], dark: ["#8b5cf6", "#15141f"] }, map: { variant: "faded" } },
]

const storageKey = "tileflow-blocks-preset"

// The chosen preset lives in localStorage so it survives page changes and reloads; `chosen`
// keeps it for this visit when storage is unavailable.
let chosen: PresetName | null = null
const listeners = new Set<() => void>()

function readPreset(): PresetName {
  if (chosen) return chosen
  try {
    const stored = window.localStorage.getItem(storageKey)
    if (presets.some((preset) => preset.name === stored)) return stored as PresetName
  } catch {
    // Storage can be unavailable; the default preset is fine.
  }
  return "default"
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

function choosePreset(name: PresetName) {
  chosen = name
  try {
    window.localStorage.setItem(storageKey, name)
  } catch {
    // Not remembered across reloads; the choice still applies now.
  }
  for (const listener of listeners) listener()
}

/** The preset the viewer chose, and a way to change it. */
export function usePreset() {
  const name = React.useSyncExternalStore(subscribe, readPreset, () => "default" as const)
  return {
    preset: presets.find((preset) => preset.name === name) ?? presets[0],
    setPreset: choosePreset,
  }
}
