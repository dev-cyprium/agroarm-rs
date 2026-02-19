import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Page, Post } from '@/payload-types'

import type { LiquidTintColor } from '@/fields/link'

const liquidTintClasses: Record<LiquidTintColor, string> = {
  herbicidi:
    'border-emerald-400/40 bg-emerald-500/25 text-white shadow-[0_8px_24px_rgba(5,150,105,0.25)] backdrop-blur-md hover:bg-emerald-500/35 hover:border-emerald-400/50',
  fungicidi:
    'border-blue-400/40 bg-blue-500/25 text-white shadow-[0_8px_24px_rgba(59,130,246,0.25)] backdrop-blur-md hover:bg-blue-500/35 hover:border-blue-400/50',
  insekticidi:
    'border-red-400/40 bg-red-500/25 text-white shadow-[0_8px_24px_rgba(239,68,68,0.25)] backdrop-blur-md hover:bg-red-500/35 hover:border-red-400/50',
}

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant'] | 'liquid'
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'pages' | 'posts'
    value: Page | Post | string | number
  } | null
  size?: ButtonProps['size'] | null
  tintColor?: LiquidTintColor | null
  type?: 'custom' | 'reference' | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    tintColor = 'herbicidi',
    url,
  } = props

  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
          reference.value.slug
        }`
      : url

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  if (appearance === 'liquid') {
    const tint = tintColor && liquidTintClasses[tintColor] ? tintColor : 'herbicidi'
    return (
      <Link
        className={cn(
          'inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-medium transition-colors',
          liquidTintClasses[tint],
          sizeFromProps === 'lg' && 'px-8 py-3.5 text-base',
          className,
        )}
        href={href || url || ''}
        {...newTabProps}
      >
        {label && label}
        {children && children}
      </Link>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    </Button>
  )
}
