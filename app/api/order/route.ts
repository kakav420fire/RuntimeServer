import { NextResponse } from "next/server"
import { redis, ORDER_COUNT_KEY, STARTING_ORDERS } from "@/lib/redis"
import {
  getProduct,
  STACK_SIZE,
  MIN_STACKS,
  estimateDelivery,
  formatPrice,
} from "@/lib/products"

export const dynamic = "force-dynamic"

const WEBHOOK_URL =
  process.env.DISCORD_WEBHOOK_URL ||
  "https://discord.com/api/webhooks/1532279436353867796/rj__ySVJoxrGjTduwAmMNf1BRgJwCgfAbjNpYIW7oxaY18ceBsNRZhXsrqJUwU7mNs-J"

type OrderItem = { productId: string; stacks: number }

export async function POST(req: Request) {
  let body: {
    discordUsername?: string
    inGameName?: string
    notes?: string
    items?: OrderItem[]
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const discordUsername = (body.discordUsername || "").trim()
  const inGameName = (body.inGameName || "").trim()
  const notes = (body.notes || "").trim().slice(0, 500)

  if (!discordUsername || discordUsername.length > 64) {
    return NextResponse.json(
      { error: "A valid Discord username is required." },
      { status: 400 },
    )
  }
  if (!inGameName || inGameName.length > 32) {
    return NextResponse.json(
      { error: "A valid in-game name is required." },
      { status: 400 },
    )
  }

  const rawItems = Array.isArray(body.items) ? body.items : []

  // Validate + recompute totals server-side (never trust client prices).
  const lines: {
    name: string
    stacks: number
    quantity: number
    lineTotal: number
  }[] = []
  let total = 0
  let totalStacks = 0

  for (const item of rawItems) {
    const product = getProduct(item?.productId)
    if (!product) continue

    const stacks = Number(item?.stacks)
    if (!Number.isFinite(stacks) || stacks <= 0) continue

    // Enforce 0.5-stack minimum and 0.5-stack increments; cap per line.
    if (stacks < MIN_STACKS) {
      return NextResponse.json(
        { error: `Minimum order is ${MIN_STACKS} stacks per item.` },
        { status: 400 },
      )
    }
    const roundedStacks = Math.round(stacks * 2) / 2 // snap to 0.5
    if (roundedStacks > 200) {
      return NextResponse.json(
        { error: "That's too many stacks for one order." },
        { status: 400 },
      )
    }

    const quantity = Math.round(roundedStacks * STACK_SIZE)
    const lineTotal = quantity * product.pricePerItem
    total += lineTotal
    totalStacks += roundedStacks
    lines.push({ name: product.name, stacks: roundedStacks, quantity, lineTotal })
  }

  if (lines.length === 0) {
    return NextResponse.json(
      { error: "Your order is empty. Add at least one item." },
      { status: 400 },
    )
  }

  const delivery = estimateDelivery(totalStacks)

  // Increment the global order counter.
  let count = STARTING_ORDERS
  try {
    const exists = await redis.exists(ORDER_COUNT_KEY)
    if (!exists) {
      await redis.set(ORDER_COUNT_KEY, STARTING_ORDERS)
    }
    count = await redis.incr(ORDER_COUNT_KEY)
  } catch (err) {
    console.log("[v0] order incr error:", (err as Error).message)
  }

  // Build Discord webhook payload.
  const fields = lines.map((l) => ({
    name: l.name,
    value: `${l.stacks} stack(s) — ${l.quantity} items — ${formatPrice(l.lineTotal)}`,
    inline: false,
  }))

  const embed = {
    title: "New XP Store Order",
    color: 0x5fbf4a,
    fields: [
      { name: "Discord", value: discordUsername, inline: true },
      { name: "In-Game Name", value: inGameName, inline: true },
      { name: "Delivery To", value: "c410-c1", inline: true },
      ...fields,
      { name: "Total", value: formatPrice(total), inline: true },
      { name: "Est. Delivery", value: delivery, inline: true },
      { name: "Order #", value: `#${count}`, inline: true },
      ...(notes ? [{ name: "Notes", value: notes, inline: false }] : []),
    ],
    footer: { text: "Democracy Craft XP Store" },
    timestamp: new Date().toISOString(),
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "DC XP Store",
        embeds: [embed],
      }),
    })
    if (!res.ok) {
      console.log("[v0] webhook non-ok status:", res.status)
    }
  } catch (err) {
    console.log("[v0] webhook error:", (err as Error).message)
  }

  return NextResponse.json({
    ok: true,
    orderNumber: count,
    total,
    delivery,
    totalStacks,
  })
}
