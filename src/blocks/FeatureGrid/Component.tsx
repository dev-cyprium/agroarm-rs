import React from 'react'
import {
  Award,
  BadgeCheck,
  BookOpen,
  Clock,
  Compass,
  Droplet,
  FlaskConical,
  HeartHandshake,
  Leaf,
  type LucideIcon,
  MapPin,
  Phone,
  Shield,
  Sprout,
  Sun,
  Target,
  Tractor,
  Trophy,
  Truck,
  Users,
  Zap,
} from 'lucide-react'

import RichText from '@/components/RichText'

import type { FeatureGridBlock as FeatureGridBlockProps } from '@/payload-types'

const iconMap: Record<string, LucideIcon> = {
  leaf: Leaf,
  sprout: Sprout,
  flask: FlaskConical,
  shield: Shield,
  badgeCheck: BadgeCheck,
  award: Award,
  users: Users,
  handshake: HeartHandshake,
  truck: Truck,
  sun: Sun,
  droplet: Droplet,
  book: BookOpen,
  phone: Phone,
  tractor: Tractor,
  clock: Clock,
  compass: Compass,
  mapPin: MapPin,
  target: Target,
  zap: Zap,
  trophy: Trophy,
}

type Columns = NonNullable<FeatureGridBlockProps['columns']>
type CardStyle = NonNullable<FeatureGridBlockProps['cardStyle']>

const columnsClass: Record<Columns, string> = {
  '2': 'sm:grid-cols-2',
  '3': 'sm:grid-cols-2 lg:grid-cols-3',
  '4': 'sm:grid-cols-2 lg:grid-cols-4',
}

const cardClass: Record<CardStyle, string> = {
  soft: 'rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md',
  outline:
    'rounded-2xl border border-[#E6EFEA] bg-white p-6 transition-colors hover:border-[#007D41]/40',
  plain: 'p-2',
}

const iconWrapperClass: Record<CardStyle, string> = {
  soft: 'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#007D41]/10 text-[#007D41]',
  outline:
    'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#F4F8F6] text-[#007D41]',
  plain: 'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#007D41]/10 text-[#007D41]',
}

export const FeatureGridBlock: React.FC<FeatureGridBlockProps> = (props) => {
  const {
    eyebrow,
    heading,
    lead,
    columns = '3',
    cardStyle = 'soft',
    items = [],
  } = props

  const cols = (columns ?? '3') as Columns
  const style = (cardStyle ?? 'soft') as CardStyle

  return (
    <section className="container">
      {(eyebrow || heading || lead) && (
        <div className="mx-auto mb-10 max-w-3xl text-center">
          {eyebrow && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#007D41]">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className="text-3xl font-bold text-[#024E29] sm:text-4xl">{heading}</h2>
          )}
          {lead && (
            <div className="mt-4 text-base leading-relaxed text-[#1F2A24]/70 [&_p]:m-0">
              <RichText data={lead} enableGutter={false} enableProse={false} />
            </div>
          )}
        </div>
      )}

      <div className={`grid grid-cols-1 gap-5 ${columnsClass[cols]}`}>
        {(items ?? []).map((item, idx) => {
          const Icon = item?.icon ? iconMap[item.icon] : null
          return (
            <div key={item?.id ?? idx} className={cardClass[style]}>
              {Icon && (
                <span className={iconWrapperClass[style]}>
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </span>
              )}
              {item?.title && (
                <h3 className="mb-2 text-lg font-semibold text-[#024E29]">{item.title}</h3>
              )}
              {item?.description && (
                <p className="text-sm leading-relaxed text-[#1F2A24]/70">{item.description}</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
