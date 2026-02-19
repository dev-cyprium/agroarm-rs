import React from 'react'

import type { LabeledCategoryCardsBlock as BlockProps } from '@/payload-types'
import type { Media } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { getMediaUrl } from '@/utilities/getMediaUrl'

const BRAND_GREEN = '#007D41'

export const LabeledCategoryCardsBlock: React.FC<BlockProps> = (props) => {
  const { smallText, heading, subheading, cards } = props

  return (
    <div
      className="py-16"
      style={{ backgroundColor: 'color-mix(in srgb, var(--color-background) 95%, #007D41)' }}
    >
      <div className="container">
        {/* Header */}
        <header className="text-center mb-12 space-y-2">
          {smallText && (
            <p
              className="text-xs sm:text-sm font-medium uppercase tracking-wider"
              style={{ color: BRAND_GREEN }}
            >
              {smallText}
            </p>
          )}
          {heading && (
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold"
              style={{ color: BRAND_GREEN }}
            >
              {heading}
            </h1>
          )}
          {subheading && (
            <h2
              className="text-base sm:text-lg md:text-xl font-normal max-w-2xl mx-auto"
              style={{ color: BRAND_GREEN }}
            >
              {subheading}
            </h2>
          )}
        </header>

        {/* Cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {(cards || []).map((card, index) => {
            const icon = card.icon as Media | null | undefined
            const iconUrl = icon && typeof icon === 'object' && icon.url
              ? getMediaUrl(icon.url, icon.updatedAt)
              : null

            const hasLink = card.link && (card.link.url || card.link.reference)

            const cardContent = (
              <div
                className="flex flex-col items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl border bg-white/80 hover:bg-white transition-colors h-full"
                style={{ borderColor: 'color-mix(in srgb, #007D41 25%)' }}
              >
                {iconUrl && (
                  <img
                    src={iconUrl}
                    alt={icon?.alt || card.link.label}
                    className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 object-contain"
                    style={{ minWidth: 0, minHeight: 0, maxWidth: '100%', maxHeight: '100%' }}
                  />
                )}
                <div className="flex items-center gap-2 flex-1 w-full">
                  <span
                    className="font-medium text-sm sm:text-base"
                    style={{ color: BRAND_GREEN }}
                  >
                    {card.link.label}
                  </span>
                  {hasLink && (
                    <span
                      className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'color-mix(in srgb, #007D41 15%)' }}
                      aria-hidden
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                        style={{ color: BRAND_GREEN }}
                      >
                        <path
                          d="M4.5 3L8 6L4.5 9"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            )

            if (hasLink && card.link) {
              const { label: _omit, ...linkProps } = card.link
              return (
                <CMSLink
                  key={index}
                  {...linkProps}
                  appearance="inline"
                  className="block h-full"
                >
                  {cardContent}
                </CMSLink>
              )
            }

            return <div key={index}>{cardContent}</div>
          })}
        </div>
      </div>
    </div>
  )
}
