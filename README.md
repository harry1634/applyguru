# ApplyGuru

> AI-powered job search management — track every application, optimize your resume, generate cover letters, and ace interviews.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth (email + OAuth) |
| AI | OpenAI GPT-4o via Vercel AI SDK |
| Payments | Stripe |
| File uploads | UploadThing |
| Email | Resend |
| Data fetching | TanStack Query v5 |
| Animations | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Toasts | Sonner |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-org/applyguru.git
cd applyguru
npm install
```

### 2. Environment variables

```bash
cp .env.local.template .env.local
# Fill in all required values
```

### 3. Start Supabase locally (optional)

```bash
npx supabase start       # starts local Postgres + Auth + Studio
npm run db:migrate       # apply all migrations
```

### 4. Run the dev server

```bash
npm run dev
# http://localhost:3000
```

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── (auth)/           # Login, signup, password reset
│   ├── (dashboard)/      # Protected app pages
│   ├── (marketing)/      # Public landing, pricing, blog
│   ├── api/              # API route handlers
│   └── onboarding/       # New user setup flow
├── components/           # React components
│   ├── ai/               # AI-powered tools (streaming)
│   ├── analytics/        # Charts and stat cards
│   ├── applications/     # Kanban board, cards, forms
│   ├── auth/             # Login/signup forms, OAuth
│   ├── billing/          # Stripe pricing and portal
│   ├── layout/           # Navbar, sidebar, header, footer
│   ├── providers/        # React context providers
│   ├── shared/           # Reusable UI components
│   └── ui/               # shadcn/ui primitives
├── config/               # Site config, plans, constants
├── hooks/                # Custom React hooks
├── lib/                  # External service clients
│   ├── supabase/         # Browser + server + admin clients
│   ├── stripe/           # Stripe Node client
│   ├── openai/           # OpenAI client
│   └── uploadthing/      # File upload router
├── server/               # Server-side code
│   ├── actions/          # Next.js Server Actions
│   └── queries/          # DB query functions
├── styles/               # Global CSS & CSS variables
└── types/                # TypeScript types & database schema
```

---

## Key Features

### Kanban Application Tracker
Drag-and-drop applications through: **Wishlist → Applied → Screening → Interview → Offer**. Optimistic UI updates with auto-rollback on failure.

### AI Cover Letter Generator
Streaming GPT-4o completion. Provide job title, company, and JD — get a tailored cover letter instantly.

### AI Resume Optimizer
Upload resume text + job description. Get a match score, missing keywords, gaps, and specific improvement suggestions.

### AI Interview Coach
Chat-based mock interview. Role-specific questions, real-time answer feedback, session history.

### Analytics Dashboard
Application funnel visualization, response rate tracking, time-series trend chart.

### Stripe Billing
Free tier + Pro subscription. Webhook-driven subscription sync. Customer portal for self-service.

---

## Scripts

```bash
npm run dev            # Development server
npm run build          # Production build
npm run lint           # ESLint
npm run type-check     # TypeScript check (no emit)
npm run format         # Prettier
npm run db:generate    # Regenerate Supabase types
npm run db:reset       # Reset local DB + re-seed
```

---

## Database Migrations

All migrations live in `supabase/migrations/` and run in order:

| File | Description |
|---|---|
| `0001_create_profiles.sql` | User profiles, auto-created on signup |
| `0002_create_applications.sql` | Job applications with enums and RLS |
| `0003_create_contacts.sql` | Network contacts CRM |
| `0004_create_documents.sql` | Resume and document storage |
| `0005_create_subscriptions.sql` | Stripe subscription tracking |
| `0006_create_application_events.sql` | Activity timeline, auto-logged |

All tables have Row Level Security enabled — users can only access their own data.

---

## Deployment

### Vercel (recommended)

```bash
vercel deploy
```

Set all env vars from `.env.local.template` in Vercel dashboard.

### Docker

Uncomment `output: "standalone"` in `next.config.ts`, then:

```bash
docker build -t applyguru .
docker run -p 3000:3000 applyguru
```

---

## Environment Variables

See `.env.local.template` for the full list. Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`

---

## License

MIT © ApplyGuru
