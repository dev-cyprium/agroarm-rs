import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

// Frontend routes driven by cultures / culture-groups data.
const PLAN_BASES = ['/planovi-zastite', '/planovi-ishrane']

function revalidatePlanPaths(logger?: { info?: (msg: string) => void }) {
  for (const base of PLAN_BASES) {
    revalidatePath(base) // listing of groups
    revalidatePath(`${base}/[slug]`, 'page') // every group archive + culture detail
  }
  // Home widget lists the culture groups
  revalidatePath('/')
  logger?.info?.('Revalidating plan pages')
}

export const revalidatePlansAfterChange: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) revalidatePlanPaths(payload?.logger)
  return doc
}

export const revalidatePlansAfterDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) revalidatePlanPaths(payload?.logger)
  return doc
}
