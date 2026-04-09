# SMVP Auto-Office HQ — Master Plan

**Owner:** Sarthak Varma, CEO — MVP Solutions LLC
**System:** AI-powered business operating system with 13 autonomous agents
**Stack:** Next.js (App Router) + Supabase + Vercel + Claude API
**Principle:** CEO retains full control. Autonomy is a slider, not a switch.

---

## Core Philosophy

This is a **command center**, not a screensaver. Every visualization must be actionable. Every agent must be controllable. The CEO can stop everyone, stop one person, give new tasks, adjust plans — and all agents adapt accordingly.

**Autonomy Spectrum:**
```
[Manual] -------- [Supervised] -------- [Semi-Auto] -------- [Full Auto]
   ^                   ^
   |                   |
 Phase 1           Phase 2+
```

Default: Supervised mode. Agents propose, CEO approves. Autonomy increases per-agent, per-task-type as trust builds.

---

## Business Lifecycle (Full Scope)

This is NOT just a sales tool. It covers the complete business lifecycle:

```
PROSPECT → QUALIFY → CLOSE → ONBOARD → DELIVER → BILL → RETAIN → GROW
   Rex       Rex      Ace     Atlas     Pixel    Atlas    Echo    Rex
                              + Cortex  + Prism  + Ledger + Dash
                              + Nova    + Flux
```

**Revenue Streams:**
1. Web Design & Development (client services)
2. Etsy Store (digital + physical products via Printify)
3. Canva Creator Store (templates)
4. TikTok Shop (trending merch)
5. Consulting & AI Automation

**Future Capacity Planning:**
- How many active projects can Pixel handle simultaneously?
- When does Sarthak need a dedicated Client Manager agent?
- Project Manager agent for multi-deliverable engagements?
- Delivery Manager for quality assurance across all active projects?
- Consultant agents for specialized verticals?

---

## Agent Roster (13 Current + Future Expansion)

### Tier 1: Front Office (Client-Facing)
| Agent | Role | Office Size | Authority |
|-------|------|-------------|-----------|
| Rex | Lead Hunter & Market Research | Medium | Can research freely, proposals need approval |
| Ace | Sales Closer & Client Relations | Medium | Draft outreach, Sarthak approves sends |
| Atlas | Account Manager & Client Relations | Large | Onboards clients, generates invoices, tracks billing — all sends need approval |
| Nova | Content Writer & Copywriter | Medium | Drafts content, Sentry reviews, Sarthak approves |
| Dash | Analytics & Reporting | Medium | Read-only analytics, reports auto-generated |

### Tier 2: Back Office (Production)
| Agent | Role | Office Size | Authority |
|-------|------|-------------|-----------|
| Pixel | Web Designer & Developer | Large | Builds in staging, Sarthak approves deploy |
| Prism | Creative Producer (Video/Design) | Medium | Creates assets, Sarthak approves before use |
| Echo | Social Media Manager | Medium | Schedules posts, Sarthak approves before publish |
| Sentry | QA & Brand Compliance | Medium | Reviews all outputs, flags issues, escalates |
| Shelf | Store Manager (Etsy/TikTok/Canva) | Medium | Lists products after approval, handles orders |

### Tier 3: Infrastructure
| Agent | Role | Office Size | Authority |
|-------|------|-------------|-----------|
| Cortex | Orchestrator & COO | Large (Central) | Routes tasks, resolves deadlocks, never acts alone |
| Flux | DevOps & Deployment | Small | Deploys after Sarthak approval, monitors uptime |
| Ledger | Finance & CFO | Medium | Reports only, never makes financial decisions |

### Future Agents (Phase 3+)
| Agent | Role | Trigger to Add |
|-------|------|----------------|
| Forge | Project Manager | When concurrent projects > 5 |
| Relay | Delivery Manager | When quality issues > threshold |
| Sage | Consultant (vertical-specific) | When consulting revenue > $5K/mo |

---

## Dashboard Architecture

