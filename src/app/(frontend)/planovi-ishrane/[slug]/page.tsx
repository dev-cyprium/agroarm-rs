import type { Metadata } from 'next'

import { PlanSlugPage, getPlanSlugMetadata } from '@/components/Plans/PlanPages'

type Args = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  return getPlanSlugMetadata({ slug, planType: 'nutrition' })
}

export default async function PlanoviIshraneSlugPage({ params }: Args) {
  const { slug } = await params
  return <PlanSlugPage slug={slug} planType="nutrition" />
}
