import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

// Keep the cached redirect/gone map fresh whenever the gone-urls list changes.
export const revalidateGoneAfterChange: CollectionAfterChangeHook = ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating gone-urls`)
  revalidateTag('gone-urls', 'max')
  return doc
}

export const revalidateGoneAfterDelete: CollectionAfterDeleteHook = ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating gone-urls (delete)`)
  revalidateTag('gone-urls', 'max')
  return doc
}
