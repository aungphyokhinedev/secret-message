# SecretGift

A Next.js app for sending **secret messages** and **virtual gifts** with timed unlocks.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres)

## Project structure

```text
src/
  app/
  components/
    landing/
    layout/
  hooks/
  lib/
    supabase/
  types/
supabase/
  schema.sql
```

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in values in `.env.local`:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (example: `http://localhost:3000`)

4. Run the app:

   ```bash
   npm run dev
   ```

## Supabase setup

1. Create a new Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql` to create the app tables/views (`profiles`, `messages`, `gifts`, `interactions`, `interactions_feed`) with RLS policies.
3. In Supabase Auth settings, enable your sign-in providers (email or OAuth like Google).
4. In Supabase Dashboard -> Authentication -> URL configuration, add callback URLs:
   - `http://localhost:3000/auth/callback`
   - `http://127.0.0.1:3000/auth/callback`
   - `https://YOUR-PRODUCTION-DOMAIN/auth/callback`
5. In each OAuth provider console (for example Google Cloud), add the same callback URLs.
6. Premium sender identity visibility is currently manual: set `profiles.is_premium = true` for specific users in Supabase Table Editor or SQL.

## Notes

- `src/lib/supabase/client.ts` provides a browser client.
- `src/lib/supabase/server.ts` provides a server client for App Router server components.
- `src/hooks/useAuth.ts` includes a basic auth state hook.
- `src/types/database.ts` contains starter database types for strongly typed queries.
