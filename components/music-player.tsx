"use client"

import { useEffect, useRef, useState } from "react"

const MELODY = [
  [3, 2], [7, 2], [10, 2], [7, 2],
  [5, 2], [8, 2], [12, 2], [8, 2],
  [3, 2], [7, 2], [10, 1], [12, 1], [10, 2],
  [-2, 2], [3, 2], [7, 4],
] as const

const BASE = 220
const BEAT = 0.62

function freq(semitones: number) {
  return BASE * Math.pow(2, semitones / 12)
}

export function MusicPlayer() {
  const [playing, setPlaying] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const timerRef = useRef<number | null>(null)

  function schedule(ctx: AudioContext, master: GainNode) {
    let t = ctx.currentTime + 0.1
    const notes: { freq: number; start: number; dur: number }[] = []
    for (const [semi, beats] of MELODY) {
      notes.push({ freq: freq(semi), start: t, dur: beats * BEAT })
      t += beats * BEAT
    }
    const loopLength = t - (ctx.currentTime + 0.1)

    for (const n of notes) {
      for (const [type, detune, vol] of [
        ["triangle", 0, 0.16],
        ["sine", 4, 0.09],
      ] as const) {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = type
        osc.frequency.value = n.freq
        osc.detune.value = detune
        const a = 0.02
        const d = n.dur
        g.gain.setValueAtTime(0, n.start)
        g.gain.linearRampToValueAtTime(vol, n.start + a)
        g.gain.exponentialRampToValueAtTime(0.0008, n.start + d)
        osc.connect(g)
        g.connect(master)
        osc.start(n.start)
        osc.stop(n.start + d + 0.05)
      }
    }

    const pad = ctx.createOscillator()
    const padGain = ctx.createGain()
    pad.type = "sine"
    pad.frequency.value = freq(-9)
    padGain.gain.setValueAtTime(0.0001, ctx.currentTime)
    padGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1)
    padGain.gain.setValueAtTime(0.05, ctx.currentTime + loopLength - 1)
    padGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + loopLength)
    pad.connect(padGain)
    padGain.connect(master)
    pad.start(ctx.currentTime)
    pad.stop(ctx.currentTime + loopLength + 0.1)

    timerRef.current = window.setTimeout(
      () => schedule(ctx, master),
      loopLength * 1000,
    )
  }

  async function start() {
    let ctx = ctxRef.current
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      ctxRef.current = ctx
      const master = ctx.createGain()
      master.gain.value = 0.6
      master.connect(ctx.destination)
      gainRef.current = master
    }
    await ctx.resume()
    if (ctx.state === "running") {
      schedule(ctx, gainRef.current!)
      setPlaying(true)
    }
  }

  function stop() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (ctxRef.current) {
      ctxRef.current.suspend()
    }
    setPlaying(false)
  }

  useEffect(() => {
    start()

    const handleFirstInteraction = () => {
      if (ctxRef.current?.state !== "running") {
        start()
      }
      window.removeEventListener("pointerdown", handleFirstInteraction)
      window.removeEventListener("keydown", handleFirstInteraction)
      window.removeEventListener("scroll", handleFirstInteraction)
    }

    window.addEventListener("pointerdown", handleFirstInteraction)
    window.addEventListener("keydown", handleFirstInteraction)
    window.addEventListener("scroll", handleFirstInteraction)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      ctxRef.current?.close()
      window.removeEventListener("pointerdown", handleFirstInteraction)
      window.removeEventListener("keydown", handleFirstInteraction)
      window.removeEventListener("scroll", handleFirstInteraction)
    }
  }, [])

  return (
    <button
      type="button"
      onClick={() => (playing ? stop() : start())}
      aria-pressed={playing}
      aria-label={playing ? "Pause background music" : "Play background music"}
      className="mc-btn fixed bottom-4 right-4 z-20 flex items-center gap-2 bg-card px-3 py-2 text-lg text-foreground"
    >
      <span aria-hidden="true" className="text-accent">
        {playing ? "♪♫" : "♪"}
      </span>
      <span className="hidden sm:inline">{playing ? "Music: On" : "Music: Off"}</span>
    </button>
  )
}