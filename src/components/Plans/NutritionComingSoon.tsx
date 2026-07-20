import Link from 'next/link'
import { ArrowRight, Leaf } from 'lucide-react'

// Placeholder page for "Planovi ishrane" until the nutrition programs are
// ready. Rendered on /planovi-ishrane and every /planovi-ishrane/[slug].
export function NutritionComingSoon() {
  return (
    <article className="container flex min-h-[60vh] items-center justify-center py-16">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <Leaf className="h-8 w-8 text-brand" aria-hidden />
        </span>

        <h1 className="mt-6 text-3xl font-semibold text-brand-strong sm:text-4xl">
          Planovi ishrane uskoro stižu
        </h1>

        <p className="mt-4 text-base leading-relaxed text-ink/70">
          Naš stručni tim trenutno priprema detaljne programe ishrane bilja po kulturama i
          razvojnim fazama. Ova stranica će uskoro biti dostupna — pratite nas!
        </p>

        <p className="mt-2 text-base leading-relaxed text-ink/70">
          U međuvremenu, pogledajte naše kompletne planove zaštite bilja.
        </p>

        <Link
          href="/planovi-zastite"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-medium text-white no-underline transition-colors hover:bg-brand-hover"
        >
          Planovi zaštite
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  )
}
