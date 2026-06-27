# STOREFRONT OS
### Portfolio Platform — Built by [ATHEL204](https://github.com/ATHEL204)

A professional portfolio platform where developers, designers, engineers and creators showcase their work publicly. Login required to contact or hire.

## Stack
- **Next.js 14** (App Router + TypeScript)
- **NextAuth.js** (Google OAuth + Email magic links)
- **In-memory data store** (swap for Supabase/PlanetScale in production)
- **Nodemailer** (Gmail SMTP for contact emails)
- **Deployed on Vercel**

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Environment variables
```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|----------|----------------|
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` (dev) or your Vercel URL (prod) |
| `GOOGLE_CLIENT_ID` | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Same as above |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Gmail App Password (myaccount.google.com → Security → App Passwords) |
| `EMAIL_FROM` | `STOREFRONT OS <your@gmail.com>` |

### 3. Google OAuth Setup
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → APIs & Services → OAuth consent screen → External
3. APIs & Services → Credentials → Create → OAuth 2.0 Client ID → Web application
4. Add Authorised JavaScript origins: `http://localhost:3000`
5. Add Authorised redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### 4. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repository
3. Add all environment variables from `.env.local`
4. Change `NEXTAUTH_URL` to your Vercel URL (e.g. `https://storefront-os.vercel.app`)
5. In Google Cloud Console, add your Vercel URL to Authorised origins and redirect URIs
6. Deploy ✓

## Project Structure
```
app/
├── page.tsx                    ← Home / explore feed
├── dashboard/page.tsx          ← User dashboard
├── auth/
│   ├── login/page.tsx          ← Login page
│   ├── verify/page.tsx         ← Email verify sent
│   └── error/page.tsx          ← Auth error page
└── api/
    ├── auth/[...nextauth]/     ← NextAuth handler
    ├── posts/                  ← Posts CRUD
    ├── contact/                ← Send messages
    └── users/                  ← User profile

components/
├── Nav.tsx                     ← Navigation bar
├── PostCard.tsx                ← Portfolio card
├── CreatePostModal.tsx         ← Post creation form
├── ContactModal.tsx            ← Contact/hire form
├── LoadingSkeleton.tsx         ← Loading state
└── ErrorState.tsx              ← Error state

lib/
├── db.ts                       ← In-memory data store + types
└── auth.ts                     ← NextAuth configuration
```

## Features
- ✅ Google OAuth login
- ✅ Email magic link login
- ✅ Public browse (no login needed)
- ✅ Login required to contact creators
- ✅ Create posts with images, links, rates
- ✅ Filter by category (Dev, Design, Engineer, Video, 3D)
- ✅ Search by title, description, creator name
- ✅ Personal dashboard with stats
- ✅ View counter on posts
- ✅ Contact form with email notification
- ✅ Loading skeletons
- ✅ Error handling
- ✅ Protected routes (middleware)
- ✅ Mobile responsive

---
*STOREFRONT OS · github.com/ATHEL204*
