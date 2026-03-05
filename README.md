# AI Cartoosh - Full Stack Deployment Guide

## What This Is

This is the complete AI Cartoosh MVP web application — a self-contained Next.js full-stack app with:
- **Frontend**: React + Tailwind CSS (pages, components, styling)
- **Backend API**: Next.js API routes (auth, content generation, video rendering, payments)
- **Database**: PostgreSQL via Prisma ORM (all tables defined in `prisma/schema.prisma`)
- **AI Integrations**: OpenAI (text + images), ElevenLabs (voice), D-ID (video), HeyGen (Phase 2)
- **Payments**: Stripe (subscriptions + credit packs + creator payouts)

## Project Structure

```
ai-cartoosh/
├── prisma/
│   └── schema.prisma          # Complete database schema (all tables)
├── src/
│   ├── app/
│   │   ├── globals.css         # Global styles + Tailwind
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/route.ts
│   │       │   ├── login/route.ts
│   │       │   └── me/route.ts
│   │       ├── postscripts/
│   │       │   └── generate/route.ts
│   │       ├── render/
│   │       │   ├── route.ts         # Create video render job
│   │       │   └── poll/route.ts    # Poll render status
│   │       ├── feed/route.ts
│   │       ├── stripe/
│   │       │   ├── checkout/route.ts
│   │       │   └── webhook/route.ts
│   │       └── marketplace/
│   │           └── (to be built)
│   ├── lib/
│   │   ├── prisma.ts           # Database client
│   │   ├── auth.ts             # JWT auth + password hashing
│   │   ├── credits.ts          # Credit system (costs, tiers, deduction)
│   │   ├── ai-services.ts      # OpenAI, ElevenLabs, D-ID, HeyGen API calls
│   │   └── stripe.ts           # Stripe payment processing
│   └── components/             # (React components - to be built by Claude Code)
├── .env.example                # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── README.md                   # This file
```

## Prerequisites

Before deploying, you need:

1. **Node.js 18+** installed on your machine
2. **PostgreSQL** database (use Supabase, Neon, Railway, or local PostgreSQL)
3. **API accounts** with keys for: OpenAI, ElevenLabs, D-ID, Stripe
4. **Domain**: AICartoosh.com pointed to your hosting provider

## Step-by-Step Deployment

### Step 1: Install Dependencies

```bash
cd ai-cartoosh
npm install
```

### Step 2: Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in ALL values:
- `DATABASE_URL` - Your PostgreSQL connection string
- `OPENAI_API_KEY` - From platform.openai.com
- `ELEVENLABS_API_KEY` - From elevenlabs.io
- `DID_API_KEY` - From d-id.com
- `STRIPE_SECRET_KEY` - From stripe.com
- `JWT_SECRET` - Generate a random 64-character string
- `NEXTAUTH_SECRET` - Generate another random 64-character string
- All Stripe price IDs (create products in Stripe Dashboard first)

### Step 3: Set Up Database

```bash
npx prisma db push
```

This creates all tables in your PostgreSQL database.

To view/manage data:
```bash
npx prisma studio
```

### Step 4: Run Locally

```bash
npm run dev
```

Visit http://localhost:3000 to test.

### Step 5: Deploy to Production

#### Option A: Vercel (Recommended - Easiest)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Then:
1. Go to vercel.com dashboard
2. Add ALL environment variables from your `.env` file
3. Set custom domain to AICartoosh.com in project settings
4. Vercel auto-deploys on every git push

#### Option B: Railway

```bash
# Push to GitHub first, then connect Railway to your repo
# Railway auto-detects Next.js and provisions PostgreSQL
```

#### Option C: VPS (DigitalOcean, AWS, etc.)

```bash
npm run build
npm start
# Use PM2 for process management:
npm install -g pm2
pm2 start npm --name "ai-cartoosh" -- start
# Use Nginx as reverse proxy pointing to port 3000
# Use Certbot for SSL certificate
```

### Step 6: Connect Domain

Point AICartoosh.com DNS to your hosting provider:
- **Vercel**: Add CNAME record pointing to `cname.vercel-dns.com`
- **Railway**: Use their custom domain settings
- **VPS**: Point A record to your server IP

### Step 7: Set Up Stripe Webhooks

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://aicartoosh.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the webhook signing secret to your `STRIPE_WEBHOOK_SECRET` env variable

## What's Built vs What Needs Building

### ✅ Built (in this codebase)
- Complete database schema (20+ tables with all relationships)
- User authentication (register, login, JWT sessions)
- Credit system (costs, tiers, deduction, balance tracking)
- PostScript text generation via OpenAI (Verbatim + Interpretive)
- Avatar image generation via DALL-E 3
- Voice synthesis via ElevenLabs
- Video generation via D-ID (create job + poll status)
- Stripe payment processing (subscriptions + credit packs + webhooks)
- Post Show feed API
- Landing page with full design
- Complete CSS design system

### 🔨 Needs Building (by Claude Code on your desktop)
- Dashboard page (user stats, quick actions, recent activity)
- Avatar Studio page (creation form with preview)
- PSCP Terminal page (content creation interface)
- Post Show Feed page (browse published content)
- Pricing page (tier comparison + credit packs)
- Marketplace page (browse/sell AAFs and Ideas)
- Media Vault page (stored content browser)
- Rankings page (leaderboards)
- Settings page
- Onboarding flow (4-screen wizard for new users)
- Register/Login pages
- Upgrade prompt modals
- Avatar management (list, edit, delete)
- Content plan management
- PostScript publishing flow
- Video render progress UI
- Referral system UI
- Creator earnings dashboard

## Instructions for Claude Code Agent

When you open this project with Claude Code, tell it:

"This is the AI Cartoosh application. The backend is fully built — database schema, API routes, credit system, AI service integrations, and Stripe payments are all functional. I need you to build the frontend pages. Start with the register/login pages, then the dashboard, then the Avatar Studio, then the PSCP Terminal. Reference the API routes in src/app/api/ for the endpoints each page needs to call. Use the design system in globals.css (card class, btn-primary, btn-secondary, badge classes, color variables). Follow the font-display and font-body classes for typography."

## Tech Decisions Explained

- **Next.js 14**: Full-stack React framework. One codebase for frontend + API. Deploys anywhere.
- **Prisma + PostgreSQL**: Type-safe database access. Schema-as-code means the database is version controlled.
- **JWT auth (not NextAuth)**: Simpler for MVP. No OAuth dependencies. Easy to upgrade later.
- **Direct API calls (not Zapier)**: No third-party dependency for core functionality. Your server calls OpenAI/ElevenLabs/D-ID directly.
- **Stripe Checkout (not custom forms)**: PCI-compliant out of the box. No credit card data touches your server.
- **Tailwind CSS**: Rapid styling. Custom design system with AI Cartoosh brand colors.
