import { useState, useEffect, useRef } from 'react'

/** Ease-out quad: starts fast, decelerates */
function easeOutQuad(t: number): number {
  return t * (2 - t)
}

/**
 * Animates a number from 0 to `target` over `duration` ms.
 * Only runs once on mount. Respects prefers-reduced-motion.
 */
export function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(0)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current || target === 0) {
      setValue(target)
      return
    }
    hasRun.current = true

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setValue(target)
      return
    }

    let start: number | null = null
    let rafId: number

    function step(timestamp: number) {
      if (start === null) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutQuad(progress)
      setValue(Math.round(eased * target))

      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      }
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration])

  return value
}
