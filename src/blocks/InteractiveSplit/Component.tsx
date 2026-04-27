'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  Droplet,
  FlaskConical,
  HeartHandshake,
  Leaf,
  type LucideIcon,
  Shield,
  Sprout,
  Sun,
  Target,
  Users,
  Zap,
} from 'lucide-react'

import type { InteractiveSplitBlock as InteractiveSplitBlockProps } from '@/payload-types'

const iconMap: Record<string, LucideIcon> = {
  leaf: Leaf,
  sprout: Sprout,
  shield: Shield,
  flask: FlaskConical,
  badgeCheck: BadgeCheck,
  droplet: Droplet,
  sun: Sun,
  zap: Zap,
  target: Target,
  award: Award,
  users: Users,
  handshake: HeartHandshake,
}

type Theme = 'emerald' | 'amber' | 'sky' | 'rose' | 'violet'

// Themed surfaces. We keep the AGROARM primary green identity by always
// folding in a green tint somewhere, even on non-green themes — this keeps
// the page feeling cohesive.
const themeStyles: Record<
  Theme,
  {
    bg: string
    iconBg: string
    iconRing: string
    chipHover: string
    accentText: string
    glow: string
  }
> = {
  emerald: {
    bg: 'bg-gradient-to-br from-[#024E29] via-[#007D41] to-[#009F54]',
    iconBg: 'bg-white/10',
    iconRing: 'ring-white/30',
    chipHover: 'hover:bg-white hover:text-[#024E29]',
    accentText: 'text-white',
    glow: 'shadow-[0_24px_60px_-20px_rgba(0,125,65,0.55)]',
  },
  amber: {
    bg: 'bg-gradient-to-br from-[#1F2A24] via-[#3a5f3e] to-[#c8a84b]',
    iconBg: 'bg-amber-200/15',
    iconRing: 'ring-amber-200/40',
    chipHover: 'hover:bg-amber-100 hover:text-[#3a2b04]',
    accentText: 'text-amber-50',
    glow: 'shadow-[0_24px_60px_-20px_rgba(200,168,75,0.45)]',
  },
  sky: {
    bg: 'bg-gradient-to-br from-[#024E29] via-[#0d6488] to-[#3aa6c7]',
    iconBg: 'bg-sky-200/15',
    iconRing: 'ring-sky-200/40',
    chipHover: 'hover:bg-sky-100 hover:text-[#0d3a4d]',
    accentText: 'text-sky-50',
    glow: 'shadow-[0_24px_60px_-20px_rgba(58,166,199,0.45)]',
  },
  rose: {
    bg: 'bg-gradient-to-br from-[#024E29] via-[#7a3a4a] to-[#c25268]',
    iconBg: 'bg-rose-200/15',
    iconRing: 'ring-rose-200/40',
    chipHover: 'hover:bg-rose-100 hover:text-[#5a1a26]',
    accentText: 'text-rose-50',
    glow: 'shadow-[0_24px_60px_-20px_rgba(194,82,104,0.45)]',
  },
  violet: {
    bg: 'bg-gradient-to-br from-[#024E29] via-[#4d3a7a] to-[#8c5fc4]',
    iconBg: 'bg-violet-200/15',
    iconRing: 'ring-violet-200/40',
    chipHover: 'hover:bg-violet-100 hover:text-[#2a1a4a]',
    accentText: 'text-violet-50',
    glow: 'shadow-[0_24px_60px_-20px_rgba(140,95,196,0.45)]',
  },
}

const collectionToUrlPrefix: Record<string, string> = {
  pages: '',
  posts: '/posts',
  products: '/proizvodi',
  categories: '/kategorije',
}

type LinkLike = {
  type?: 'reference' | 'custom' | null
  reference?: { relationTo?: string | null; value?: any } | null
  url?: string | null
  label?: string | null
  newTab?: boolean | null
} | null
  | undefined

