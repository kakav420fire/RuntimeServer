"use client"

import { useMemo, useState } from "react"
import {
  PRODUCTS,
  ALSO_AVAILABLE,
  STACK_SIZE,
  MIN_STACKS,
  estimateDelivery,
  formatPrice,
} from "@/lib/products"
import { ItemIcon } from "./item-icon"
import { OrderCounter } from "./order-counter"
import { Particles } from "./particles"
import { MusicPlayer } from "./music-player"

type Cart = Record<string, number> // productId -> stacks

export function Store({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState<number>(initialCount)
  const [cart, setCart] = useState<Cart>({})
  const [discordUsername, setDiscordUsername] = useState("")
  const [inGameName, setInGameName] = useState("")
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [lastOrder, setLastOrder] = useState<{ orderNumber: number; total: number; delivery: string } | null>(null)

  function setStacks(productId: string, stacks: number) {
    setCart((prev) => {
      const next = { ...prev }
      if (stacks <= 0) {
        delete next[productId]
      } else {
        next[productId] = stacks
      }
      return next
    })
  }

  const lines = useMemo(() => {
    return Object.entries(cart)
      .map(([id, stacks]) => {
        const product = PRODUCTS.find((p) => p.id === id)
        if (!product) return null
        const quantity = Math.round(stacks * STACK_SIZE)
        const lineTotal = quantity * product.pricePerItem
        return { product, stacks, quantity, lineTotal }
      })
      .filter(Boolean) as {
      product: (typeof PRODUCTS)[number]
      stacks: number
      quantity: number
      lineTotal: number
    }[]
  }, [cart])

  const total = lines.reduce((sum, l) => sum + l.lineTotal, 0)
  const totalStacks = lines.reduce((sum, l) => sum + l.stacks, 0)
  const delivery = totalStacks > 0 ? estimateDelivery(totalStacks) : "—"
  const hasItems = lines.length > 0

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!hasItems) {
      setStatus("error")
      setMessage("Add at least one item to your order.")
      return
    }
    setStatus("submitting")
    setMessage("")

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discordUsername,
          inGameName,
          notes,
          items: lines.map((l) => ({ productId: l.product.id, stacks: l.stacks })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus("error")
        setMessage(data.error || "Something went wrong. Please try again.")
        return
      }
      setStatus("success")
      setCount(data.orderNumber)
      setLastOrder({ orderNumber: data.orderNumber, total: data.total, delivery: data.delivery })
      setCart({})
      setNotes("")
    } catch {
      setStatus("error")
      setMessage("Network error. Please try again.")
    }
  }

  return (
    <>
      <Particles />
      <MusicPlayer />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8">
      {/* Header */}
      <header className="mb-8 flex flex-col items-center gap-4 text-center">
        <div className="mc-panel px-6 py-5">
          <h1 className="text-4xl text-primary text-shadow-mc md:text-6xl">
            Democracy Craft XP Store
          </h1>
          <p className="mt-2 text-xl text-muted-foreground md:text-2xl">
            Bulk XP bottles · order more than you can carry from{" "}
            <span className="text-accent">c410-c1</span>
          </p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Our shop at c410-c1 is for in-person buys. This site is for big bulk
            orders you can&apos;t easily grab in-store.
          </p>
        </div>
        <OrderCounter count={count} />
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Products */}
        <section className="lg:col-span-2" aria-labelledby="shop-heading">
          <h2 id="shop-heading" className="mb-4 text-3xl text-accent text-shadow-mc">
            XP Bottles
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {PRODUCTS.map((product) => {
              const stacks = cart[product.id] ?? 0
              const quantity = Math.round(stacks * STACK_SIZE)
              return (
                <article key={product.id} className="mc-panel flex flex-col gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <ItemIcon label={product.emojiFallback} color={product.color} />
                    <div className="min-w-0">
                      <h3 className="text-2xl text-primary-foreground leading-tight">
                        <span className="text-foreground">{product.name}</span>
                      </h3>
                      <p className="text-lg text-accent">
                        {formatPrice(product.pricePerItem)}
                        <span className="text-muted-foreground"> / item</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {product.blurb}
                  </p>

                  {/* Stack stepper */}
                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Remove half stack of ${product.name}`}
                        onClick={() => setStacks(product.id, Math.max(0, Math.round((stacks - 0.5) * 2) / 2))}
                        className="mc-btn bg-muted px-3 py-1 text-2xl text-foreground"
                      >
                        −
                      </button>
                      <div className="mc-inset flex-1 px-3 py-1 text-center text-xl text-foreground">
                        {stacks > 0 ? `${stacks} stk` : "0"}
                        <span className="ml-1 text-base text-muted-foreground">
                          ({quantity})
                        </span>
                      </div>
                      <button
                        type="button"
                        aria-label={`Add half stack of ${product.name}`}
                        onClick={() => setStacks(product.id, Math.round((stacks + 0.5) * 2) / 2)}
                        className="mc-btn bg-primary px-3 py-1 text-2xl text-primary-foreground"
                      >
                        +
                      </button>
                    </div>
                    {stacks === 0 ? (
                      <button
                        type="button"
                        onClick={() => setStacks(product.id, MIN_STACKS)}
                        className="mc-btn bg-accent px-3 py-2 text-xl text-accent-foreground"
                      >
                        Order in bulk
                      </button>
                    ) : (
                      <div className="mc-inset px-3 py-2 text-center text-xl text-accent">
                        {formatPrice(quantity * product.pricePerItem)}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
          <p className="mt-4 text-lg text-muted-foreground">
            Minimum order is {MIN_STACKS} stacks ({MIN_STACKS * STACK_SIZE} items). 1 stack = {STACK_SIZE}.
          </p>

          {/* Also available — mentioned only, ask in Discord */}
          <h2 className="mt-8 mb-3 text-3xl text-accent text-shadow-mc">
            Also In Stock
          </h2>
          <p className="mb-4 text-lg text-muted-foreground">
            These aren&apos;t on the bulk order form yet — but you can buy them for cheap at our store.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {ALSO_AVAILABLE.map((product) => (
              <article key={product.id} className="mc-panel flex flex-col gap-2 p-3">
                <div className="flex items-center gap-2">
                  <ItemIcon label={product.emojiFallback} color={product.color} />
                  <div className="min-w-0">
                    <h3 className="text-xl leading-tight text-foreground">{product.name}</h3>
                    <p className="text-base text-accent">
                      {formatPrice(product.pricePerItem)}
                      <span className="text-muted-foreground"> / item</span>
                    </p>
                  </div>
                </div>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {product.blurb}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Order panel */}
        <section aria-labelledby="order-heading">
          <h2 id="order-heading" className="mb-4 text-3xl text-accent text-shadow-mc">
            Your Order
          </h2>
          <form onSubmit={submitOrder} className="mc-panel flex flex-col gap-4 p-4">
            {/* Summary */}
            <div className="mc-inset flex flex-col gap-1 p-3">
              {hasItems ? (
                lines.map((l) => (
                  <div key={l.product.id} className="flex justify-between text-lg">
                    <span className="text-foreground">
                      {l.product.name} × {l.stacks} stk
                    </span>
                    <span className="text-accent">{formatPrice(l.lineTotal)}</span>
                  </div>
                ))
              ) : (
                <p className="text-lg text-muted-foreground">
                  No items yet. Add some from the shop!
                </p>
              )}
            </div>

            <div className="flex justify-between text-2xl">
              <span className="text-foreground">Total</span>
              <span className="text-primary text-shadow-mc">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-xl">
              <span className="text-muted-foreground">Est. delivery</span>
              <span className="text-accent">{delivery}</span>
            </div>

            {/* Fields */}
            <label className="flex flex-col gap-1 text-lg">
              <span className="text-muted-foreground">Discord username *</span>
              <input
                required
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                placeholder="yourname"
                maxLength={64}
                className="mc-inset px-3 py-2 text-xl text-foreground outline-none placeholder:text-muted-foreground/60"
              />
            </label>
            <label className="flex flex-col gap-1 text-lg">
              <span className="text-muted-foreground">In-game name *</span>
              <input
                required
                value={inGameName}
                onChange={(e) => setInGameName(e.target.value)}
                placeholder="Steve"
                maxLength={32}
                className="mc-inset px-3 py-2 text-xl text-foreground outline-none placeholder:text-muted-foreground/60"
              />
            </label>
            <label className="flex flex-col gap-1 text-lg">
              <span className="text-muted-foreground">Notes (optional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Delivery time preference, etc."
                maxLength={500}
                rows={2}
                className="mc-inset resize-none px-3 py-2 text-xl text-foreground outline-none placeholder:text-muted-foreground/60"
              />
            </label>

            <button
              type="submit"
              disabled={status === "submitting" || !hasItems}
              className="mc-btn bg-primary px-4 py-3 text-2xl text-primary-foreground text-shadow-mc"
            >
              {status === "submitting" ? "Placing order…" : "Place Order"}
            </button>

            {status === "error" && (
              <p role="alert" className="mc-inset px-3 py-2 text-lg text-accent">
                {message}
              </p>
            )}

            {status === "success" && lastOrder && (
              <div role="status" className="mc-inset flex flex-col gap-1 p-3 text-lg">
                <p className="text-primary text-shadow-mc">Order placed! #{lastOrder.orderNumber}</p>
                <p className="text-foreground">
                  Total: <span className="text-accent">{formatPrice(lastOrder.total)}</span>
                </p>
                <p className="text-foreground">
                  Delivery: <span className="text-accent">{lastOrder.delivery}</span>
                </p>
                <p className="text-muted-foreground">
                  We&apos;ll reach out on Discord to arrange the drop-off.
                </p>
              </div>
            )}
          </form>
        </section>
      </div>

      <footer className="mt-10 text-center text-lg text-muted-foreground">
        <p>Democracy Craft XP Store · Not affiliated with Mojang · In-store at c410-c1</p>
      </footer>
      </div>
    </>
  )
}
