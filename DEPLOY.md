# Deploying (Supabase + Vercel)

What lives where: **Vercel** runs the site and the admin; **Supabase Postgres** holds the content;
**Supabase Storage** (S3 compatible) holds the photos. Payload serves photos through `/api/media/file/…`, so URLs do not change.

## One-time setup
The Supabase project is **shared with other apps** (buckets `unit-photos`, `gallery`, …), so this site uses its own
Postgres schema (`foundation`) and its own bucket (`fondation-media`). Nothing else is touched.

1. Bucket `fondation-media` (private) — created. Photos: `node --env-file=.env scripts/deploy/upload-media.mjs`.
2. **Supabase → Connect**: copy the *Transaction pooler* URL (port 6543) for Vercel and the *Session pooler* URL
   (port 5432) for migrations and the data copy. (The direct `db.<ref>.supabase.co` host is IPv6-only: it does not work on Vercel.)
3. Create the tables: `DATABASE_SCHEMA=foundation DATABASE_URL=<session url> pnpm payload migrate`
4. Copy the content: `LOCAL_URL=postgresql://…@127.0.0.1:5434/gacha REMOTE_URL=<session url> bash scripts/deploy/copy-data.sh`
5. **Vercel**: import the GitHub repo, set the variables below, deploy (`vercel.json` runs the migrations first).

## Environment variables (Vercel)
`DATABASE_URL` (transaction pooler), `DATABASE_SCHEMA=foundation`, `USE_SUPABASE_STORAGE=true`, `SUPABASE_URL`,
`SUPABASE_SECRET_KEY`, `SUPABASE_BUCKET=fondation-media`, `PAYLOAD_SECRET` (new long random value),
`NEXT_PUBLIC_SERVER_URL` (final https URL), `PREVIEW_SECRET`, and later `SMTP_*`, `FORMS_TO_EMAIL`, `MAILCHIMP_*`.

## After the first deploy
Create your administrator account at `/admin` (the first account becomes administrator), then point the domain
(`fondationgacha.org`) at Vercel in OVH DNS.