### Navigation Structure
```
SMVP HQ (root /)
├── Dashboard Home (default view)
│   ├── View: Office Floorplan (top-down, agents in offices)
│   ├── View: Pipeline Overview (Kanban-style task flow)
│   └── View: Metrics Grid (KPI cards + charts)
│
├── [Sidebar — Always Present, Collapsible]
│   ├── Home
│   ├── Agents → [Sub-Sidebar Pops Out]
│   │   ├── All Agents (grid overview)
│   │   ├── Rex (individual page)
│   │   ├── Ace (individual page)
│   │   ├── Nova ...
│   │   ├── Dash ...
│   │   ├── Pixel ...
│   │   ├── Prism ...
│   │   ├── Echo ...
│   │   ├── Sentry ...
│   │   ├── Cortex ...
│   │   ├── Flux ...
│   │   ├── Shelf ...
│   │   └── Ledger ...
│   ├── Projects
│   │   ├── Active Projects
│   │   ├── Pipeline (prospects)
│   │   └── Completed
│   ├── Clients
│   │   ├── Active Clients
│   │   ├── Prospects
│   │   └── Past Clients
│   ├── Content
│   │   ├── Calendar
│   │   ├── Drafts (pending approval)
│   │   └── Published
│   ├── Stores
│   │   ├── Etsy
│   │   ├── TikTok Shop
│   │   ├── Canva Store
│   │   └── Inventory
│   ├── Finance
│   │   ├── Revenue
│   │   ├── Expenses
│   │   └── Tax Calendar
│   ├── Settings
│   │   ├── Agent Autonomy Levels
│   │   ├── Approval Rules
│   │   ├── Themes
│   │   └── Integrations
│   └── [Abort All] (always visible, top-right)
```

### Individual Agent Page (when clicking agent in sub-sidebar)
```
┌─────────────────────────────────────────────┐
│ [Agent Name] — [Role]          [Status: ●]  │
│ ═══════════════════════════════════════════  │
│                                             │
│ CONTROLS                                    │
│ [▶ Resume] [⏸ Pause] [⏹ Stop] [↻ Restart]  │
│ Autonomy: [━━━━━●━━━━] 60%                 │
│                                             │
│ CURRENT TASK                                │
│ "Researching leads in Austin TX dental..."  │
│ [✓ Approve] [✗ Reject] [✎ Advise] [→ Skip] │
│                                             │
│ TASK QUEUE                                  │
│ 1. Research leads (IN PROGRESS)             │
│ 2. Compile prospect list (PENDING)          │
│ 3. Draft outreach templates (PENDING)       │
│ [+ Add Task] [↕ Reorder] [🗑 Clear Queue]   │
│                                             │
│ PERFORMANCE                                 │
│ Tasks completed today: 7                    │
│ Avg quality score: 94%                      │
│ Escalations: 1                              │
│                                             │
│ KNOWLEDGE & TRAINING                        │
│ Last updated: 2 hours ago                   │
│ [📚 View Knowledge Base] [✏️ Teach Agent]    │
│                                             │
│ ACTIVITY LOG                                │
│ 10:14 PM — Completed lead research batch 3  │
│ 10:02 PM — Flagged duplicate lead (removed) │
│ 9:45 PM — Started Austin TX dental search   │
└─────────────────────────────────────────────┘
```

### Office Floorplan View (Top-Down)
```
┌──────────────────────────────────────────────────────────────┐
│                    SMVP AUTO-OFFICE HQ                        │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │  Rex   │  │  Ace   │  │  Nova  │  │  Dash  │            │
│  │ (desk) │  │(phone) │  │(typing)│  │(charts)│            │
│  └────────┘  └────────┘  └────────┘  └────────┘            │
│         ┌──────────────────┐                                 │
│         │  CONFERENCE ROOM  │  ← Agents meet here for        │
│         │  (handoff zone)   │    handoffs between pipelines   │
│         └──────────────────┘                                 │
│  ┌────────┐  ┌──────────┐  ┌────────┐  ┌────────┐          │
│  │ Pixel  │  │  Prism   │  │  Echo  │  │ Sentry │          │
│  │(coding)│  │(drawing) │  │(phone) │  │(review)│          │
│  └────────┘  └──────────┘  └────────┘  └────────┘          │
│  ┌────────┐  ┌──────────────────┐  ┌────────┐  ┌────────┐  │
│  │  Flux  │  │     CORTEX       │  │ Shelf  │  │ Ledger │  │
│  │(server)│  │  (central hub)   │  │(store) │  │(calc)  │  │
│  └────────┘  └──────────────────┘  └────────┘  └────────┘  │
└──────────────────────────────────────────────────────────────┘

Agent Behaviors in Office:
- Walk between desk → whiteboard → bookshelf → couch
- Each "station" in their office = a different task phase
- Sitting at desk = active work
- At whiteboard = planning/ideating
- On couch = idle/waiting for input
- Walking to conference room = handoff in progress
- Accessories match persona (Rex has binoculars, Pixel has monitors, etc.)
```

