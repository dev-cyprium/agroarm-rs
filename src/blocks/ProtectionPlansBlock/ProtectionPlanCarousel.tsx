'use client'

import useEmblaCarousel from 'embla-carousel-react'
import React, { useCallback, useEffect, useState } from 'react'

import type { ProtectionPlan } from '@/payload-types'

import { ProtectionPlanCard } from './ProtectionPlanCard'

type ProtectionPlanCarouselProps = {
  plans: ProtectionPlan[]
}

export const ProtectionPlanCarousel: React.FC<ProtectionPlanCarouselProps> = ({ plans }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    slidesToScroll: 1,
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const updateScrollButtons = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    updateScrollButtons()
    emblaApi.on('select', updateScrollButtons)
    emblaApi.on('reInit', updateScrollButtons)
  }, [emblaApi, updateScrollButtons])

  if (plans.length === 0) return null

  return (
    <div className="relative">
      <div className="-mr-4 overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y gap-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="min-w-0 flex-[0_0_48%] sm:flex-[0_0_32%]"
            >
              <ProtectionPlanCard plan={plan} />
            </div>
          ))}
        </div>
      </div>
      {(canScrollPrev || canScrollNext) && (
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted disabled:opacity-30"
            aria-label="Previous"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted disabled:opacity-30"
            aria-label="Next"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
