"use client"

import { useEffect, useRef } from "react"

type Orb = {
  x: number
  y: number
  size: number
  speed: number
  drift: number
  phase: number
  alpha: number
}

// Floating XP-orb particles drifting up the screen for a cozy, magical feel.
export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const colors = ["#8be86f", "#5fbf4a", "#c9f5b0"]
    const count = prefersReduced ? 18 : 44
    const orbs: Orb[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 3,
      speed: 0.15 + Math.random() * 0.5,
      drift: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.3 + Math.random() * 0.5,
    }))

    function handleResize() {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)

    let raf = 0
    function draw() {
      ctx.clearRect(0, 0, width, height)
      for (const o of orbs) {
        o.y -= o.speed
        o.phase += 0.01
        o.x += Math.sin(o.phase) * o.drift * 0.3
        if (o.y < -10) {
          o.y = height + 10
          o.x = Math.random() * width
        }
        const color = colors[Math.floor(o.phase) % colors.length]
        // pixel-styled square orb with a soft glow
        ctx.globalAlpha = o.alpha
        ctx.shadowBlur = 8
        ctx.shadowColor = color
        ctx.fillStyle = color
        const s = Math.ceil(o.size)
        ctx.fillRect(Math.round(o.x), Math.round(o.y), s, s)
      }
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      if (!prefersReduced) raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  )
}
