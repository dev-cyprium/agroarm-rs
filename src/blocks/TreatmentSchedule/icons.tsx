import React from 'react'

// Custom target-type icons in lucide style (24x24, stroke-based, round caps)
// for concepts lucide doesn't cover: spores (bolest), caterpillar (štetočina),
// mite (grinje). Prop-compatible with lucide components.

type IconProps = React.SVGProps<SVGSVGElement>

const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

// Virus-like spore: body with radiating spikes and a nucleus.
export const SporeIcon: React.FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="0.5" />
    <path d="M12 5 V2.5" />
    <path d="M12 19 V21.5" />
    <path d="M5 12 H2.5" />
    <path d="M19 12 H21.5" />
    <path d="M16.95 7.05 L18.7 5.3" />
    <path d="M7.05 7.05 L5.3 5.3" />
    <path d="M16.95 16.95 L18.7 18.7" />
    <path d="M7.05 16.95 L5.3 18.7" />
  </svg>
)

// Segmented caterpillar crawling, head raised, with antennae.
export const CaterpillarIcon: React.FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <circle cx="5.5" cy="16.5" r="3" />
    <circle cx="11.5" cy="15.5" r="3" />
    <circle cx="17" cy="12" r="3" />
    <path d="M18.5 9.5 L20 7" />
    <path d="M15.8 9.4 L15 6.8" />
  </svg>
)

// Mite/tick: oval body, small head, three legs per side.
export const MiteIcon: React.FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <ellipse cx="12" cy="13" rx="4.5" ry="5.5" />
    <circle cx="12" cy="6" r="1.5" />
    <path d="M7.5 10.5 L4 8.5" />
    <path d="M7 13 L3.5 13" />
    <path d="M7.5 15.5 L4.5 17.5" />
    <path d="M16.5 10.5 L20 8.5" />
    <path d="M17 13 L20.5 13" />
    <path d="M16.5 15.5 L19.5 17.5" />
  </svg>
)
