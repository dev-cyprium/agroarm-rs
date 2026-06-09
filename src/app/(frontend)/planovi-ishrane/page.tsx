import type { Metadata } from 'next'

import { PlansListPage } from '@/components/Plans/PlanPages'

// Render at request time — plans reflect live CMS data and must not require a
// DB connection during the build.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Planovi ishrane',
  description: 'Planovi ishrane za voćarstvo, ratarstvo i povrtarstvo',
}

export default async function PlanoviIshranePage() {
  return <PlansListPage planType="nutrition" />
}
