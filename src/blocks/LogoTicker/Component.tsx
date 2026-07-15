'use client'

import React from 'react'

import type { LogoTickerBlock as LogoTickerBlockType, Media } from '@/payload-types'

const speedMap = {
  slow: '90s',
  normal: '60s',
  fast: '40s',
}

export const LogoTickerBlock: React.FC<LogoTickerBlockType> = ({ heading, logos, speed }) => {
  if (!logos || logos.length === 0) return null

  const duration = speedMap[(speed as keyof typeof speedMap) || 'normal']
  const items = [...logos, ...logos]

  const renderLogos = (keyPrefix: string) =>
    items.map((logo, i) => {
      const media = typeof logo.image === 'object' ? (logo.image as Media) : null
      if (!media?.url) return null

      const img = (
        <img
          src={media.url}
          alt={logo.name || ''}
          className="max-h-full max-w-full object-contain opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 dark:brightness-0 dark:invert"
          loading="lazy"
          decoding="async"
        />
      )

      // Spacing lives on each item (mx-*) — not on the track — so the gap is
      // uniform everywhere, including the seam where the loop repeats.
      const wrapperClass =
        'flex h-8 w-24 shrink-0 items-center justify-center mx-4 sm:h-9 sm:w-28 sm:mx-6'

      if (logo.url) {
        return (
          <a
            key={`${keyPrefix}-${i}`}
            href={logo.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={logo.name || undefined}
            className={wrapperClass}
          >
            {img}
          </a>
        )
      }

      return (
        <div key={`${keyPrefix}-${i}`} className={wrapperClass}>
          {img}
        </div>
      )
    })

  return (
    <div className="bg-surface py-6">
      {heading && (
        <p className="mb-4 text-center text-sm font-medium uppercase tracking-widest text-ink/35">
          {heading}
        </p>
      )}

      <div className="container">
        <div
          className="relative flex overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          }}
        >
          <div className="flex shrink-0 items-center animate-ticker" style={{ animationDuration: duration }}>
            {renderLogos('a')}
          </div>
          <div
            className="flex shrink-0 items-center animate-ticker"
            aria-hidden="true"
            style={{ animationDuration: duration }}
          >
            {renderLogos('b')}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker {
          animation: ticker linear infinite;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-ticker {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
