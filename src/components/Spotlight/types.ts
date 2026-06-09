/** Next.js cache tag for the spotlight index (revalidated on content changes). */
export const SPOTLIGHT_TAG = 'spotlight-index'

export type SpotlightType = 'culture' | 'product' | 'category' | 'culture-group'

export interface SpotlightRecord {
  /** Unique within the whole index: `${type}:${id}` */
  key: string
  id: string | number
  type: SpotlightType
  /** Display title (original casing/diacritics) */
  title: string
  /** Secondary line: culture group, active substance, "Kategorija" … */
  subtitle?: string
  /** Pre-normalized blob used for fuzzy matching (accent-stripped, lowercased) */
  keywords: string
  /** Pre-normalized title used for fuzzy matching */
  titleNormalized: string
  /** Destination link */
  url: string
  /** Optional thumbnail/icon image URL */
  iconUrl?: string
  /** For products: the culture names this record is linked to (original casing). */
  cultures?: string[]
}

export const TYPE_ORDER: SpotlightType[] = ['culture', 'product', 'category', 'culture-group']

export const TYPE_LABELS: Record<SpotlightType, string> = {
  culture: 'Kulture',
  product: 'Proizvodi',
  category: 'Kategorije',
  'culture-group': 'Grupe kultura',
}
