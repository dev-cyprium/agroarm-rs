import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateGoneAfterChange, revalidateGoneAfterDelete } from '../hooks/revalidateGone'

/**
 * URLs we intentionally remove (410 Gone). The middleware serves a 410 for any
 * request whose path matches an entry here — the correct, fastest signal to
 * search engines that a page is permanently gone (vs. a slower 404).
 *
 * Populated by the Redirect Importer (rows marked "Ukloni / 410") and editable
 * by hand.
 */
export const GoneUrls: CollectionConfig = {
  slug: 'gone-urls',
  labels: {
    singular: 'Uklonjen URL (410)',
    plural: 'Uklonjeni URL-ovi (410)',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'path',
    defaultColumns: ['path', 'note', 'updatedAt'],
    description: 'Stare rute koje vraćaju 410 (trajno uklonjeno) i izlaze iz indeksa.',
  },
  hooks: {
    afterChange: [revalidateGoneAfterChange],
    afterDelete: [revalidateGoneAfterDelete],
  },
  fields: [
    {
      name: 'path',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Putanja',
      admin: {
        description: 'Putanja stare rute, npr. /herbicidi/staro (bez domena).',
      },
    },
    {
      name: 'note',
      type: 'text',
      label: 'Napomena',
      admin: {
        description: 'Opciono: razlog uklanjanja.',
      },
    },
  ],
}
