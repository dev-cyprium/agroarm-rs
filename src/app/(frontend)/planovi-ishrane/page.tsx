import type { Metadata } from 'next'

import { NutritionComingSoon } from '@/components/Plans/NutritionComingSoon'

export const metadata: Metadata = {
  title: 'Planovi ishrane — uskoro',
  description:
    'Planovi ishrane za voćarstvo, ratarstvo i povrtarstvo su u pripremi. U međuvremenu pogledajte naše planove zaštite.',
}

export default function PlanoviIshranePage() {
  return <NutritionComingSoon />
}
