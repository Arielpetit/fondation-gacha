#!/usr/bin/env bash
# Copies the content of the local database into the hosted (Supabase) one.
# Run AFTER the schema exists there:  DATABASE_URL=<supabase url> pnpm payload migrate
#   LOCAL_URL=postgresql://…@127.0.0.1:5434/gacha REMOTE_URL=<supabase direct or session url> bash scripts/deploy/copy-data.sh
set -euo pipefail
: "${LOCAL_URL:?}" "${REMOTE_URL:?}"
pg_dump --data-only --disable-triggers --no-owner --no-privileges --exclude-table='payload_migrations' --exclude-table='payload_locked_documents*' --exclude-table='payload_preferences*' --exclude-table='users_sessions' "$LOCAL_URL" > /tmp/gacha-data.sql
psql "$REMOTE_URL" -v ON_ERROR_STOP=1 -c "SET session_replication_role = replica;" -f /tmp/gacha-data.sql
psql "$REMOTE_URL" -Atc "select 'posts', count(*) from posts union all select 'media', count(*) from media union all select 'pages', count(*) from pages"
