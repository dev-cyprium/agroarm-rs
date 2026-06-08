import type { Metadata } from 'next'

import { PlansListPage } from '@/components/Plans/PlanPages'

export const metadata: Metadata = {
  title: 'Planovi zaštite',
  description: 'Planovi zaštite za voćarstvo, ratarstvo i povrtarstvo',
}

export default async function PlanoviZastitePage() {
  return <PlansListPage planType="protection" />
}
