import type React from 'react'
import type { Page, Post } from '@/payload-types'

import { getCachedDocument } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'
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
      if (typeof redirectItem.to?.reference?.value === 'string') {
        const collection = redirectItem.to?.reference?.relationTo
        const id = redirectItem.to?.reference?.value

        const document = (await getCachedDocument(collection, id)()) as Page | Post
        redirectUrl = `${redirectItem.to?.reference?.relationTo !== 'pages' ? `/${redirectItem.to?.reference?.relationTo}` : ''}/${
          document?.slug
        }`
      } else {
        redirectUrl = `${redirectItem.to?.reference?.relationTo !== 'pages' ? `/${redirectItem.to?.reference?.relationTo}` : ''}/${
          typeof redirectItem.to?.reference?.value === 'object'
            ? redirectItem.to?.reference?.value?.slug
            : ''
        }`
      }
    } catch (error) {
      console.warn('Failed to resolve redirect target document from Payload.', error)
    }

    if (redirectUrl) redirect(redirectUrl)
  }

  if (disableNotFound) return null

  notFound()
}
