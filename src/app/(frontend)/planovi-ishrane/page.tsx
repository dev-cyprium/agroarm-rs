import type { Metadata } from 'next'

import { PlansListPage } from '@/components/Plans/PlanPages'

export const metadata: Metadata = {
  title: 'Planovi ishrane',
  description: 'Planovi ishrane za voćarstvo, ratarstvo i povrtarstvo',
}

export default async function PlanoviIshranePage() {
  return <PlansListPage planType="nutrition" />
}
