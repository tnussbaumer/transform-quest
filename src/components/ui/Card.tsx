import type { HTMLAttributes, ReactNode } from 'react'

type GlowColor = 'teal' | 'gold' | 'purple'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: GlowColor
  children: ReactNode
}

const glowClasses: Record<GlowColor, string> = {
  teal:   'glow-teal',
  gold:   'glow-gold',
  purple: 'glow-purple',
}

export function Card({ glow, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={[
        'bg-tq-surface rounded-2xl p-5',
        'border border-tq-border/50',
        glow ? glowClasses[glow] : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
