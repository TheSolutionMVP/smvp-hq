# SMVP Auto-Office HQ

**The AI-powered business headquarters for MVP Solutions LLC (The Solution MVP)**

Live Dashboard: [smvp-hq.vercel.app](https://smvp-hq.vercel.app)

---

## What Is This?

SMVP HQ is a self-running digital business system built on Next.js, Supabase, and a squad of 13 AI agents organized in 3 tiers. It manages lead generation, sales outreach, product creation, content marketing, operations, analytics, and finance — all from one dashboard you can access on any device.

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + Custom CSS Design System
- **Database:** Supabase (PostgreSQL + Realtime + RLS)
- **Hosting:** Vercel
- **AI Agents:** 13 prompt-driven agents across 3 tiers

## Agent Squad

### Tier 1: Front Office (Client-Facing)

| Agent | Role | What It Does |
|-------|------|-------------|
| Rex | Lead Hunter & Market Research | Finds leads, validates niches, competitor research |
| Ace | Sales Closer & Client Relations | Cold emails, follow-ups, proposals, pipeline management |
| Atlas | Account Manager & Client Relations | Client onboarding, invoicing, billing follow-ups, retention |
| Nova | Content Writer & Copywriter | Writes listings, emails, scripts, social posts |
| Dash | Analytics & Reporting | Weekly reports, revenue tracking, growth recommendations |

### Tier 2: Back Office (Production)

| Agent | Role | What It Does |
|-------|------|-------------|
| Pixel | Web Designer & Developer | Builds websites, landing pages, full-stack development |
| Prism | Creative Producer | Video, graphics, product design |
| Echo | Social Media Manager | 8-platform social content scheduling & posting |
| Sentry | QA & Brand Compliance | Quality gate before anything publishes or deploys |
| Shelf | Store Manager | Manages Etsy, TikTok Shop, Canva Store listings |

### Tier 3: Infrastructure

| Agent | Role | What It Does |
|-------|------|-------------|
| Cortex | Orchestrator & COO | Task routing, deadlock resolution, agent coordination |
| Flux | DevOps & Deployment | Deploys sites, manages Supabase, pushes code |
| Ledger | Finance & CFO | P&L tracking, tax prep, expense management |

## Revenue Streams (Sequential Unlock)

Each stream unlocks when it hits $500/mo:

1. **Web Design** — Local business websites ($500-$1,500/build)
2. **Etsy Digital** — Digital products (planners, templates, printables)
3. **Canva Templates** — Social media kits, pitch decks, resume packs
4. **Etsy Physical** — Print-on-demand via Printify
5. **TikTok Affiliate** — Video content + affiliate links

## Dashboard Pages

| Page | Description | Data Source |
|------|-------------|-------------|
| **Dashboard** | Stats overview, agent status, approval queue, revenue | Supabase + demo fallbacks |
| **Agents** | 12-agent grid by tier with status and controls | Hardcoded metadata |
| **Pipeline** | Real-time lead tracking and deal pipeline | Supabase |
| **Streams** | Revenue stream progress with unlock thresholds | Supabase |
| **Projects** | Deliverables tracking with status filters | Supabase |
| **Clients** | Client/prospect management with scoring | Supabase |
| **Finance** | Revenue by stream, transactions, deal metrics | Supabase |
| **Content** | Content approval queue with approve/skip actions | Supabase |
| **Stores** | Etsy, Canva, TikTok store management | Supabase |
| **Command** | Direct agent commands and quick actions | UI only (Phase 2) |
| **Playbook** | Built-in operations manual and workflows | Static content |
| **Settings** | Agent autonomy sliders, system info | UI only (Phase 2) |

## Quick Start

1. Clone: `git clone https://github.com/TheSolutionMVP/smvp-hq.git`
2. Install: `cd smvp-hq/dashboard && npm install`
3. Copy `.env.example` to `.env.local` and add your Supabase keys
4. Run: `npm run dev` (opens at localhost:3000)

## Cross-Device Access

The dashboard is hosted on Vercel — open it from any device (PC, laptop, iPad, phone) via the live URL. All data syncs through Supabase in real-time.

---

**Built by Sarthak Varma | MVP Solutions LLC**
