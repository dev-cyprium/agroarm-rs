import React from 'react'

import type { FooterContactBlock as FooterContactBlockType, SiteSetting } from '@/payload-types'

type Props = FooterContactBlockType & {
  siteSettings: SiteSetting
}

const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const EmailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const AddressIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

export const FooterContactBlock: React.FC<Props> = ({
  title,
  showPhone,
  showEmail,
  showAddress,
  siteSettings,
}) => {
  const { phone, email, address } = siteSettings || {}

  return (
    <div>
      {title && <h4 className="mb-4 text-base font-semibold text-white">{title}</h4>}
      <div className="flex flex-col gap-3">
        {showPhone && phone && (
          <a href={`tel:${phone}`} className="flex items-center gap-2.5 text-sm text-white/70 transition-colors hover:text-white">
            <PhoneIcon className="h-4 w-4 shrink-0" />
            <span>{phone}</span>
          </a>
        )}
        {showEmail && email && (
          <a href={`mailto:${email}`} className="flex items-center gap-2.5 text-sm text-white/70 transition-colors hover:text-white">
            <EmailIcon className="h-4 w-4 shrink-0" />
            <span>{email}</span>
          </a>
        )}
        {showAddress && address && (
          <div className="flex items-start gap-2.5 text-sm text-white/70">
            <AddressIcon className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{address}</span>
          </div>
        )}
      </div>
    </div>
  )
}
