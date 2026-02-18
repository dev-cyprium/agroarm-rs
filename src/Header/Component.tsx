import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'

export async function Header() {
  let headerData: Header = { navItems: [] } as unknown as Header

  try {
    headerData = await getCachedGlobal('header', 1)()
  } catch (error) {
    console.warn('Failed to load header global from Payload.', error)
  }

  return <HeaderClient data={headerData} />
}
