import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'

import type { Header as HeaderType, Category } from '@/payload-types'

type LinkData = {
  type?: ('reference' | 'custom') | null
  newTab?: boolean | null
  reference?:
    | ({ relationTo: 'pages'; value: number | any } | null)
    | ({ relationTo: 'posts'; value: number | any } | null)
  url?: string | null
  label: string
}

export type NavItemLink = {
  type: 'link'
  link: LinkData
  id?: string | null
}

export type NavItemCategory = {
  type: 'category'
  category: Category
  categoryLabel?: string | null
  children: Category[]
  id?: string | null
}

export type NavItemWithChildren = NavItemLink | NavItemCategory

export async function Header() {
  let headerData: HeaderType = { navItems: [] } as unknown as HeaderType

  try {
    headerData = (await getCachedGlobal('header', 1)()) as HeaderType
  } catch (error) {
    console.warn('Failed to load header global from Payload.', error)
  }

  const navItems = headerData?.navItems || []

  // Resolve child categories for category-type nav items
  const payload = await getPayload({ config: configPromise })
  const resolvedNavItems: NavItemWithChildren[] = await Promise.all(
    navItems.map(async (item): Promise<NavItemWithChildren> => {
      if (item.type === 'category' && item.category) {
        const categoryId = typeof item.category === 'object' ? item.category.id : item.category
        const category =
          typeof item.category === 'object' ? item.category : ({ id: categoryId, title: '' } as Category)

        const childCategories = await payload.find({
          collection: 'categories',
          where: { parent: { equals: categoryId } },
          limit: 50,
          sort: 'order',
        })

        return {
          type: 'category',
          category,
          categoryLabel: item.categoryLabel,
          children: childCategories.docs,
          id: item.id,
        }
      }

      return {
        type: 'link',
        link: item.link as LinkData,
        id: item.id,
      }
    }),
  )

  return <HeaderClient data={headerData} resolvedNavItems={resolvedNavItems} />
}
