import React from 'react'
import { TriangleAlert } from 'lucide-react'

import { cn } from '@/utilities/ui'

// Mandatory safe-use disclaimer for plant-protection content. Shown on product
// detail pages and at the bottom of every protection-plan page.
export const PesticideDisclaimer: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('rounded-xl border-2 border-amber-400 bg-amber-50 px-5 py-5', className)}>
    <div className="flex gap-4">
      <TriangleAlert className="mt-0.5 h-6 w-6 shrink-0 text-amber-500" />
      <p className="text-sm leading-relaxed text-amber-900">
        Informacije na ovom sajtu su informativnog karaktera. Pre primene sredstva za zaštitu bilja
        obavezno pročitati i pridržavati se pratećeg uputstva i etikete, kako bi se izbegli rizici
        po zdravlje ljudi i životnu sredinu. Koristite proizvode za zaštitu bilja bezbedno i
        odgovorno.
      </p>
    </div>
  </div>
)
