import { defineMap } from "@tileflow/core"
import { streets } from "@tileflow/maps"

// The map your <tileflow-map> elements draw. Edit it like any other source file:
// change the view, extend another official map, or add your own layers.
export default defineMap({
  id: "app",
  name: "App map",
  version: 1,
  extends: streets,
  view: { center: [-3.7038, 40.4168], zoom: 11 },
})
