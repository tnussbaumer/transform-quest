import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-tq-text-sec">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'w-full px-4 py-3 rounded-xl',
          'bg-tq-surface border border-tq-border',
          'text-tq-text placeholder:text-tq-text-muted',
          'text-base leading-normal', // 16px prevents iOS zoom
          'transition-colors duration-200 outline-none',
          'focus:border-tq-teal focus:ring-2 focus:ring-tq-teal/20',
          error ? 'border-tq-error' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-tq-error">{error}</p>}
    </div>
  )
}
