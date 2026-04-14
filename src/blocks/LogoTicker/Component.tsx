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

      return (
        <div key={`${keyPrefix}-${i}`} className="flex h-9 w-28 shrink-0 items-center justify-center px-2">
          <img
            src={media.url}
            alt={logo.name || ''}
            className="max-h-full max-w-full object-contain opacity-40 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
            loading="lazy"
            decoding="async"
          />
        </div>
      )
    })

  return (
    <div className="bg-[#F4F8F6] py-6">
      {heading && (
        <p className="mb-4 text-center text-sm font-medium uppercase tracking-widest text-[#1F2A24]/35">
          {heading}
        </p>
      )}

      <div className="container">
      <div
        className="relative flex overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className="flex shrink-0 items-center gap-12 animate-ticker" style={{ animationDuration: duration }}>
          {renderLogos('a')}
        </div>
        <div className="flex shrink-0 items-center gap-12 animate-ticker" aria-hidden="true" style={{ animationDuration: duration }}>
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
        }
      `}</style>
    </div>
  )
}
