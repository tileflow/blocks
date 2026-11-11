// Everything the gallery lists: the registry items that exist and the ones still to build.
// Gallery only; nothing here is installed.

export type CatalogPhase = "built" | "soon" | "later"

export type CatalogItem = {
  /** The registry item name, and the gallery path /items/<name>. */
  name: string
  title: string
  phase: CatalogPhase
  description: string
  /** Why the item is worth building, shown while it is not built. */
  why?: string
  /** Items and packages it is built from. */
  uses: string[]
  /** The Tileflow API it calls with a key, if any. */
  keyedApi?: "Search" | "Routing" | "Elevation"
}

export type CatalogGroup = {
  title: string
  kind: string
  items: CatalogItem[]
}

const later = "Planned for a later release."

export const catalog: CatalogGroup[] = [
  {
    title: "Components",
    kind: "Component",
    items: [
      { name: "map", title: "Map", phase: "built", description: "The map container. It follows your app between light and dark with a transition instead of reloading the style.", uses: ["@tileflow/react", "@tileflow/maps"] },
      { name: "map-marker", title: "Marker", phase: "built", description: "Pins and price tags in your primary colour, with an active state for the selected or hovered item.", uses: ["map"] },
      { name: "map-popup", title: "Popup", phase: "built", description: "A card anchored to a marker. Focus, closing and screen-reader labels come from the map.", uses: ["map", "map-marker"] },
      { name: "map-tooltip", title: "Tooltip", phase: "soon", description: "A card on hover, with a tap fallback on touch screens.", why: "Listings and dashboards need a quick look at a place without opening a popup.", uses: ["map"] },
      { name: "map-controls", title: "Controls", phase: "built", description: "Zoom, compass, show my location and full screen, in your button style.", uses: ["map", "button"] },
      { name: "map-style-switcher", title: "Style switcher", phase: "soon", description: "Light, dark, faded, monochrome, dawn and dusk, and the other official maps, with an animated transition.", why: "Shows the designed themes that come with every map, switching without a reload.", uses: ["map"] },
      { name: "map-layer", title: "Layer", phase: "soon", description: "GeoJSON fill, line and circle layers from your data, with hover and click.", why: "The declarative way to put your own data on the map.", uses: ["map"] },
      { name: "map-route", title: "Route", phase: "soon", description: "A route line with progress and start and end markers.", why: "Delivery, logistics and travel. With Tileflow Routing it is a real calculated route.", uses: ["map", "map-marker"] },
      { name: "map-choropleth", title: "Choropleth and legend", phase: "soon", description: "Administrative boundaries coloured by a metric from your app, with a scale legend.", why: "Colours the boundaries that ship with the map by your own numbers. No GeoJSON to find or host.", uses: ["map"] },
      { name: "location-search", title: "Location search", phase: "soon", description: "An accessible combobox for places and addresses, backed by Tileflow Search.", why: "The location input apps ask for most, and the hardest to build well.", uses: ["@tileflow/search"], keyedApi: "Search" },
      { name: "static-map", title: "Static map", phase: "later", description: "A map image for cards, emails, social images and devices without WebGL, in the same theme as the interactive map.", why: later, uses: ["@tileflow/static"] },
      { name: "elevation-profile", title: "Elevation profile", phase: "later", description: "An elevation chart linked to a line on the map.", why: later, uses: ["@tileflow/elevation"], keyedApi: "Elevation" },
      { name: "map-heatmap", title: "Heatmap", phase: "later", description: "Point density for analytics and operations.", why: later, uses: ["map"] },
      { name: "map-3d", title: "3D", phase: "later", description: "A toggle for 3D buildings and terrain.", why: later, uses: ["map"] },
      { name: "map-sun", title: "Sun and night", phase: "later", description: "Time of day on the map: daylight, shadows and lit streets at night.", why: later, uses: ["map"] },
      { name: "map-locate-ip", title: "Locate by IP", phase: "later", description: "Opens the map near the visitor without a location prompt.", why: later, uses: ["@tileflow/geoip"] },
      { name: "map-compare", title: "Compare", phase: "later", description: "Two maps with a swipe divider.", why: later, uses: ["map"] },
      { name: "map-arc", title: "Arcs", phase: "later", description: "Origin to destination arcs.", why: later, uses: ["map"] },
      { name: "map-globe", title: "Globe", phase: "later", description: "The globe projection at low zoom.", why: later, uses: ["map"] },
      { name: "map-draw", title: "Draw", phase: "later", description: "Draw and edit zones.", why: later, uses: ["map"] },
    ],
  },
  {
    title: "Building blocks",
    kind: "Building block",
    items: [
      { name: "use-map-selection", title: "List and map sync", phase: "soon", description: "Keeps a list and the map in step: selection, hover, flying to an item and scrolling the list.", why: "Almost every map page pairs a list with the map. Today this lives inside the store locator.", uses: ["map", "map-marker"] },
      { name: "map-shell", title: "Map shell", phase: "soon", description: "A side panel that becomes a bottom sheet on phones, with a map and list toggle.", why: "Map pages rarely work well on phones. This makes the layout right by default.", uses: ["map"] },
      { name: "search-this-area", title: "Search this area", phase: "soon", description: "A button that appears when the map moves and asks for new results.", why: "The pattern every listing page with a map uses.", uses: ["map"] },
      { name: "map-kpi-overlay", title: "KPI overlay", phase: "soon", description: "Metric cards over the map.", why: "For territory and fleet dashboards.", uses: ["map"] },
      { name: "stop-list", title: "Stop list", phase: "later", description: "A reorderable list of stops with times and a summary.", why: later, uses: ["map-route"] },
      { name: "playback-controls", title: "Playback controls", phase: "later", description: "A timeline with speed and events for past trips.", why: later, uses: ["map-route"] },
    ],
  },
  {
    title: "Blocks",
    kind: "Block",
    items: [
      { name: "store-locator", title: "Store locator", phase: "built", description: "A searchable store list synced with the map, with filters, popups with directions and nearest first. Replace the sample stores with yours.", uses: ["map", "map-marker", "map-popup", "map-controls"] },
      { name: "listing-map", title: "Listing map", phase: "soon", description: "Listings with price tags, clusters, search this area and a bottom sheet on phones. Includes a property showcase variant.", why: "The page marketplaces, real estate and travel apps ask for most.", uses: ["map-marker", "map-popup", "search-this-area", "map-shell", "use-map-selection"] },
      { name: "territory-dashboard", title: "Territory dashboard", phase: "soon", description: "Regions coloured by your metrics, with a legend and KPI cards.", why: "Turns your numbers into a map of regions without any boundary data of your own.", uses: ["map-choropleth", "map-kpi-overlay"] },
      { name: "address-confirm", title: "Address confirm", phase: "soon", description: "Type an address, pick a suggestion and confirm the pin on the map.", why: "Any checkout or onboarding form with an address. Real search, at a clear cost.", uses: ["location-search", "map-marker"], keyedApi: "Search" },
      { name: "contact-map", title: "Contact map", phase: "soon", description: "A small where-to-find-us map in your theme.", why: "The smallest way to add a Tileflow map to any site.", uses: ["map", "map-marker"] },
      { name: "listing-detail", title: "Listing detail", phase: "later", description: "The map on a listing page, with nearby places by category and real walking times.", why: later, uses: ["location-search", "map-route"], keyedApi: "Search" },
      { name: "delivery-tracking", title: "Delivery tracking", phase: "later", description: "A live courier on a route with an arrival time.", why: later, uses: ["map-route", "map-marker", "map-shell"], keyedApi: "Routing" },
      { name: "route-planner", title: "Route planner", phase: "later", description: "Stops in the best order on a calculated route.", why: later, uses: ["map-route", "stop-list", "location-search"], keyedApi: "Routing" },
      { name: "fleet-dashboard", title: "Fleet dashboard", phase: "later", description: "Live vehicles with clusters, status and a detail card.", why: later, uses: ["map-marker", "map-kpi-overlay", "map-shell"] },
      { name: "route-activity", title: "Route activity", phase: "later", description: "A route with a synced elevation profile.", why: later, uses: ["map-route", "elevation-profile"], keyedApi: "Elevation" },
      { name: "nearby-places", title: "Nearby places", phase: "later", description: "A compact nearby places card to embed on a place page.", why: later, uses: ["location-search", "static-map"], keyedApi: "Search" },
      { name: "coverage-checker", title: "Coverage checker", phase: "later", description: "Do we deliver to your address? Search plus a service zone.", why: later, uses: ["location-search", "map-layer"], keyedApi: "Search" },
      { name: "zone-editor", title: "Zone editor", phase: "later", description: "Draw zones and export them as GeoJSON.", why: later, uses: ["map-draw"] },
      { name: "track-playback", title: "Track playback", phase: "later", description: "A past trip replayed on a timeline.", why: later, uses: ["map-route", "playback-controls"] },
      { name: "commute-search", title: "Commute search", phase: "later", description: "Listings within a travel time.", why: later, uses: ["location-search"], keyedApi: "Routing" },
    ],
  },
  {
    title: "Showcase",
    kind: "Showcase",
    items: [
      { name: "globe-arcs", title: "Globe and arcs", phase: "later", description: "A globe with arcs between cities in the dark theme.", why: later, uses: ["map-globe", "map-arc"] },
      { name: "city-3d-sun", title: "City in 3D", phase: "later", description: "A 3D city with a time slider: shadows by day, street lights at night.", why: later, uses: ["map-3d", "map-sun"] },
      { name: "map-through-time", title: "Map through time", phase: "later", description: "Swipe between today and an official historical map.", why: later, uses: ["map-compare"] },
      { name: "theme-gallery", title: "Theme gallery", phase: "later", description: "The same place in every theme and official map.", why: later, uses: ["map-style-switcher"] },
      { name: "seafloor", title: "Seafloor", phase: "later", description: "Depths and nautical charts.", why: later, uses: ["map"] },
    ],
  },
]

export const defaultItemName = "store-locator"

export function findCatalogItem(name: string) {
  for (const group of catalog) {
    const item = group.items.find((candidate) => candidate.name === name)
    if (item) return { group, item }
  }
  return null
}
