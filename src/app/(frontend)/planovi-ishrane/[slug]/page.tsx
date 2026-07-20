import type { Metadata } from 'next'

import { NutritionComingSoon } from '@/components/Plans/NutritionComingSoon'

// Every nutrition-plan URL (group archives and culture details) shows the
// coming-soon page until the programs are ready.
export const metadata: Metadata = {
  title: 'Planovi ishrane — uskoro',
  description:
    'Planovi ishrane za voćarstvo, ratarstvo i povrtarstvo su u pripremi. U međuvremenu pogledajte naše planove zaštite.',
}

export default function PlanoviIshraneSlugPage() {
  return <NutritionComingSoon />
}
