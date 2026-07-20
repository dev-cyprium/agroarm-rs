import type { Payload } from 'payload'

// Lexical stores `treatmentSchedule` blocks as raw JSON inside the richtext
// column, and Payload does NOT populate relationship fields inside those blocks
// regardless of query depth — product refs stay numeric IDs. This resolves them
// server-side (single query) so pills can render names + catalog links.

type ProductLite = { id: number; title: string | null; slug: string | null }

type ProductRowJSON = { product?: number | ProductLite | null }
type TargetJSON = { products?: ProductRowJSON[] | null }
type StageJSON = { products?: ProductRowJSON[] | null; targets?: TargetJSON[] | null }

type TreatmentBlockFields = { blockType?: string; stages?: StageJSON[] | null }

// All product rows across a treatmentSchedule block, tolerating the legacy
// flat shape (products directly on the stage) and the current nested one.
function collectRows(fields: TreatmentBlockFields): ProductRowJSON[] {
  const rows: ProductRowJSON[] = []
  for (const stage of fields.stages ?? []) {
    if (!stage) continue
    for (const row of stage.products ?? []) if (row) rows.push(row)
    for (const target of stage.targets ?? []) {
      if (!target) continue
      for (const row of target.products ?? []) if (row) rows.push(row)
    }
  }
  return rows
}

function walkBlocks(node: unknown, visit: (fields: TreatmentBlockFields) => void): void {
  if (!node) return
  if (Array.isArray(node)) {
    for (const child of node) walkBlocks(child, visit)
    return
  }
  if (typeof node === 'object') {
    const n = node as { type?: string; fields?: TreatmentBlockFields; [key: string]: unknown }
    if (n.type === 'block' && n.fields?.blockType === 'treatmentSchedule') {
      visit(n.fields)
    }
    for (const key of Object.keys(n)) walkBlocks(n[key], visit)
  }
}

export async function populateTreatmentProducts<T>(payload: Payload, content: T): Promise<T> {
  if (!content || typeof content !== 'object') return content

  const cloned = structuredClone(content)

  // Pass 1: collect referenced product IDs.
  const ids = new Set<number>()
  walkBlocks(cloned, (fields) => {
    for (const row of collectRows(fields)) {
      if (typeof row.product === 'number') ids.add(row.product)
    }
  })
  if (ids.size === 0) return cloned

  const result = await payload.find({
    collection: 'products',
    depth: 0,
    pagination: false,
    where: { id: { in: Array.from(ids) } },
    select: { title: true, slug: true },
    overrideAccess: false,
  })

  const byId = new Map<number, ProductLite>()
  for (const doc of result.docs) {
    byId.set(doc.id, { id: doc.id, title: doc.title ?? null, slug: doc.slug ?? null })
  }

  // Pass 2: swap IDs for lite objects (unknown IDs stay numeric and render
  // via productName fallback).
  walkBlocks(cloned, (fields) => {
    for (const row of collectRows(fields)) {
      if (typeof row.product === 'number') {
        const lite = byId.get(row.product)
        if (lite) row.product = lite
      }
    }
  })

  return cloned
}
