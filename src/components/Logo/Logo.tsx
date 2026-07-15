import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  /** Override logo source (e.g. /beli.svg for homepage) */
  src?: string
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className, src } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'
  const logoSrc = src ?? '/logo.svg'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="AGROARM Logo"
      width={logoSrc === '/beli.svg' ? 120 : 110}
      height={logoSrc === '/beli.svg' ? 36 : 100}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx(
        // beli.svg has no width/height on its root, so it needs a definite CSS
        // height (w-auto alone can collapse it to 0). The width/height attrs
        // above carry the real aspect ratio so w-auto resolves against it —
        // an oversized width attr would letterbox the SVG off the left edge.
        logoSrc === '/beli.svg' ? 'h-8 w-auto md:h-9' : 'max-h-[2.5rem] w-auto h-auto',
        className,
      )}
      src={logoSrc}
    />
  )
}
