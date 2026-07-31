type Props = {
  label: string
  color: string
  size?: number
}

// Simple blocky pixel-art item slot with the product's initials.
export function ItemIcon({ label, color, size = 56 }: Props) {
  return (
    <div
      className="mc-inset flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="font-sans leading-none"
        style={{
          color,
          fontSize: size * 0.5,
          textShadow: "2px 2px 0 rgba(0,0,0,0.6)",
        }}
      >
        {label}
      </span>
    </div>
  )
}
