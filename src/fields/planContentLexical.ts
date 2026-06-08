import {
  BlocksFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { TreatmentSchedule } from '@/blocks/TreatmentSchedule/config'

// Editor used for the plan content area (Plan zaštite / Plan ishrane).
// Rich text + the ability to insert a "Plan tretmana" timeline block.
export const planContentLexical = lexicalEditor({
  features: [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    LinkFeature({ enabledCollections: ['pages', 'posts', 'products'] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
    BlocksFeature({ blocks: [TreatmentSchedule] }),
  ],
})
