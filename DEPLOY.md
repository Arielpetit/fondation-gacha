# Deploying (Supabase + Vercel)

What lives where: **Vercel** runs the site and the admin; **Supabase Postgres** holds the content;
**Supabase Storage** (S3 compatible) holds the photos. Payload serves photos through `/api/media/file/…`, so URLs do not change.

## Status (24 Nov 2026)
Done: bucket `fondation-media` with all 2,749 files; schema `foundation` created in Supabase (migration applied);
content copied (228 news, 849 photos, 12 pages, 18 team…); tested end to end against Supabase (pages, photos,
admin login, photo upload, saving).

## Vercel
1. vercel.com → Add New → Project → import `Arielpetit/fondation-gacha`. Framework: Next.js (auto).
2. Environment Variables → **Import .env** → choose the local file `.env.vercel` (it is git-ignored; it holds the values
   listed below). Apply to Production, Preview and Development.
3. Deploy. The build runs `payload migrate` on the session pooler (`DATABASE_URL_SESSION`) then `next build`.
4. Open `/admin` on the deployed address and sign in with your existing account.
5. Settings → Domains → add `www.fondationgacha.org` (then update OVH DNS as Vercel shows).

## Environment variables
`DATABASE_URL` (transaction pooler, port 6543), `DATABASE_URL_SESSION` (session pooler, port 5432, used only by the
build), `DATABASE_SCHEMA=foundation`, `USE_SUPABASE_STORAGE=true`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
`SUPABASE_BUCKET=fondation-media`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `FORMS_TO_EMAIL`. Later: `SMTP_*`, `MAILCHIMP_*`,
and `NEXT_PUBLIC_SERVER_URL` once the custom domain is live (before that the Vercel project address is used).

## Re-running the tools
Photos: `node --env-file=.env scripts/deploy/upload-media.mjs` (skips files already there).
Content: `docker exec gacha-postgres pg_dump …` then load into schema `foundation` (see `scripts/deploy/copy-data.sh`).
