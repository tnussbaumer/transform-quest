import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'

interface BibleReadingGuideProps {
  open: boolean
  onClose: () => void
}

const SLIDES = [
  {
    emoji: '😌',
    title: "Don't Overthink It",
    body: "The Bible can feel overwhelming, but you don't need to understand everything at once. Just start reading today's passage slowly. If something stands out to you, that's enough.",
  },
  {
    emoji: '🔁',
    title: 'Read It More Than Once',
    body: "Try reading the passage twice. The first time, just let it wash over you. The second time, look for something that surprises you or makes you curious.",
  },
  {
    emoji: '🤔',
    title: 'Ask Simple Questions',
    body: "As you read, ask yourself: Who is talking? What's happening? Why does this matter? These are the same questions you'll answer in the app — just start noticing them while you read.",
  },
  {
    emoji: '🤷',
    title: "It's OK to Not Understand",
    body: "The Bible was written thousands of years ago to people in very different cultures. If something confuses you, that's normal! Write what you DO understand, and ask Clay or a leader about the rest.",
  },
  {
    emoji: '💬',
    title: 'Make It Personal',
    body: "The Bible isn't just an old book — it's God's way of speaking to you today. As you read, ask: \"What is this saying to ME right now?\" Your honest answer is always the right answer.",
  },
  {
    emoji: '🙌',
    title: "You're Not Behind",
    body: "Whether this is your first time reading the Bible or your hundredth, you belong here. Every day you show up is a win. God meets you where you are.",
  },
]

export function BibleReadingGuide({ open, onClose }: BibleReadingGuideProps) {
  const [slideIndex, setSlideIndex] = useState(0)

  if (!open) return null

  const slide = SLIDES[slideIndex]
  const isLast = slideIndex === SLIDES.length - 1
  const isFirst = slideIndex === 0

  function handleNext() {
    if (isLast) {
      setSlideIndex(0)
      onClose()
    } else {
      setSlideIndex(i => i + 1)
    }
  }

  function handleBack() {
    if (!isFirst) setSlideIndex(i => i - 1)
  }

  function handleClose() {
    setSlideIndex(0)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-tq-bg/90"
        onClick={handleClose}
      />

      {/* Content */}
      <div className="relative w-full max-w-sm">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 p-2 text-tq-text-muted hover:text-tq-text transition-colors z-10"
          aria-label="Close guide"
        >
          <X size={24} />
        </button>

        {/* White slide card */}
        <div
          className="bg-white rounded-2xl p-6 shadow-xl space-y-4 animate-fade-up"
          key={slideIndex}
        >
          {/* Emoji */}
          <p className="text-center text-4xl">{slide.emoji}</p>

          {/* Title */}
          <h2 className="text-center text-xl font-extrabold text-gray-900">
            {slide.title}
          </h2>

          {/* Body */}
          <p className="text-center text-gray-600 text-[15px] leading-relaxed">
            {slide.body}
          </p>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-5">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={[
                'w-2 h-2 rounded-full transition-colors duration-200',
                i === slideIndex ? 'bg-tq-teal' : 'bg-tq-text-muted/40',
              ].join(' ')}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={handleBack}
            disabled={isFirst}
            className={[
              'text-sm font-bold py-2 px-4 min-h-[44px] transition-colors',
              isFirst ? 'text-transparent cursor-default' : 'text-tq-text-muted hover:text-tq-text',
            ].join(' ')}
          >
            Back
          </button>

          <Button onClick={handleNext}>
            {isLast ? 'Got It!' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
