import { postgresAdapter } from '@payloadcms/db-postgres'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { isStaff } from './access/roles'
import { Activities } from './collections/Activities'
import { Partners, PressItems, Reports, Residents, Rooms, TeamMembers } from './collections/Directory'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Tags, Themes } from './collections/Taxonomies'
import { Users } from './collections/Users'
import { contentEditor } from './fields/richText'
import { SiteSettings } from './globals/SiteSettings'
import { revalidateGlobal, revalidateOnChange, revalidateOnDelete } from './hooks/revalidate'
import type { CollectionConfig, GlobalConfig } from 'payload'

/** Public content: refresh the site cache after every change. */
const withRevalidate = (c: CollectionConfig): CollectionConfig => ({
  ...c,
  hooks: {
    ...c.hooks,
    afterChange: [...(c.hooks?.afterChange ?? []), revalidateOnChange],
    afterDelete: [...(c.hooks?.afterDelete ?? []), revalidateOnDelete],
  },
})
const withRevalidateGlobal = (g: GlobalConfig): GlobalConfig => ({
  ...g,
  hooks: { ...g.hooks, afterChange: [...(g.hooks?.afterChange ?? []), revalidateGlobal] },
})

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — Fondation Gacha',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    ...[Posts, Pages, Activities, Media, Themes, Tags, TeamMembers, Residents, Partners, Rooms, PressItems, Reports].map(
      withRevalidate,
    ),
    Users,
  ],
  globals: [withRevalidateGlobal(SiteSettings)],
  localization: {
    locales: [
      { code: 'fr', label: 'Français' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'fr',
    fallback: true,
  },
  // Admin interface in French by default; each user can switch to English in their account.
  i18n: {
    fallbackLanguage: 'fr',
    supportedLanguages: { fr, en },
  },
  editor: contentEditor,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ['posts', 'pages', 'activities'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }) => `${doc?.title ?? ''} — Fondation Gacha`,
      generateDescription: ({ doc }) => doc?.summary ?? doc?.hero?.intro ?? '',
    }),
    redirectsPlugin({
      collections: ['posts', 'pages', 'activities'],
      overrides: {
        labels: { singular: 'Redirection', plural: 'Redirections' },
        admin: { group: 'Administration' },
        access: { read: () => true, create: isStaff, update: isStaff, delete: isStaff },
      },
    }),
  ],
})
