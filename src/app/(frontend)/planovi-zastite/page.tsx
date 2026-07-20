import type { Metadata } from 'next'

import { PlansListPage } from '@/components/Plans/PlanPages'

// ISR: serve cached HTML instantly, re-render in the background at most every
// 5 min. CMS edits invalidate immediately via the revalidatePlans hooks.
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Planovi zaštite',
  description: 'Planovi zaštite za voćarstvo, ratarstvo i povrtarstvo',
}

export default async function PlanoviZastitePage() {
  return <PlansListPage planType="protection" />
}
