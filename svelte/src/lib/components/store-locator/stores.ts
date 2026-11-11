// Sample stores. Replace them with your own data: from your database, an API
// route or a CMS. Each store needs a stable id and [longitude, latitude].

export type StoreCategory = "Flagship" | "Café" | "Pickup point"

export type Store = {
  id: string
  name: string
  category: StoreCategory
  address: string
  city: string
  coordinates: [number, number]
  hours: string
  phone: string
}

export const storeCategories: StoreCategory[] = ["Flagship", "Café", "Pickup point"]

export const stores: Store[] = [
  { id: "sol", name: "Sol Flagship", category: "Flagship", address: "Calle de Preciados 12", city: "Madrid", coordinates: [-3.7056, 40.4189], hours: "9:00–21:00", phone: "+34 910 000 001" },
  { id: "malasana", name: "Malasaña", category: "Café", address: "Calle del Espíritu Santo 8", city: "Madrid", coordinates: [-3.7046, 40.4252], hours: "8:00–20:00", phone: "+34 910 000 002" },
  { id: "chamberi", name: "Chamberí", category: "Café", address: "Calle de Fuencarral 141", city: "Madrid", coordinates: [-3.7019, 40.4329], hours: "8:00–20:00", phone: "+34 910 000 003" },
  { id: "salamanca", name: "Salamanca Flagship", category: "Flagship", address: "Calle de Serrano 47", city: "Madrid", coordinates: [-3.6871, 40.4269], hours: "10:00–21:00", phone: "+34 910 000 004" },
  { id: "retiro", name: "Retiro", category: "Café", address: "Calle de Ibiza 23", city: "Madrid", coordinates: [-3.6745, 40.4185], hours: "8:30–20:00", phone: "+34 910 000 005" },
  { id: "lavapies", name: "Lavapiés", category: "Café", address: "Calle de Argumosa 9", city: "Madrid", coordinates: [-3.6989, 40.4087], hours: "8:00–19:30", phone: "+34 910 000 006" },
  { id: "atocha", name: "Atocha Station", category: "Pickup point", address: "Plaza del Emperador Carlos V 2", city: "Madrid", coordinates: [-3.6908, 40.4066], hours: "6:30–22:30", phone: "+34 910 000 007" },
  { id: "chamartin", name: "Chamartín Station", category: "Pickup point", address: "Calle de Agustín de Foxá 2", city: "Madrid", coordinates: [-3.6823, 40.4722], hours: "6:30–22:30", phone: "+34 910 000 008" },
  { id: "castellana", name: "Castellana", category: "Café", address: "Paseo de la Castellana 95", city: "Madrid", coordinates: [-3.6918, 40.4486], hours: "7:30–19:00", phone: "+34 910 000 009" },
  { id: "arguelles", name: "Argüelles", category: "Café", address: "Calle de la Princesa 60", city: "Madrid", coordinates: [-3.7175, 40.4302], hours: "8:00–20:00", phone: "+34 910 000 010" },
  { id: "latina", name: "La Latina", category: "Café", address: "Calle de la Cava Baja 20", city: "Madrid", coordinates: [-3.7088, 40.4118], hours: "9:00–21:00", phone: "+34 910 000 011" },
  { id: "usera", name: "Usera", category: "Pickup point", address: "Calle de Marcelo Usera 70", city: "Madrid", coordinates: [-3.7066, 40.3888], hours: "9:00–20:00", phone: "+34 910 000 012" },
  { id: "tetuan", name: "Tetuán", category: "Pickup point", address: "Calle de Bravo Murillo 280", city: "Madrid", coordinates: [-3.7008, 40.4596], hours: "9:00–20:00", phone: "+34 910 000 013" },
  { id: "moncloa", name: "Moncloa", category: "Café", address: "Calle de Isaac Peral 4", city: "Madrid", coordinates: [-3.7155, 40.4358], hours: "7:30–20:00", phone: "+34 910 000 014" },
  { id: "pozuelo", name: "Pozuelo", category: "Flagship", address: "Avenida de Europa 21", city: "Pozuelo de Alarcón", coordinates: [-3.7887, 40.4462], hours: "10:00–22:00", phone: "+34 910 000 015" },
  { id: "alcobendas", name: "Alcobendas", category: "Pickup point", address: "Avenida de Bruselas 15", city: "Alcobendas", coordinates: [-3.6413, 40.5307], hours: "9:00–21:00", phone: "+34 910 000 016" },
]