function resolveLink(link: LinkLike): { href: string; label: string; newTab: boolean } | null {
  if (!link) return null
  const newTab = !!link.newTab

  if (link.type === 'reference' && link.reference?.value && typeof link.reference.value === 'object') {
    const slug = link.reference.value.slug
    if (!slug) return null
    const prefix = collectionToUrlPrefix[link.reference.relationTo ?? 'pages'] ?? ''
    const href = `${prefix}/${slug}`
    const label = link.label || link.reference.value.title || slug
    return { href, label, newTab }
  }
  if (link.type === 'custom' && link.url) {
    return { href: link.url, label: link.label || link.url, newTab }
  }
  return null
}

// ── Animated stat counter ──────────────────────────────────────────────────

function StatValue({ value }: { value: string }) {
  // Parse once per `value`. Without memoising, `match()` returns a new array
  // each render which retriggers the animation effect → counter resets to 0
  // → flicker.
  const parsed = React.useMemo(() => {
    const m = value.match(/^(\d+)(.*)$/)
    if (!m) return null
    return { target: parseInt(m[1], 10), suffix: m[2] ?? '' }
  }, [value])

  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })
  const [display, setDisplay] = useState(parsed ? `0${parsed.suffix}` : value)

  useEffect(() => {
    if (!parsed || !inView) return
    const { target, suffix } = parsed
    const duration = 900
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(`${Math.round(target * eased)}${suffix}`)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, parsed])

  return <span ref={ref}>{display}</span>
}

// ── Magnetic icon wrapper ─────────────────────────────────────────────────

function MagneticIcon({
  Icon,
  iconBg,
  iconRing,
}: {
  Icon: LucideIcon
  iconBg: string
  iconRing: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 })
  const rotate = useTransform(sx, [-30, 30], [-8, 8])

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    // Scale the pull so the icon doesn't fly out of its badge.
    x.set(Math.max(-30, Math.min(30, dx * 0.25)))
    y.set(Math.max(-30, Math.min(30, dy * 0.25)))
  }
  const onMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`relative flex h-20 w-20 items-center justify-center rounded-2xl ${iconBg} ring-1 ${iconRing} backdrop-blur-sm`}
    >
      <motion.span
        style={{ x: sx, y: sy, rotate }}
        className="flex items-center justify-center text-white"
      >
        <Icon className="h-9 w-9" strokeWidth={1.75} />
      </motion.span>
    </div>
  )
}

// ── Single card ───────────────────────────────────────────────────────────

type CardData = NonNullable<InteractiveSplitBlockProps['cards']>[number]

