export type Product = {
  id: string
  name: string
  pricePerItem: number
  emojiFallback: string
  color: string
  blurb: string
}

export const STACK_SIZE = 64
export const MIN_STACKS = 0.5

export const PRODUCTS: Product[] = [
  {
    id: "xp_bottle",
    name: "XP Bottle",
    pricePerItem: 6.3,
    emojiFallback: "XP",
    color: "#5fbf4a",
    blurb: "Bottles o' Enchanting. Sold in bulk for fast leveling.",
  },
  {
    id: "honey_bottle",
    name: "Honey Bottle",
    pricePerItem: 1,
    emojiFallback: "HN",
    color: "#e0a92e",
    blurb: "Sweet, restorative honey bottles straight from the hive.",
  },
  {
    id: "bonemeal",
    name: "Bonemeal",
    pricePerItem: 0.2,
    emojiFallback: "BM",
    color: "#f4ecd8",
    blurb: "Grow your farms in a flash. Cheapest bulk in town.",
  },
  {
    id: "white_dye",
    name: "White Dye",
    pricePerItem: 1,
    emojiFallback: "WD",
    color: "#ffffff",
    blurb: "Pure white dye for banners, wool, and builds.",
  },
]

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id)
}

// Delivery estimate based on number of stacks ordered.
export function estimateDelivery(stacks: number): string {
  if (stacks <= 1) return "~1.5 days"
  if (stacks <= 5) return "2-3 days"
  return "3+ days"
}

export function formatPrice(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
