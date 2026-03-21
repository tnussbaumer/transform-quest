interface AnimatedFlameProps {
  size?: number
}

export function AnimatedFlame({ size = 20 }: AnimatedFlameProps) {
  const scale = size / 20

  return (
    <div
      className="animated-flame-container"
      style={{ width: size, height: size, transform: `scale(${scale})` }}
      aria-hidden="true"
    >
      <div className="flame-layer flame-outer" />
      <div className="flame-layer flame-mid" />
      <div className="flame-layer flame-inner" />
    </div>
  )
}
