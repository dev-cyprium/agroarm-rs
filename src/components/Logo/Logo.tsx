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
      width={logoSrc === '/beli.svg' ? 200 : 110}
      height={logoSrc === '/beli.svg' ? 60 : 100}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx(
        logoSrc === '/beli.svg' ? 'max-h-[2.5rem]' : 'max-h-[2.5rem] w-auto h-auto',
        className,
      )}
      src={logoSrc}
    />
  )
}
