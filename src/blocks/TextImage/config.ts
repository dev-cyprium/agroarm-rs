import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const TextImage: Block = {
  slug: 'textImage',
  interfaceName: 'TextImageBlock',
  labels: {
    singular: 'Tekst + Slika',
    plural: 'Tekst + Slika',
  },
  fields: [
    {
      name: 'text',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'imagePosition',
          type: 'select',
          defaultValue: 'right',
          options: [
            { label: 'Levo', value: 'left' },
            { label: 'Desno', value: 'right' },
          ],
          admin: {
            width: '50%',
            description: 'Strana na kojoj se prikazuje slika u odnosu na tekst.',
          },
        },
        {
          name: 'imageSize',
          type: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'Mala (≈ 1/3 širine)', value: 'small' },
            { label: 'Srednja (≈ 1/2 širine)', value: 'medium' },
            { label: 'Velika (≈ 2/3 širine)', value: 'large' },
          ],
          admin: {
            width: '50%',
            description: 'Udeo širine koji slika zauzima u odnosu na tekst.',
          },
        },
      ],
    },
    {
      name: 'verticalAlignment',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Vrh (poravnaj početke)', value: 'top' },
        { label: 'Sredina (vertikalno centrirano)', value: 'center' },
        { label: 'Dno (poravnaj donje ivice)', value: 'bottom' },
      ],
      admin: {
        description: 'Vertikalno poravnanje teksta u odnosu na sliku.',
      },
    },
    {
      name: 'imageMaxHeight',
      type: 'number',
      label: 'Maksimalna visina slike (px)',
      min: 100,
      max: 1200,
      admin: {
        description:
          'Opcionalno — ograničava visinu slike. Ako je prazno, koristi se podrazumevani odnos 4:3.',
        step: 10,
      },
    },
    {
      name: 'backgroundColor',
      type: 'text',
      label: 'Boja pozadine',
      admin: {
        description: 'Hex boja (npr. #F4F8F6, #E6EFEA). Ostavite prazno za bez pozadine.',
      },
    },
  ],
}