### Global Controls (Always Accessible)
- **Abort All Actions** — Top-right, prominent. Stops all agents immediately.
- **Pause All** — Pauses without losing state. Resume picks up where left off.
- **Approval Queue** — Badge count of pending approvals across all agents.
- **Notifications** — Real-time alerts for escalations, completions, errors.

---

## Autonomy & Control Framework

### Per-Agent Settings
```
Agent: Rex
├── Autonomy Level: [0-100%] slider
├── Auto-Approve: [ ] Research  [✓] Internal notes  [ ] Client outreach
├── Task Limit: Max 3 concurrent tasks
├── Budget Limit: $0 (no spending authority)
├── Escalation Rules:
│   ├── Always escalate: client communication, financial decisions
│   ├── Auto-approve: internal research, data gathering
│   └── Review threshold: anything touching brand or client-facing
└── Learning Mode: [✓] Log decisions for review  [ ] Auto-incorporate feedback
```

### Per-Campaign Controls
```
Campaign: "Austin TX Dental Practices"
├── Assigned Agents: Rex (research), Ace (outreach), Nova (copy)
├── Stage: Research → Outreach → Close → Deliver
├── Current Stage: Research (60% complete)
├── Approval Gates:
│   ├── Research → Outreach: Sarthak must approve prospect list
│   ├── Outreach → Close: Sarthak must approve email templates
│   └── Close → Deliver: Sarthak must approve scope & pricing
└── Budget: $50 total (tools, ads)
```

### Override Cascade
When Sarthak changes one agent's plan:
1. Cortex receives the change notification
2. Cortex identifies all downstream dependencies
3. Affected agents pause current related tasks
4. Cortex proposes adjusted plans for each affected agent
5. Sarthak reviews the cascade and approves/modifies
6. All agents resume with new plans

---

## Phased Rollout

### Phase 1: Foundation (Current — April 2026)
**Goal:** Working dashboard with agent visibility and basic controls

- [x] Agent system prompts (all 12 written)
- [x] GitHub repo with all agent files
- [x] Basic office visualization (v2 pipeline, v3 cubicles)
- [x] Vercel deployment
- [ ] **Next.js dashboard rebuild:**
  - Collapsible sidebar navigation (BD Hub pattern)
  - Dashboard home with view switcher (Office / Pipeline / Metrics)
  - Individual agent pages (status, controls, task queue)
  - Global controls (Abort All, Pause All, Approval Queue)
  - Clean white/offwhite theme with blue/yellow accents
  - Theme switcher
- [ ] Supabase tables: agents, tasks, task_queue, approvals, activity_log
- [ ] Basic CRUD: create tasks, assign to agents, approve/reject outputs

### Phase 2: Agent Runtime (May-June 2026)
**Goal:** Agents actually execute tasks with human-in-the-loop

- [ ] Claude API integration for agent execution
- [ ] Task execution engine: agent picks up task → executes → submits for review
- [ ] Approval workflow: pending → approved/rejected → executed/revised
- [ ] Real-time activity feed (WebSocket or Supabase realtime)
- [ ] Autonomy slider: per-agent, per-task-type auto-approve rules
- [ ] Override cascade system (change one plan → all agents adapt)
- [ ] Office floorplan visualization with agent movement
- [ ] Conference room handoff animations

### Phase 3: Full Operations (July-September 2026)
**Goal:** End-to-end business operations running through the system

- [ ] Client management (onboarding, project tracking, satisfaction)
- [ ] Project management (milestones, deliverables, timelines)
- [ ] Content calendar with social media scheduling
- [ ] Store management (Etsy, TikTok Shop, Canva)
- [ ] Financial tracking (revenue, expenses, P&L, tax prep)
- [ ] Email/outreach integration (send/receive through dashboard)
- [ ] Analytics dashboards (per-agent, per-campaign, per-client)
- [ ] Capacity planning (workload per agent, scaling triggers)

