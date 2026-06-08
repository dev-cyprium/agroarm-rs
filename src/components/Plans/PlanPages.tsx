import type { Metadata } from 'next'

import Link from 'next/link'
import { notFound } from 'next/navigation'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Culture } from '@/payload-types'
import { ProtectionPlanCard } from '@/blocks/ProtectionPlansBlock/ProtectionPlanCard'
import RichText from '@/components/RichText'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import {
  PLAN_CONFIG,
  cultureHasPlan,
  cultureToPlanCard,
  getCulturePlan,
  type PlanType,
} from '@/utilities/plans'

const BRAND_GREEN = '#007D41'

// ── Category list page (e.g. /planovi-zastite) ─────────────────────────────

export async function PlansListPage({ planType }: { planType: PlanType }) {
  const cfg = PLAN_CONFIG[planType]
  const payload = await getPayload({ config: configPromise })

  const categoriesResult = await payload.find({
    collection: 'culture-groups',
    depth: 0,
    limit: 100,
    sort: 'order',
    overrideAccess: false,
  })

  const categories = categoriesResult.docs ?? []

  return (
    <article className="container py-16">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl" style={{ color: BRAND_GREEN }}>
          {cfg.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{cfg.listSubtitle}</p>
      </header>

      <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
        {categories.map((category) => {
          const slug = typeof category.slug === 'string' ? category.slug : ''
          return (
            <Link
              key={category.id}
              href={`${cfg.basePath}/${slug}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted/50"
              style={{ borderColor: 'color-mix(in srgb, #007D41 25%)' }}
            >
              <span className="font-medium" style={{ color: BRAND_GREEN }}>
                {category.title}
              </span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
                <path
                  d="M7.5 5L12.5 10L7.5 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          )
        })}
      </div>
    </article>
  )
}

// ── Slug resolution (group archive or culture detail) ──────────────────────

async function resolve(slug: string) {
  const payload = await getPayload({ config: configPromise })
  const [groupResult, cultureResult] = await Promise.all([
    payload.find({
      collection: 'culture-groups',
      depth: 0,
      limit: 1,
      where: { slug: { equals: slug } },
      overrideAccess: false,
    }),
    payload.find({
      collection: 'cultures',
      depth: 2,
      limit: 1,
      where: { slug: { equals: slug } },
      overrideAccess: false,
    }),
  ])
  return { group: groupResult.docs?.[0], culture: cultureResult.docs?.[0] as Culture | undefined }
}

export async function getPlanSlugMetadata({
  slug,
  planType,
}: {
  slug: string
  planType: PlanType
}): Promise<Metadata> {
  const cfg = PLAN_CONFIG[planType]
  const { group, culture } = await resolve(slug)

  if (culture && cultureHasPlan(culture, planType)) {
    return {
      title: `${culture.title ?? cfg.title} - ${cfg.title}`,
      description: getCulturePlan(culture, planType)?.description ?? undefined,
    }
  }
  if (group) {
    return { title: `${group.title ?? cfg.title} - ${cfg.title}` }
  }
  return { title: cfg.title }
}

export async function PlanSlugPage({ slug, planType }: { slug: string; planType: PlanType }) {
  const cfg = PLAN_CONFIG[planType]
  const { group, culture } = await resolve(slug)

  // Culture detail (only if it actually has this plan type)
  if (culture && cultureHasPlan(culture, planType)) {
    return <PlanDetail culture={culture} planType={planType} />
  }

  // Category archive
  if (group) {
    return <CategoryArchive groupId={group.id} groupTitle={group.title} planType={planType} />
  }

  notFound()
}

function PlanDetail({ culture, planType }: { culture: Culture; planType: PlanType }) {
  const plan = getCulturePlan(culture, planType)
  const image = plan?.image as { url?: string; alt?: string; updatedAt?: string } | null | undefined
  const imageUrl = image?.url ? getMediaUrl(image.url, image.updatedAt) : null

  return (
    <article className="container py-16">
      <div className="mx-auto max-w-3xl">
        {imageUrl && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
            <img
              src={imageUrl}
              alt={image?.alt || culture.title || ''}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <h1 className="text-3xl font-semibold sm:text-4xl" style={{ color: BRAND_GREEN }}>
          {culture.title}
        </h1>
        {plan?.content ? (
          <RichText className="mt-8" data={plan.content} enableGutter={false} />
        ) : (
          plan?.description && (
            <div className="mt-6 prose prose-lg">
              <p>{plan.description}</p>
            </div>
          )
        )}
      </div>
    </article>
  )
}

async function CategoryArchive({
  groupId,
  groupTitle,
  planType,
}: {
  groupId: number
  groupTitle?: string | null
  planType: PlanType
}) {
  const cfg = PLAN_CONFIG[planType]
  const payload = await getPayload({ config: configPromise })

  const culturesResult = await payload.find({
    collection: 'cultures',
    depth: 2,
    limit: 100,
    where: { cultureGroup: { equals: groupId } },
    overrideAccess: false,
  })

  const plans = (culturesResult.docs ?? [])
    .filter((culture) => cultureHasPlan(culture as Culture, planType))
    .map((culture) => cultureToPlanCard(culture as Culture, planType))

  return (
    <article className="container py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold sm:text-4xl" style={{ color: BRAND_GREEN }}>
          {groupTitle}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {cfg.title} u kategoriji {groupTitle}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {plans.map((plan) => (
          <ProtectionPlanCard key={plan.id} plan={plan} basePath={cfg.basePath} />
        ))}
      </div>
    </article>
  )
}
