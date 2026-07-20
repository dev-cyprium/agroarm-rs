import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { s3Storage } from '@payloadcms/storage-s3'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Website Template` : 'Payload Website Template'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

const r2Bucket = process.env.R2_BUCKET || process.env.S3_BUCKET || ''
const r2Enabled = r2Bucket.length > 0

// Build R2 endpoint: use R2_ENDPOINT if set, otherwise construct from R2_ACCOUNT_ID
// If getting AccessDenied, try switching jurisdiction (bucket must match endpoint)
const r2Endpoint =
  process.env.R2_ENDPOINT ||
  process.env.S3_ENDPOINT ||
  (process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}${process.env.R2_JURISDICTION === 'eu' ? '.eu' : ''}.r2.cloudflarestorage.com`
    : '')

export const plugins: Plugin[] = [
  ...(r2Enabled
    ? [
        s3Storage({
          collections: {
            media: {
              prefix: 'media',
              disablePayloadAccessControl: true,
              generateFileURL: ({ filename, prefix }) => {
                const baseUrl = (
                  process.env.R2_PUBLIC_URL ||
                  process.env.R2_CUSTOM_DOMAIN ||
                  ''
                ).replace(/\/$/, '')
                const path = [prefix, filename].filter(Boolean).join('/')
                if (!baseUrl) return `/${path}`
                return `${baseUrl}/${path}`
              },
            },
          },
          bucket: r2Bucket,
          config: {
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || '',
              secretAccessKey:
                process.env.R2_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || '',
            },
            region: 'auto',
            endpoint: r2Endpoint,
            forcePathStyle: true,
          },
        }),
      ]
    : []),
  redirectsPlugin({
    // All routable collections so a redirect can point at any new content type.
    // `cultures` is intentionally excluded — plan redirects use custom URLs
    // (a culture is served at both /planovi-zastite and /planovi-ishrane).
    collections: ['pages', 'posts', 'products', 'categories'],
    overrides: {
      admin: {
        defaultColumns: ['from', 'to.type', 'importStatus', 'importConfidence', 'updatedAt'],
      },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        const mapped = defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })

        // Extra columns populated by the Redirect Importer so the client can
        // finish the migration from the normal Redirects table.
        return [
          ...mapped,
          {
            name: 'importStatus',
            type: 'select',
            label: 'Status migracije',
            admin: {
              position: 'sidebar',
              description: 'Status preslikavanja starog URL-a na novi.',
            },
            options: [
              { label: 'Automatski povezano', value: 'auto-matched' },
              { label: 'Za proveru', value: 'needs-review' },
              { label: 'Bez poklapanja', value: 'no-match' },
              { label: 'Potvrđeno', value: 'confirmed' },
              { label: 'Ignorisano', value: 'ignored' },
              { label: 'Preskočeno', value: 'skip' },
            ],
          },
          {
            name: 'importConfidence',
            type: 'number',
            label: 'Pouzdanost',
            admin: {
              position: 'sidebar',
              readOnly: true,
              description: 'Pouzdanost automatskog poklapanja (0–100).',
            },
          },
          {
            name: 'importNote',
            type: 'textarea',
            label: 'Napomena migracije',
            admin: { readOnly: true },
          },
          {
            name: 'importSuggestions',
            type: 'json',
            label: 'Alternativni predlozi',
            admin: {
              readOnly: true,
              description: 'Drugi mogući ciljevi koje je predložio uvoznik.',
            },
          },
        ]
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
