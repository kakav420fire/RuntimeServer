import type { Metadata, Viewport } from "next"
import { VT323 } from "next/font/google"
import "./globals.css"

const pixel = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
})

export const metadata: Metadata = {
  title: "Democracy Craft XP Store — Bulk XP Bottles & More",
  description:
    "Buy XP bottles in bulk for Democracy Craft, plus honey bottles, bonemeal, and white dye. Fast in-game delivery to c410-c1.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#1a1611",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${pixel.variable} bg-background`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
