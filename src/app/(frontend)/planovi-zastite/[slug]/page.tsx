import type { Metadata } from 'next'

import { notFound } from 'next/navigation'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { ProtectionPlanCard } from '@/blocks/ProtectionPlansBlock/ProtectionPlanCard'
import { getMediaUrl } from '@/utilities/getMediaUrl'

const BRAND_GREEN = '#007D41'

type Args = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const [categoryResult, planResult] = await Promise.all([
    payload.find({
      collection: 'protection-plan-categories',
      depth: 0,
      limit: 1,
      where: { slug: { equals: slug } },
      overrideAccess: false,
    }),
    payload.find({
      collection: 'protection-plans',
      depth: 1,
      limit: 1,
      where: { slug: { equals: slug } },
      overrideAccess: false,
    }),
  ])

  const category = categoryResult.docs?.[0]
  const plan = planResult.docs?.[0]

  if (plan) {
    return {
      title: plan.title ?? 'Plan zastite',
      description: plan.description ?? undefined,
    }
  }

  if (category) {
    return {
      title: `${category.name ?? 'Planovi zastite'} - Planovi zastite`,
    }
  }

  return { title: 'Planovi zastite' }
}

export default async function PlanoviZastiteSlugPage({ params }: Args) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const [categoryResult, planResult] = await Promise.all([
    payload.find({
      collection: 'protection-plan-categories',
      depth: 0,
      limit: 1,
      where: { slug: { equals: slug } },
      overrideAccess: false,
    }),
    payload.find({
      collection: 'protection-plans',
      depth: 2,
      limit: 1,
      where: { slug: { equals: slug } },
      overrideAccess: false,
    }),
  ])

  const category = categoryResult.docs?.[0]
  const plan = planResult.docs?.[0]

  if (plan) {
    return <PlanDetailPage plan={plan} />
  }

  if (category) {
    return <CategoryArchivePage category={category} />
  }

  notFound()
}

function PlanDetailPage({
  plan,
}: {
  plan: { id: string | number; title: string | null; description?: string | null; image: unknown }
}) {
  const image = plan.image as { url?: string; alt?: string; updatedAt?: string } | null
  const imageUrl = image?.url ? getMediaUrl(image.url, image.updatedAt) : null

  return (
    <article className="container py-16">
      <div className="mx-auto max-w-3xl">
        {imageUrl && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
            <img
              src={imageUrl}
              alt={image?.alt || plan.title || ''}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <h1
          className="text-3xl font-bold sm:text-4xl"
          style={{ color: BRAND_GREEN }}
        >
          {plan.title}
        </h1>
        {plan.description && (
          <div className="mt-6 prose prose-lg">
            <p>{plan.description}</p>
          </div>
        )}
      </div>
    </article>
  )
}

async function CategoryArchivePage({
  category,
}: {
  category: { id: string | number; name?: string | null; slug?: string | null }
}) {
  const payload = await getPayload({ config: configPromise })

  const plansResult = await payload.find({
    collection: 'protection-plans',
    depth: 2,
    limit: 100,
    where: { category: { equals: category.id } },
    overrideAccess: false,
  })

  const plans = plansResult.docs ?? []

  return (
    <article className="container py-16">
      <header className="mb-12">
        <h1
          className="text-3xl font-bold sm:text-4xl"
          style={{ color: BRAND_GREEN }}
        >
          {category.name}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Svi planovi zastite u kategoriji {category.name}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {plans.map((plan) => (
          <ProtectionPlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </article>
  )
}
