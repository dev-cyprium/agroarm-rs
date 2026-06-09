import type { Metadata } from 'next'

import { PlansListPage } from '@/components/Plans/PlanPages'

// Render at request time — plans reflect live CMS data and must not require a
// DB connection during the build.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Planovi zaštite',
  description: 'Planovi zaštite za voćarstvo, ratarstvo i povrtarstvo',
}

export default async function PlanoviZastitePage() {
  return <PlansListPage planType="protection" />
}
