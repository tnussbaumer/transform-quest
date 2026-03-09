import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'success'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-tq-teal text-tq-bg font-bold hover:bg-tq-teal-dark active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-tq-teal focus-visible:ring-offset-2 focus-visible:ring-offset-tq-bg',
  secondary:
    'bg-tq-surface-2 text-tq-text border border-tq-border hover:border-tq-teal focus-visible:ring-2 focus-visible:ring-tq-teal focus-visible:ring-offset-2 focus-visible:ring-offset-tq-bg',
  danger:
    'bg-transparent text-tq-error border border-tq-error hover:bg-tq-error/10 focus-visible:ring-2 focus-visible:ring-tq-error focus-visible:ring-offset-2 focus-visible:ring-offset-tq-bg',
  success:
    'bg-tq-success/20 text-tq-success border border-tq-success/40 cursor-default',
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2',
        'h-12 px-6 rounded-xl text-base font-bold',
        'transition-all duration-200 outline-none',
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
