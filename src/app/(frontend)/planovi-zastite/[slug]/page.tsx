import type { Metadata } from 'next'

import { PlanSlugPage, getPlanSlugMetadata } from '@/components/Plans/PlanPages'

type Args = {
  params: Promise<{ slug: string }>
}

// ISR: rendered on first request, then served from cache; re-rendered in the
// background at most every 5 min. CMS edits invalidate via revalidatePlans.
export const revalidate = 300

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  return getPlanSlugMetadata({ slug, planType: 'protection' })
}

export default async function PlanoviZastiteSlugPage({ params }: Args) {
  const { slug } = await params
  return <PlanSlugPage slug={slug} planType="protection" />
}
