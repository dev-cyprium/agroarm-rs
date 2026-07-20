import type React from 'react'
import type { Page, Post } from '@/payload-types'

import { getCachedDocument } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'
import { docUrl } from '@/utilities/collectionRoutes'
import { notFound, redirect } from 'next/navigation'

interface Props {
  disableNotFound?: boolean
  url: string
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
  let redirects: Array<{ from?: string; to?: any }> = []
  try {
    redirects = await getCachedRedirects()()
  } catch (error) {
    console.warn('Failed to load redirects from Payload.', error)
    if (disableNotFound) return null
    notFound()
  }

  const redirectItem = redirects.find((redirect) => redirect.from === url)

  if (redirectItem) {
    if (redirectItem.to?.url) {
      redirect(redirectItem.to.url)
    }

    let redirectUrl = ''

    try {
      const collection = redirectItem.to?.reference?.relationTo
      const value = redirectItem.to?.reference?.value

      if (typeof value === 'string') {
        // Reference stored by id — fetch the doc to read its slug.
        const document = (await getCachedDocument(collection, value)()) as Page | Post
        redirectUrl = docUrl(collection, document?.slug)
      } else if (value && typeof value === 'object') {
        // Reference already populated with the doc.
        redirectUrl = docUrl(collection, (value as { slug?: string })?.slug)
      }
    } catch (error) {
      console.warn('Failed to resolve redirect target document from Payload.', error)
    }

    if (redirectUrl) redirect(redirectUrl)
  }

  if (disableNotFound) return null

  notFound()
}
