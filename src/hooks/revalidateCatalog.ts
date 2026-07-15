import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

/**
 * Products, categories, cultures and media feed the statically generated
 * catalog and product pages (`generateStaticParams`, no time-based
 * revalidation) — without this hook an edit only shows up after a redeploy.
 */
function revalidateCatalogPaths(logger?: { info?: (msg: string) => void }) {
  revalidatePath('/kategorije') // catalog index
  revalidatePath('/kategorije/[slug]', 'page') // every scoped catalog
  revalidatePath('/proizvodi/[slug]', 'page') // every product page
  revalidatePath('/') // home (featured products, category cards)
  logger?.info?.('Revalidating catalog and product pages')
}

export const revalidateCatalogAfterChange: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) revalidateCatalogPaths(payload?.logger)
  return doc
}

export const revalidateCatalogAfterDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) revalidateCatalogPaths(payload?.logger)
  return doc
}
