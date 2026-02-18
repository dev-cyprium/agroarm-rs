'use client'

import type { PayloadAdminBarProps, PayloadMeUser } from '@payloadcms/admin-bar'

import { cn } from '@/utilities/ui'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useSelectedLayoutSegments } from 'next/navigation'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

import './index.scss'

import { getClientSideURL } from '@/utilities/getURL'

const baseClass = 'admin-bar'

const collectionLabels = {
  pages: {
    plural: 'Pages',
    singular: 'Page',
  },
  posts: {
    plural: 'Posts',
    singular: 'Post',
  },
  projects: {
    plural: 'Projects',
    singular: 'Project',
  },
}

const Title: React.FC = () => <span>Dashboard</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { headerTheme } = useHeaderTheme()
  const collection = (
    collectionLabels[segments?.[1] as keyof typeof collectionLabels] ? segments[1] : 'pages'
  ) as keyof typeof collectionLabels
  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    const authenticated = Boolean(user?.id)
    setShow(authenticated)
    if (!authenticated) setIsOpen(false)
  }, [])

  return (
    <div
      className={cn(baseClass, {
        block: show,
        hidden: !show,
      })}
      {...(headerTheme ? { 'data-theme': headerTheme } : {})}
    >
      <div className="container admin-bar__container">
        <button
          type="button"
          className="admin-bar__toggle"
          aria-expanded={isOpen}
          aria-controls="payload-admin-drawer"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span>Payload</span>
          <ChevronDown
            className={cn('h-4 w-4 transition-transform duration-200', {
              'rotate-180': isOpen,
            })}
          />
        </button>

        <div
          id="payload-admin-drawer"
          className={cn('admin-bar__drawer-wrap', {
            'admin-bar__drawer-wrap--open': isOpen,
          })}
        >
          <div className="admin-bar__drawer">
            <PayloadAdminBar
              {...adminBarProps}
              className="py-2"
              classNames={{
                controls: 'font-medium text-foreground',
                logo: 'text-foreground',
                user: 'text-foreground',
              }}
              cmsURL={getClientSideURL()}
              collectionSlug={collection}
              collectionLabels={{
                plural: collectionLabels[collection]?.plural || 'Pages',
                singular: collectionLabels[collection]?.singular || 'Page',
              }}
              logo={<Title />}
              onAuthChange={onAuthChange}
              onPreviewExit={() => {
                fetch('/next/exit-preview').then(() => {
                  router.push('/')
                  router.refresh()
                })
              }}
              style={{
                backgroundColor: 'transparent',
                padding: 0,
                position: 'relative',
                zIndex: 'unset',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
