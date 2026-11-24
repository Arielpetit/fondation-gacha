import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
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
import { Subscribers } from './collections/Subscribers'
import { Posts } from './collections/Posts'
import { Tags, Themes } from './collections/Taxonomies'
import { Users } from './collections/Users'
import { contentEditor } from './fields/richText'
import { previewUrl } from './lib/previewPath'
import { Navigation } from './globals/Navigation'
import { SiteSettings } from './globals/SiteSettings'
import { rejectSpam } from './hooks/formSpam'
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
  // Payload's own screens live at /cms (an advanced fallback); the team's admin is the custom app at /admin.
  routes: { admin: '/cms' },
  admin: {
    user: Users.slug,
    // Side-by-side live preview for news, pages and actions (refreshes on every autosave).
    livePreview: {
      collections: ['posts', 'pages', 'activities'],
      url: ({ data, collectionConfig, locale }) =>
        previewUrl(collectionConfig?.slug ?? '', data as { slug?: string; path?: string }, locale?.code),
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablette', name: 'tablet', width: 820, height: 1180 },
        { label: 'Ordinateur', name: 'desktop', width: 1440, height: 900 },
      ],
    },
    meta: {
      titleSuffix: ' — Fondation Gacha',
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Logo#Logo',
        Icon: '@/components/admin/Icon#Icon',
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    ...[Posts, Pages, Activities, Media, Themes, Tags, TeamMembers, Residents, Partners, Rooms, PressItems, Reports].map(
      withRevalidate,
    ),
    Subscribers,
    Users,
  ],
  globals: [withRevalidateGlobal(SiteSettings), withRevalidateGlobal(Navigation)],
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
  // Real emails only when SMTP is configured; otherwise Payload logs them to the console (dev).
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.EMAIL_FROM || 'site@fondationgacha.org',
        defaultFromName: 'Fondation Jean-Félicien Gacha',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        },
      })
    : undefined,
  plugins: [
    formBuilderPlugin({
      defaultToEmail: process.env.FORMS_TO_EMAIL || 'contact@fondationgacha.org',
      fields: { payment: false, state: false, country: false, upload: false, date: true },
      formOverrides: {
        labels: { singular: 'Formulaire', plural: 'Formulaires' },
        admin: { group: 'Formulaires', useAsTitle: 'title' },
        access: { read: () => true, create: isStaff, update: isStaff, delete: isStaff },
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'slug',
            type: 'text',
            unique: true,
            index: true,
            admin: { position: 'sidebar', description: 'Identifiant utilisé par le site (ex. contact, reservation-villa).' },
          },
        ],
      },
      formSubmissionOverrides: {
        labels: { singular: 'Message reçu', plural: 'Messages reçus' },
        admin: { group: 'Formulaires', defaultColumns: ['form', 'createdAt'] },
        defaultSort: '-createdAt',
        hooks: { beforeValidate: [rejectSpam] },
      },
    }),
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
