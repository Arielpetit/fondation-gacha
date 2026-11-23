import {
  BlocksFeature,
  FixedToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Field } from 'payload'

import { EmbedBlock } from '@/blocks/Embed'

/** Editor used for all long-form content (news, pages, activities). */
export const contentEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
    BlocksFeature({ blocks: [EmbedBlock] }),
  ],
})

export const contentField = (overrides: Partial<Field> = {}): Field =>
  ({
    name: 'content',
    label: 'Contenu',
    type: 'richText',
    localized: true,
    editor: contentEditor,
    ...overrides,
  }) as Field
