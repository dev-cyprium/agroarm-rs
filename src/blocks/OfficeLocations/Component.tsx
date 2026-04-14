import React from 'react'

import type { OfficeLocationsBlock as OfficeLocationsBlockType } from '@/payload-types'

const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const FaxIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9V2h12v7" />
    <rect x="6" y="9" width="12" height="12" rx="2" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <circle cx="12" cy="15" r="1" />
  </svg>
)

const EmailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const PinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

export const OfficeLocationsBlock: React.FC<OfficeLocationsBlockType> = ({
  heading,
  subheading,
  offices,
}) => {
  if (!offices || offices.length === 0) return null

  return (
    <div className="container pt-16">
      {(heading || subheading) && (
        <div className="mb-14 text-center">
          {heading && <h2 className="text-3xl font-bold text-[#1F2A24] md:text-4xl">{heading}</h2>}
          {subheading && <p className="mt-3 text-lg text-[#1F2A24]/70">{subheading}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {offices.map((office, i) => {
          const mapQuery = office.mapAddress || office.address
          return (
            <div
              key={i}
              className="group overflow-hidden rounded-xl border border-[#E6EFEA] bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Map */}
              {mapQuery && (
                <div className="relative h-52 w-full overflow-hidden bg-[#E6EFEA]">
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Mapa: ${office.name}`}
                  />
                </div>
              )}

              {/* Info */}
              <div className="p-7">
                <div className="mb-5 flex items-center gap-3">
                  <h3 className="text-xl font-bold text-[#1F2A24]">{office.name}</h3>
                  {office.badge && (
                    <span className="inline-flex items-center rounded-full bg-[#007D41]/10 px-2.5 py-0.5 text-xs font-semibold text-[#007D41]">
                      {office.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-3.5">
                  <div className="flex items-start gap-2.5 text-sm text-[#1F2A24]/80">
                    <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#007D41]" />
                    <span>{office.address}</span>
                  </div>

                  {office.phone && (
                    <a
                      href={`tel:${office.phone.split(',')[0].trim()}`}
                      className="flex items-center gap-2.5 text-sm text-[#1F2A24]/80 transition-colors hover:text-[#007D41]"
                    >
                      <PhoneIcon className="h-4 w-4 shrink-0 text-[#007D41]" />
                      <span>{office.phone}</span>
                    </a>
                  )}

                  {office.fax && (
                    <div className="flex items-center gap-2.5 text-sm text-[#1F2A24]/80">
                      <FaxIcon className="h-4 w-4 shrink-0 text-[#007D41]" />
                      <span>Fax: {office.fax}</span>
                    </div>
                  )}

                  {office.email && (
                    <a
                      href={`mailto:${office.email}`}
                      className="flex items-center gap-2.5 text-sm text-[#1F2A24]/80 transition-colors hover:text-[#007D41]"
                    >
                      <EmailIcon className="h-4 w-4 shrink-0 text-[#007D41]" />
                      <span>{office.email}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
