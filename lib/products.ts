export type Product = {
  id: string
  name: string
  pricePerItem: number
  minStacks: number
  emojiFallback: string
  color: string
  blurb: string
}

export const STACK_SIZE = 64
export const MIN_STACKS = 0.5

// ── High demand mode ────────────────────────────────────────────────
// Set HIGH_DEMAND to true when we're sold/bought out. It caps every bulk
// order at MAX_STACKS_HIGH_DEMAND stacks per item and shows a notice banner.
export const HIGH_DEMAND = true
export const MAX_STACKS_HIGH_DEMAND = 2

// Products available to order in bulk online.
export const PRODUCTS: Product[] = [
  {
    id: "xp_bottle",
    name: "XP Bottle",
    pricePerItem: 6.3,
    minStacks: 0.5,
    emojiFallback: "XP",
    color: "#5fbf4a",
    blurb: "Bottles o' Enchanting. Sold in bulk for fast leveling.",
  },
  {
    id: "honey_bottle",
    name: "Honey Bottle",
    pricePerItem: 1.12,
    minStacks: 1,
    emojiFallback: "HN",
    color: "#e0a92e",
    blurb: "Sweet, restorative honey bottles straight from the hive.",
  },
]

// Extra items we also stock — mentioned only, buy them in-store.
export const ALSO_AVAILABLE: Product[] = [
  {
    id: "bonemeal",
    name: "Bonemeal",
    pricePerItem: 0.2,
    minStacks: 0.5,
    emojiFallback: "BM",
    color: "#f4ecd8",
    blurb: "Grow your farms in a flash. Cheapest bulk in town.",
  },
  {
    id: "white_dye",
    name: "White Dye",
    pricePerItem: 1,
    minStacks: 0.5,
    emojiFallback: "WD",
    color: "#ffffff",
    blurb: "Pure white dye for banners, wool, and builds.",
  },
]

export function getProduct(id: string) {
  return [...PRODUCTS, ...ALSO_AVAILABLE].find((p) => p.id === id)
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
