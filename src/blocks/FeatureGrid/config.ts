import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

// Curated list of lucide-react icons that make sense for an agro/products
// brand. Keep aligned with `iconMap` in Component.tsx.
const iconOptions = [
  { label: 'List (Leaf)', value: 'leaf' },
  { label: 'Mladica (Sprout)', value: 'sprout' },
  { label: 'Hemija (FlaskConical)', value: 'flask' },
  { label: 'Štit (Shield)', value: 'shield' },
  { label: 'Sertifikat (BadgeCheck)', value: 'badgeCheck' },
  { label: 'Nagrada (Award)', value: 'award' },
  { label: 'Tim (Users)', value: 'users' },
  { label: 'Rukovanje (HeartHandshake)', value: 'handshake' },
  { label: 'Dostava (Truck)', value: 'truck' },
  { label: 'Sunce (Sun)', value: 'sun' },
  { label: 'Kap (Droplet)', value: 'droplet' },
  { label: 'Knjiga (BookOpen)', value: 'book' },
  { label: 'Telefon (Phone)', value: 'phone' },
  { label: 'Traktor (Tractor)', value: 'tractor' },
  { label: 'Sat (Clock)', value: 'clock' },
  { label: 'Kompas (Compass)', value: 'compass' },
  { label: 'Mapa (MapPin)', value: 'mapPin' },
  { label: 'Cilj (Target)', value: 'target' },
  { label: 'Munja (Zap)', value: 'zap' },
  { label: 'Trofej (Trophy)', value: 'trophy' },
]

export const FeatureGrid: Block = {
  slug: 'featureGrid',
  interfaceName: 'FeatureGridBlock',
  labels: {
    singular: 'Mreža karakteristika',
    plural: 'Mreže karakteristika',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Nadnaslov',
      admin: {
        description: 'Mali tekst iznad naslova (npr. "Zašto baš mi").',
      },
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Naslov',
    },
    {
      name: 'lead',
      type: 'richText',
      label: 'Uvodni tekst',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    {
      type: 'row',
      fields: [
        {
          name: 'columns',
          type: 'select',
          defaultValue: '3',
          options: [
            { label: '2 kolone', value: '2' },
            { label: '3 kolone', value: '3' },
            { label: '4 kolone', value: '4' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'cardStyle',
          type: 'select',
          defaultValue: 'soft',
          options: [
            { label: 'Mekana karta (svetla pozadina)', value: 'soft' },
            { label: 'Obrub (samo linija)', value: 'outline' },
            { label: 'Bez kartice (čist)', value: 'plain' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      label: 'Stavke',
      labels: { singular: 'Stavka', plural: 'Stavke' },
      minRows: 1,
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'icon',
              type: 'select',
              label: 'Ikona',
              options: iconOptions,
              admin: { width: '40%' },
            },
            {
              name: 'title',
              type: 'text',
              label: 'Naslov',
              required: true,
              admin: { width: '60%' },
            },
          ],
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Opis',
        },
      ],
    },
  ],
}
