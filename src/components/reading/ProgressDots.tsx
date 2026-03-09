interface ProgressDotsProps {
  step: number   // 1-indexed current step
  total: number
}

export function ProgressDots({ step, total }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={[
            'rounded-full transition-all duration-300',
            i + 1 === step
              ? 'w-6 h-2 bg-tq-teal'
              : i + 1 < step
              ? 'w-2 h-2 bg-tq-teal/50'
              : 'w-2 h-2 bg-tq-surface-2',
          ].join(' ')}
        />
      ))}
    </div>
  )
}
