/**
 * Custom upload handler that streams media files from R2 when disablePayloadAccessControl
 * is true. The storage-s3 plugin only registers its staticHandler for client-upload
 * context in that case, so /api/media/file/:filename would otherwise hit Payload's
 * default disk handler and fail when files are only in R2.
 */
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import path from 'path'
import type { PayloadRequest, TypeWithID } from 'payload'

const bucket = process.env.R2_BUCKET || process.env.S3_BUCKET || ''
const r2Enabled = bucket.length > 0

const endpoint =
  process.env.R2_ENDPOINT ||
  process.env.S3_ENDPOINT ||
  (process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}${process.env.R2_JURISDICTION === 'eu' ? '.eu' : ''}.r2.cloudflarestorage.com`
    : '')

let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey:
          process.env.R2_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || '',
      },
    })
  }
  return s3Client
}

const MEDIA_PREFIX = 'media'

export const r2FileHandler = async (
  req: PayloadRequest,
  args: {
    doc: TypeWithID & { prefix?: string }
    params: { clientUploadContext?: unknown; collection: string; filename: string }
  },
): Promise<Response | void> => {
  const { doc, params } = args
  // NOTE: `doc` is undefined when the collection's read access returns a boolean
  // (e.g. `anyone` → true) instead of a query constraint — Payload's
  // checkFileAccess only resolves the doc for object/query access results. We
  // must not gate on `doc`, or every /api/media/file request would fall through
  // to Payload's local-disk handler and 500 ("missing on the disk") even though
  // the file is on R2. The prefix defaults to 'media' (the plugin's configured
  // prefix) when `doc` is absent.
  if (!r2Enabled || !params?.filename) {
    return
  }

  const filename = params.filename
  const prefix = doc?.prefix ?? MEDIA_PREFIX
  const key = path.posix.join(prefix, filename)

  try {
    const client = getS3Client()
    const command = new GetObjectCommand({ Bucket: bucket, Key: key })
    const response = await client.send(command)

    if (!response.Body) {
      return new Response(null, { status: 404, statusText: 'Not Found' })
    }

    const contentType = response.ContentType ?? 'application/octet-stream'
    const headers = new Headers()
    headers.set('Content-Type', contentType)
    if (response.ETag) {
      headers.set('ETag', response.ETag)
    }
    if (response.ContentLength != null) {
      headers.set('Content-Length', String(response.ContentLength))
    }
    if (response.ContentType === 'image/svg+xml') {
      headers.set('Content-Security-Policy', "script-src 'none'")
    }

    return new Response(response.Body as ReadableStream, {
      status: 200,
      headers,
    })
  } catch (err: unknown) {
    const isNotFound =
      err &&
      typeof err === 'object' &&
      (('name' in err && (err as { name: string }).name === 'NoSuchKey') ||
        ('$metadata' in err &&
          typeof (err as { $metadata?: { httpStatusCode?: number } }).$metadata === 'object' &&
          (err as { $metadata: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404))
    if (isNotFound) {
      return new Response(null, { status: 404, statusText: 'Not Found' })
    }
    req.payload.logger.error(err)
    return new Response(null, { status: 500, statusText: 'Internal Server Error' })
  }
}
