import type { Culture } from '@/payload-types'

export type PlanType = 'protection' | 'nutrition'

export const PLAN_CONFIG: Record<
  PlanType,
  { basePath: string; title: string; listSubtitle: string }
> = {
  protection: {
    basePath: '/planovi-zastite',
    title: 'Planovi zaštite',
    listSubtitle: 'Izaberite kategoriju za pregled planova zaštite',
  },
  nutrition: {
    basePath: '/planovi-ishrane',
    title: 'Planovi ishrane',
    listSubtitle: 'Izaberite kategoriju za pregled planova ishrane',
  },
}

type CulturePlan = NonNullable<Culture['protection']>

export function getCulturePlan(culture: Culture, planType: PlanType): CulturePlan | undefined {
  return (culture[planType] ?? undefined) as CulturePlan | undefined
}

// Lexical rich text is non-null even when "empty" (a single empty paragraph).
// Treat that as no content.
function richTextHasContent(content: unknown): boolean {
  const children = (content as { root?: { children?: unknown[] } } | null | undefined)?.root
    ?.children
  if (!Array.isArray(children) || children.length === 0) return false
  if (children.length === 1) {
    const only = children[0] as { type?: string; children?: unknown[] }
    const inner = only?.children
    if (only?.type === 'paragraph' && (!Array.isArray(inner) || inner.length === 0)) return false
  }
  return true
}

// A culture "has" a plan of a given type when it has an image or any content.
export function cultureHasPlan(culture: Culture, planType: PlanType): boolean {
  const plan = getCulturePlan(culture, planType)
  return Boolean(plan?.image) || richTextHasContent(plan?.content)
}

// Shape the card component understands, derived from a culture + plan type.
// The plan's own image wins; the culture image is the fallback so cards never
// render as an empty gray tile.
export function cultureToPlanCard(culture: Culture, planType: PlanType) {
  const plan = getCulturePlan(culture, planType)
  return {
    id: culture.id,
    slug: culture.slug ?? null,
    title: culture.title ?? null,
    description: plan?.description ?? null,
    image: plan?.image ?? culture.image ?? null,
    link: plan?.link ?? null,
  }
}
