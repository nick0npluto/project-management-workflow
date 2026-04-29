# ProConstruct — Technical Handoff Document

## What This Is

ProConstruct is a construction project management web application built for Cornerstone Construction. It is a demo-quality, locally-hosted app designed to showcase project tracking, daily field logs, RFI management, document storage, and financial reporting across multiple projects and user roles.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix/Nova preset) |
| Charts | Recharts |
| ORM | Prisma v7 (custom output, ESM-only client) |
| Database | PostgreSQL (via local Supabase CLI) |
| Auth | Supabase Auth (local instance) |
| DB Adapter | @prisma/adapter-pg |
| Runtime | Node.js v24 |

---

## Project Structure

```
proconstruct/
├── prisma/
│   ├── schema.prisma          # Data models — source of truth for all DB structure
│   ├── seed.ts                # Creates demo auth users + populates all tables
│   └── package.json           # {"type":"module"} — required for Prisma v7 ESM client
├── prisma.config.ts           # Prisma v7 config (datasource URL, migrations path)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout — fonts, metadata, Toaster
│   │   ├── globals.css        # Tailwind + custom theme tokens (oklch colors)
│   │   ├── (auth)/
│   │   │   └── login/page.tsx # Login page — calls Supabase signInWithPassword
│   │   ├── (app)/
│   │   │   ├── layout.tsx     # Authenticated shell — fetches user, passes to Sidebar
│   │   │   ├── dashboard/     # Project overview with KPI cards
│   │   │   ├── projects/      # Project list + per-project tabbed pages
│   │   │   │   └── [projectId]/
│   │   │   │       ├── layout.tsx     # Project header + tab bar (server component)
│   │   │   │       ├── overview/      # Details, tasks, recent logs, budget
│   │   │   │       ├── daily-logs/    # Log list + submit form
│   │   │   │       ├── rfis/          # RFI table + detail panel
│   │   │   │       ├── documents/     # Document file list
│   │   │   │       └── financials/    # Spend chart + transaction history
│   │   │   ├── reports/       # Portfolio analytics (budget chart, RFI breakdown)
│   │   │   ├── admin/         # User management table
│   │   │   └── settings/      # Logged-in user profile
│   │   └── api/
│   │       └── daily-logs/route.ts  # POST endpoint — saves new daily log to DB
│   ├── components/
│   │   ├── ui/                # shadcn generated components — do not edit directly
│   │   ├── layout/
│   │   │   ├── sidebar.tsx    # Desktop sidebar — real user name, Supabase sign-out
│   │   │   ├── topbar.tsx     # Page header with title/subtitle
│   │   │   └── mobile-nav.tsx # Bottom tab bar for mobile
│   │   ├── dashboard/
│   │   │   ├── project-card.tsx    # Project summary card with budget progress
│   │   │   ├── projects-grid.tsx   # Client filter/search wrapper for project list
│   │   │   └── stats-cards.tsx     # KPI cards (active projects, budget, RFIs, tasks)
│   │   ├── project/
│   │   │   ├── project-tabs.tsx        # Client tab bar (uses usePathname)
│   │   │   ├── daily-logs-client.tsx   # Log list + submit form (client)
│   │   │   ├── rfis-client.tsx         # RFI table + slide-out detail panel (client)
│   │   │   └── financials-client.tsx   # Budget chart + transaction table (client)
│   │   ├── admin/
│   │   │   └── user-table.tsx     # User roster with role badges
│   │   ├── reports/
│   │   │   └── budget-chart.tsx   # Recharts BarChart — budget vs spent per project
│   │   └── shared/
│   │       ├── status-badge.tsx   # Colored badges for project/RFI/task status
│   │       ├── empty-state.tsx    # Per-variant empty state illustrations
│   │       └── loading-skeleton.tsx  # Skeleton loaders for async pages
│   ├── lib/
│   │   ├── prisma.ts           # Prisma singleton with PrismaPg adapter
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser Supabase client (login, sign-out)
│   │   │   └── server.ts       # Server Supabase client (middleware, layouts)
│   │   └── utils.ts            # cn(), formatCurrency(), formatDate(), budgetPercentage()
│   ├── middleware.ts            # Route protection — redirects unauthenticated to /login
│   └── generated/prisma/       # Auto-generated Prisma client — never edit manually
│       └── package.json        # {"type":"module"} — required for named ESM imports
└── .env                        # Local Supabase credentials (never commit to production)
```

---

## Database Schema

Eight models. All table names are snake_case in Postgres, camelCase in TypeScript via `@@map`.

