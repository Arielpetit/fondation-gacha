# Deploying (Supabase + Vercel)

What lives where: **Vercel** runs the site and the admin; **Supabase Postgres** holds the content;
**Supabase Storage** (S3 compatible) holds the photos. Payload serves photos through `/api/media/file/…`, so URLs do not change.

## One-time setup
1. **Supabase → Storage**: create a bucket named `media` (public off is fine). **Storage → S3 connection**: create access keys.
2. **Supabase → Project Settings → Database**: copy the *Transaction pooler* URL (port 6543) for the site, and the
   *Session pooler / direct* URL for migrations and the data copy.
3. Create the schema:  `DATABASE_URL=<session url> pnpm payload migrate`
4. Copy the content:  `LOCAL_URL=… REMOTE_URL=<session url> bash scripts/deploy/copy-data.sh`
5. Copy the photos:  `S3_* … node scripts/deploy/upload-media.mjs`
6. **Vercel**: import the GitHub repo, set the environment variables below, deploy. `vercel.json` runs the migrations before each build.

## Environment variables (Vercel)
`DATABASE_URL` (transaction pooler), `PAYLOAD_SECRET` (new long random value), `NEXT_PUBLIC_SERVER_URL` (final https URL),
`PREVIEW_SECRET`, `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`,
and later `SMTP_*`, `FORMS_TO_EMAIL`, `MAILCHIMP_*`.

## After the first deploy
Create your administrator account at `/admin` (the first account becomes administrator), then point the domain
(`fondationgacha.org`) at Vercel in OVH DNS.