function SplitCard({ card, index }: { card: CardData; index: number }) {
  const Icon = (card.icon ? iconMap[card.icon] : null) ?? Leaf
  const theme = (card.theme ?? 'emerald') as Theme
  const styles = themeStyles[theme]
  const primary = resolveLink(card.primaryLink as LinkLike)
  const chips = (card.chips ?? [])
    .map((c) => resolveLink(c?.link as LinkLike))
    .filter((c): c is { href: string; label: string; newTab: boolean } => Boolean(c))

  const [hovered, setHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })

  // 3D tilt — rotateX/Y driven by cursor offset from card center.
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const sTiltX = useSpring(tiltX, { stiffness: 180, damping: 16 })
  const sTiltY = useSpring(tiltY, { stiffness: 180, damping: 16 })

  // Cursor-tracking spotlight position (in %, for radial-gradient).
  const [spot, setSpot] = useState({ x: 50, y: 50 })

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    // Tilt range stays gentle (≈ ±5deg) so text remains readable.
    tiltY.set((px - 0.5) * 8)
    tiltX.set((0.5 - py) * 8)
    setSpot({ x: px * 100, y: py * 100 })
  }
  const onMouseLeave = () => {
    tiltX.set(0)
    tiltY.set(0)
    setHovered(false)
  }

  // Stable but card-specific floating particles. Computed once per mount.
  const particles = React.useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: ((i * 53 + index * 17) % 100) + Math.random() * 4,
        delay: (i % 7) * 0.6,
        duration: 6 + (i % 5),
        size: 6 + (i % 3) * 4,
        opacity: 0.18 + ((i % 4) * 0.06),
      })),
    [index],
  )

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      style={{
        rotateX: sTiltX,
        rotateY: sTiltY,
        transformPerspective: 1100,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ y: -6 }}
      className={`group relative overflow-hidden rounded-3xl ${styles.bg} ${styles.glow} p-8 md:p-10`}
    >
      {/* Subtle leaf pattern overlay */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-60 w-60 text-white/5"
        viewBox="0 0 200 200"
      >
        <defs>
          <pattern id={`p-${index}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill={`url(#p-${index})`} />
      </svg>

      {/* Cursor-tracking spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(380px circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.18), transparent 60%)`,
        }}
      />

      {/* Floating ambient particles (leaves on emerald, dots elsewhere) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '-20%', opacity: [0, p.opacity, p.opacity, 0] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
            }}
            className={`absolute bottom-0 ${
              theme === 'emerald'
                ? 'rounded-full bg-emerald-200/50'
                : theme === 'amber'
                  ? 'rounded-sm rotate-45 bg-amber-100/60'
                  : 'rounded-full bg-white/40'
            }`}
          />
        ))}
      </div>

      <div
        className="relative flex h-full flex-col gap-6"
        style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }}
      >
        <div className="flex items-start justify-between">
          <MagneticIcon Icon={Icon} iconBg={styles.iconBg} iconRing={styles.iconRing} />
          {card.statValue && (
            <div className={`text-right ${styles.accentText}`}>
              <div className="text-3xl font-bold leading-none md:text-4xl">
                <StatValue value={card.statValue} />
              </div>
              {card.statLabel && (
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-white/70">
                  {card.statLabel}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className={`text-2xl font-bold md:text-3xl ${styles.accentText}`}>{card.title}</h3>
          {card.description && (
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/80">
              {card.description}
            </p>
          )}
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map((chip, i) => (
              <motion.span
                key={`${chip.href}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={
                  hovered
                    ? { opacity: 1, y: 0, transition: { delay: 0.04 * i, duration: 0.3 } }
                    : { opacity: 0.85, y: 0 }
                }
                className="inline-block"
              >
                <Link
                  href={chip.href}
                  target={chip.newTab ? '_blank' : undefined}
                  rel={chip.newTab ? 'noopener noreferrer' : undefined}
                  onClick={(e) => e.stopPropagation()}
                  className={`inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition-all ${styles.chipHover}`}
                >
                  {chip.label}
                </Link>
              </motion.span>
            ))}
          </div>
        )}

        {primary && (
          <div className="mt-auto pt-4">
            <Link
              href={primary.href}
              target={primary.newTab ? '_blank' : undefined}
              rel={primary.newTab ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white"
            >
              <span className="relative">
                {primary.label || 'Saznaj više'}
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
              </span>
              <motion.span
                animate={{ x: hovered ? 4 : 0, y: hovered ? -4 : 0 }}
                transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                className="inline-flex"
              >
                <ArrowUpRight className="h-4 w-4" />
              </motion.span>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Block ────────────────────────────────────────────────────────────────

export const InteractiveSplitBlock: React.FC<InteractiveSplitBlockProps> = ({
  eyebrow,
  heading,
  subheading,
  cards = [],
}) => {
  return (
    <section className="container">
      {(eyebrow || heading || subheading) && (
        <div className="mx-auto mb-10 max-w-3xl text-center">
          {eyebrow && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#007D41]">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className="text-3xl font-bold text-[#024E29] sm:text-4xl">{heading}</h2>
          )}
          {subheading && (
            <p className="mt-4 text-base leading-relaxed text-[#1F2A24]/70">{subheading}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {(cards ?? []).map((card, i) => (
          <SplitCard key={card?.id ?? i} card={card} index={i} />
        ))}
      </div>
    </section>
  )
}