### Phase 4: Scale & Autonomy (Q4 2026+)
**Goal:** Increase autonomy as trust builds, add specialized agents

- [ ] New agents: Atlas (Client Manager), Forge (Project Manager)
- [ ] Multi-project management (concurrent client engagements)
- [ ] Consultant agents for vertical specialization
- [ ] Automated scaling: system recommends when to add agents
- [ ] Revenue optimization: agents learn what works, propose strategies
- [ ] Full autonomous mode (with guardrails) for trusted workflows

---

## Design System

### Theme: Clean Professional
- **Base:** White (#FFFFFF) to Off-white (#F8F9FA)
- **Text:** Dark gray (#1A1A2E) — never pure black
- **Primary accent:** Blue (#2563EB range)
- **Secondary accent:** Yellow/Gold (#EAB308 range)
- **Success:** Green (#22C55E)
- **Warning:** Amber (#F59E0B)
- **Error:** Red (#EF4444)
- **Agent identity colors:** Each agent has a signature color for their avatar/indicators
- **Gradients:** Subtle white-to-blue, white-to-gray (never heavy saturated gradients)

### Typography
- **Headings:** Syne (bold, modern)
- **Body:** DM Sans (clean, readable)
- **Mono/Code:** JetBrains Mono

### Component Patterns
- Cards with subtle shadows and rounded corners
- Status indicators (dots, badges, progress bars)
- Collapsible sidebar with sub-navigation (BD Hub style)
- Modal dialogs for approvals and task details
- Toast notifications for real-time updates
- Skeleton loading states

---

## Technical Architecture

```
Next.js App Router
├── app/
│   ├── layout.tsx (sidebar + top bar + global controls)
│   ├── page.tsx (dashboard home — view switcher)
│   ├── agents/
│   │   ├── page.tsx (all agents grid)
│   │   └── [agentId]/
│   │       └── page.tsx (individual agent page)
│   ├── projects/
│   │   ├── page.tsx (active projects)
│   │   └── [projectId]/page.tsx
│   ├── clients/
│   │   ├── page.tsx (client list)
│   │   └── [clientId]/page.tsx
│   ├── content/
│   │   ├── calendar/page.tsx
│   │   └── drafts/page.tsx
│   ├── stores/
│   │   └── page.tsx
│   ├── finance/
│   │   └── page.tsx
│   └── settings/
│       ├── autonomy/page.tsx
│       ├── themes/page.tsx
│       └── integrations/page.tsx
├── components/
│   ├── sidebar/ (collapsible, sub-nav)
│   ├── agents/ (agent cards, controls, status)
│   ├── office/ (floorplan visualization)
│   ├── shared/ (buttons, modals, toasts)
│   └── themes/ (theme provider, switcher)
└── lib/
    ├── supabase/ (client, types, queries)
    ├── agents/ (execution engine, queue)
    └── utils/

Supabase Schema:
├── agents (id, name, role, status, autonomy_level, config)
├── tasks (id, agent_id, title, description, status, priority, created_at)
├── task_queue (id, task_id, agent_id, position, status)
├── approvals (id, task_id, agent_id, type, status, reviewed_at, notes)
├── activity_log (id, agent_id, action, details, timestamp)
├── clients (id, name, status, project_count, revenue, notes)
├── projects (id, client_id, title, status, agents_assigned, milestones)
├── campaigns (id, name, agents, stage, budget, approval_gates)
└── knowledge (id, agent_id, category, content, updated_at)
```

---

## Key Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| CEO retains full control by default | Autonomy earned, not given. Prevents runaway agents. | 2026-04-02 |
| White/clean theme as default | Professional tool, not a game. Matches SMVP brand. | 2026-04-02 |
| BD Hub sidebar pattern | Proven navigation pattern Sarthak already likes. Extensible. | 2026-04-02 |
| One structured approach at a time | Quality over quantity. Don't spread agents thin. | 2026-04-02 |
| Plan for client lifecycle, not just sales | Business isn't just closing — it's delivering and retaining. | 2026-04-02 |
| Factor future agents into architecture now | Don't paint yourself into a corner. Build extensible. | 2026-04-02 |
