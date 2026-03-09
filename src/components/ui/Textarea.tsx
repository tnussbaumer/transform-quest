import { useRef, useEffect, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Textarea({ label, className = '', id, onChange, ...props }: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  // Auto-grow: adjust height to content, capped at max-height via CSS
  function autoGrow() {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  useEffect(() => {
    autoGrow()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    autoGrow()
    onChange?.(e)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-tq-text-sec">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={3}
        className={[
          'w-full px-4 py-3 rounded-xl resize-none',
          'bg-tq-surface border border-tq-border',
          'text-tq-text placeholder:text-tq-text-muted',
          'text-base leading-relaxed', // 16px prevents iOS zoom
          'transition-colors duration-200 outline-none',
          'focus:border-tq-teal focus:ring-2 focus:ring-tq-teal/20',
          'min-h-[80px] max-h-[160px]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onChange={handleChange}
        {...props}
      />
    </div>
  )
}
