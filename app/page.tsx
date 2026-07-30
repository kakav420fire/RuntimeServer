import { Store } from "@/components/store"
import { redis, ORDER_COUNT_KEY, STARTING_ORDERS } from "@/lib/redis"

export const dynamic = "force-dynamic"

async function getInitialCount(): Promise<number> {
  try {
    const raw = await redis.get<number>(ORDER_COUNT_KEY)
    return typeof raw === "number" ? raw : STARTING_ORDERS
  } catch {
    return STARTING_ORDERS
  }
}

export default async function HomePage() {
  const initialCount = await getInitialCount()

  return (
    <main className="relative min-h-screen">
      {/* Minecraft background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url(/mc-background.png)" }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 bg-background/70" aria-hidden="true" />

      <Store initialCount={initialCount} />
    </main>
  )
}
