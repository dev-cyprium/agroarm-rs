import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

import { SPOTLIGHT_TAG } from '@/components/Spotlight/types'

export const revalidateSpotlightAfterChange: CollectionAfterChangeHook = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) revalidateTag(SPOTLIGHT_TAG, 'max')
  return doc
}

export const revalidateSpotlightAfterDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) revalidateTag(SPOTLIGHT_TAG, 'max')
  return doc
}
