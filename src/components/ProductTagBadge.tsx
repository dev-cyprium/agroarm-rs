import React from 'react'
import { cn } from '@/utilities/ui'

export type ProductTag = 'novo' | 'uskoro'

const TAG_STYLES: Record<ProductTag, { label: string; className: string }> = {
  novo: { label: 'Novo', className: 'bg-tag-novo text-tag-novo-foreground' },
  uskoro: { label: 'Uskoro', className: 'bg-tag-uskoro text-tag-uskoro-foreground' },
}

export const ProductTagBadge: React.FC<{
  tag?: string | null
  className?: string
}> = ({ tag, className }) => {
  if (tag !== 'novo' && tag !== 'uskoro') return null
  const { label, className: tagClassName } = TAG_STYLES[tag]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide shadow-sm',
        tagClassName,
        className,
      )}
    >
      {label}
    </span>
  )
}
