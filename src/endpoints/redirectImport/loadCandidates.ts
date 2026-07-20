import type { PayloadRequest } from 'payload'
import type { DocCandidate, CultureCandidate, ReferenceCollection } from '@/redirectImport/match'

/**
 * Loads every piece of new-site content the importer can redirect TO:
 * routable documents (products / categories / pages / posts) as reference
 * candidates, plus cultures (which power the plan routes) as custom-URL targets.
 */
export async function loadCandidates(
  req: PayloadRequest,
): Promise<{ docs: DocCandidate[]; cultures: CultureCandidate[] }> {
  const { payload } = req

  const collections: ReferenceCollection[] = ['products', 'categories', 'pages', 'posts']

  const docLists = await Promise.all(
    collections.map(async (collection) => {
      const res = await payload.find({
        collection,
        depth: 0,
        limit: 0,
        pagination: false,
        select: { title: true, slug: true },
        req,
      })
      return res.docs
        .filter((d): d is typeof d & { slug: string } => Boolean(d.slug))
        .map(
          (d): DocCandidate => ({
            id: d.id,
            title: (d as { title?: string }).title || d.slug,
            slug: d.slug,
            collection,
          }),
        )
    }),
  )

  const culturesRes = await payload.find({
    collection: 'cultures',
    depth: 0,
    limit: 0,
    pagination: false,
    select: { title: true, slug: true, keywordAliases: true },
    req,
  })

  const cultures: CultureCandidate[] = culturesRes.docs
    .filter((c): c is typeof c & { slug: string } => Boolean(c.slug))
    .map((c) => ({
      id: c.id,
      title: (c as { title?: string }).title || c.slug,
      slug: c.slug,
      aliases: Array.isArray((c as { keywordAliases?: { keyword?: string }[] }).keywordAliases)
        ? (c as { keywordAliases?: { keyword?: string }[] }).keywordAliases!
            .map((a) => a?.keyword || '')
            .filter(Boolean)
        : [],
    }))

  return { docs: docLists.flat(), cultures }
}
