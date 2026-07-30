"use client"

import { useEffect, useState } from "react"

export function OrderCounter({ count }: { count: number | null }) {
  const [display, setDisplay] = useState(count)

  useEffect(() => {
    setDisplay(count)
  }, [count])

  return (
    <div className="mc-panel inline-flex items-center gap-3 px-5 py-3">
      <span
        className="inline-block h-4 w-4 bg-primary"
        style={{ boxShadow: "0 0 8px var(--color-primary)" }}
        aria-hidden="true"
      />
      <span className="text-2xl text-accent text-shadow-mc tabular-nums">
        {display === null ? "…" : display.toLocaleString("en-US")}
      </span>
      <span className="text-xl text-muted-foreground">orders delivered</span>
    </div>
  )
}
