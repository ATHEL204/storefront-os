# Auth fix: Vercel Postgres + Prisma adapter

## What was wrong
`EmailProvider` (magic link) in NextAuth v4 always needs a database adapter to
store one-time verification tokens — `session: { strategy: 'jwt' }` only
skips the adapter requirement for *sessions*, not for the email provider's
token storage. There was no adapter configured at all, and `lib/db.ts` was
just an in-memory `Map`, which also resets on every Vercel cold start.

## What changed
- `prisma/schema.prisma` — new models: `User`, `Account`, `Session`,
  `VerificationToken` (NextAuth's required shape) plus `Post` and `Message`
  for your app data.
- `lib/prisma.ts` — Prisma client singleton.
- `lib/db.ts` — rewritten to read/write Postgres via Prisma instead of the
  in-memory Map. Same function names, now `async` — every call site was
  updated to `await` them.
- `lib/auth.ts` — added `adapter: PrismaAdapter(prisma)`.
- `package.json` — added `@prisma/client`, `prisma`, `@next-auth/prisma-adapter`;
  `build` now runs `prisma generate` first; added `postinstall`, `db:push`,
  `db:studio` scripts.

## Setup steps

1. **Create the database** — in your Vercel project: Storage tab → Create
   Database → Postgres. Vercel auto-injects `POSTGRES_PRISMA_URL` and
   `POSTGRES_URL_NON_POOLING` into your project's env vars — that's what
   `schema.prisma` reads.

2. **Pull those env vars locally** so Prisma can create the tables:
   ```bash
   npm i -g vercel
   vercel link
   vercel env pull .env.local
   ```
   (This will overwrite `.env.local` — re-add your `GOOGLE_CLIENT_ID`,
   `GOOGLE_CLIENT_SECRET`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`,
   `NEXTAUTH_SECRET`, `NEXTAUTH_URL` afterward if the pull doesn't include
   them.)

3. **Install deps and create the tables:**
   ```bash
   npm install
   npm run db:push
   ```

4. **Rotate your credentials before deploying anywhere.** The zip you sent
   contains a live Google OAuth client secret and a live Gmail app password
   in `.env.local`. Regenerate both:
   - Google Cloud Console → APIs & Services → Credentials → reset the client
     secret on your OAuth client.
   - Google Account → Security → App passwords → revoke the old one, create
     a new one.
   Put the *new* values only in Vercel's Environment Variables (Project →
   Settings → Environment Variables), not in a committed file.

5. **Push to GitHub / redeploy on Vercel** as usual. Vercel will run
   `prisma generate` automatically via the `postinstall` script.

## Note on existing data
Your old in-memory seed posts won't be in the new database (it starts empty).
If you want those 6 sample posts back for demo purposes, say the word and
I'll add a `prisma/seed.ts` script.
