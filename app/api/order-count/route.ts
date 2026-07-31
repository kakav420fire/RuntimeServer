import { NextResponse } from "next/server"
import { redis, ORDER_COUNT_KEY, STARTING_ORDERS } from "@/lib/redis"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const raw = await redis.get<number>(ORDER_COUNT_KEY)
    const count = typeof raw === "number" ? raw : STARTING_ORDERS
    return NextResponse.json({ count })
  } catch (err) {
    console.log("[v0] order-count GET error:", (err as Error).message)
    return NextResponse.json({ count: STARTING_ORDERS })
  }
}