| Model | Key Fields |
|---|---|
| `User` | `supabaseId` (links to auth.users), `role`, `fullName`, `email` |
| `Project` | `status`, `budgetTotal`, `budgetSpent`, `completionPct`, `managerId` |
| `ProjectMember` | `projectId`, `userId`, `role` — same user can have different roles per project |
| `DailyLog` | `logDate`, `workPerformed`, `crewCount`, `hoursWorked`, `issues` |
| `RFI` | `rfiNumber` (per-project), `status`, `priority`, `answer`, `answeredAt` |
| `Document` | `type`, `fileUrl`, `fileSize`, `uploadedById` |
| `Task` | `status`, `priority`, `assignedToId`, `dueDate`, `sortOrder` |
| `FinancialEntry` | `category`, `amount`, `isExpense`, `entryDate`, `vendor` |

---

## User Roles

| Role | Access |
|---|---|
| `EXECUTIVE` | Read-only across all projects and financials |
| `PROJECT_MANAGER` | Full access — create/update RFIs, tasks, logs |
| `FIELD_SUPERVISOR` | Daily logs, RFIs — no financials |
| `ADMIN` | Financials, documents, user management |

---

## Environment Variables

Stored in `.env` at the project root. Values come from `supabase status` after running `supabase start`.

```env
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

**Never commit real production credentials.** The `.env` file is in `.gitignore`.

---

## Demo Accounts

All accounts use password: `Password123!`

| Email | Role |
|---|---|
| exec@cornerstone.demo | Executive |
| pm@cornerstone.demo | Project Manager |
| field@cornerstone.demo | Field Supervisor |
| admin@cornerstone.demo | Admin / Accounting |

---

## Starting the App Locally

Prerequisites: **Docker Desktop** must be open and running.

```bash
# 1. Start local Supabase (Postgres + Auth)
supabase start

# 2. Start Next.js dev server
npm run dev

# 3. Open browser
open http://localhost:3000
```

To stop:
```bash
supabase stop
```

---

## Database Commands

```bash
# Apply schema changes to local DB
npm run db:push

# Re-seed the database (wipes and re-creates all demo data)
npm run db:seed

# Full reset — wipes DB, re-pushes schema, re-seeds
npm run db:reset

# Open Prisma Studio (DB table browser)
npm run db:studio

# Open Supabase Studio (full DB + Auth UI)
open http://localhost:54323
```

---

## Key Architectural Decisions

**Prisma v7 + ESM client**
Prisma v7 generates an ESM-only TypeScript client to `src/generated/prisma/`. Two `package.json` files with `{"type":"module"}` are required — one in `prisma/` (for the seed script) and one in `src/generated/prisma/` (for named imports). The client requires an explicit `@prisma/adapter-pg` driver adapter passed to `new PrismaClient({ adapter })`.

**Server vs. Client components**
Pages are server components that fetch data via Prisma and pass serialized props to client components. Prisma `Decimal` fields are converted with `Number()` and `Date` fields with `.toISOString()` before crossing the server→client boundary.

**Auth flow**
- Login: `supabase.auth.signInWithPassword()` → session stored in cookies
- Middleware reads cookie on every request, redirects to `/login` if no session
- App layout fetches the Supabase user, looks up the matching `User` row by `supabaseId`, passes name/role to sidebar
- Sign-out: `supabase.auth.signOut()` → clears cookie → redirect to `/login`

**Tab navigation**
The project layout (`[projectId]/layout.tsx`) is a server component for data fetching. The tab bar is extracted into `ProjectTabs` (client component) because it requires `usePathname` to highlight the active tab.

---

## Known Limitations (Demo Build)

- **Document upload** — Upload button is present but disabled. Files are stored as placeholder URLs in the DB. Real uploads require wiring Supabase Storage.
- **Daily log submitter** — The POST `/api/daily-logs` currently finds the first `FIELD_SUPERVISOR` user as the submitter. Real auth should pass the session user's ID.
- **Role-based UI enforcement** — Financials tab is hidden for Field Supervisors via conditional render, not middleware. A production build should enforce this server-side.
- **No email confirmation** — Supabase local auth is configured with `email_confirm: true` in the seed but no SMTP is configured. This is fine for local demo; cloud deployment needs an SMTP provider.
- **Supabase binary path** — The Supabase CLI is installed at `~/.local/bin/supabase`. Add `export PATH="$HOME/.local/bin:$PATH"` to `~/.zshrc` if the command is not found in a new terminal.

---

## GitHub Repository

`https://github.com/nick0npluto/CornerstoneConstructionCo`

---

*Built for Cornerstone Construction — ProConstruct demo, April 2026.*
