/**
 * Uploads every file of ./media to the S3 bucket (Supabase Storage), keeping file names so the existing
 * database rows keep working. Safe to re-run: files already in the bucket are skipped.
 *   S3_BUCKET=… S3_ENDPOINT=… S3_REGION=… S3_ACCESS_KEY_ID=… S3_SECRET_ACCESS_KEY=… node scripts/deploy/upload-media.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const { S3_BUCKET, S3_ENDPOINT, S3_REGION = 'eu-west-1', S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env
if (!S3_BUCKET || !S3_ENDPOINT || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) throw new Error('Missing S3_* environment variables')
const s3 = new S3Client({ endpoint: S3_ENDPOINT, region: S3_REGION, forcePathStyle: true, credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY } })
const TYPES = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.mp4': 'video/mp4' }

const dir = path.resolve('media')
const files = fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isFile())
let done = 0, skipped = 0, failed = 0
const queue = [...files]
async function worker() {
  while (queue.length) {
    const f = queue.shift()
    try {
      await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: f }))
      skipped++
    } catch {
      try {
        await s3.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: f, Body: fs.readFileSync(path.join(dir, f)), ContentType: TYPES[path.extname(f).toLowerCase()] ?? 'application/octet-stream' }))
        done++
      } catch (e) {
        failed++
        console.error('FAILED', f, e.message)
      }
    }
    if ((done + skipped + failed) % 100 === 0) console.log(`${done + skipped + failed}/${files.length}`)
  }
}
await Promise.all(Array.from({ length: 8 }, worker))
console.log(`uploaded ${done}, already there ${skipped}, failed ${failed}, total ${files.length}`)
