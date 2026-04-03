# SMVP HQ — Competitive Research & Feature Recommendations

**Research Date:** April 2, 2026
**Sources:** 30+ GitHub repos, Reddit communities, YouTube, LinkedIn, Twitter/X, industry reports
**Purpose:** Inform SMVP HQ dashboard design with best-in-class features from the market

---

## The Landscape (TL;DR)

There are 30+ AI agent command centers on GitHub right now. The market is $5.3B in 2025, projected to hit $52B by 2030. Most projects fail because they're either: (a) all visualization with no control, or (b) all framework with no UI. The gap is a **beautiful, actionable command center with real business operations built in** — which is exactly what you're building.

Nobody has built what you're describing: a top-down office visualization with per-agent control, business lifecycle management, and CEO-level oversight. That's your edge.

---

## Top 10 Projects to Study

### 1. Mission Control (Builderz Labs)
**GitHub:** builderz-labs/mission-control
- Self-hosted, zero external dependencies, SQLite
- Task dispatch + multi-agent workflows
- Real-time cost monitoring and spend tracking
- Encrypted vault (AES-256) for secrets
- Per-service and global spend limits
- **Steal This:** Cost monitoring, spend limits, security governance

### 2. Ruflo (Claude Flow v3)
**GitHub:** ruvnet/ruflo | 14K+ stars
- 60+ specialized agents in coordinated swarms
- Self-learning neural capabilities
- 313+ MCP tools for Claude Code
- Vector memory (150x-12,500x faster retrieval)
- Mesh, hierarchical, ring, star topologies
- **Steal This:** Claude-native integration, self-learning, topology options

### 3. Dify.ai
**GitHub:** langgenius/dify
- Production-ready visual workflow builder
- 50+ built-in tools
- RAG capabilities
- No-code studio
- **Steal This:** Production-readiness mindset, tool ecosystem

### 4. LangGraph Studio
**Website:** studio.langchain.com
- Visual graph editing with drag-and-drop
- Real-time step-by-step execution visibility
- Debug mode (step through agent decisions)
- Graph Mode (developers) + Chat Mode (business users)
- **Steal This:** Dual view modes, step-by-step debugging, visual flow

### 5. n8n
**GitHub:** n8n-io/n8n | 422+ integrations
- Where REAL money is being made ($8K-$40K MRR documented)
- Human-in-the-loop checks at any point
- Fair-code model
- **Steal This:** Human-in-the-loop pattern, integration ecosystem

### 6. Autonomous Product Engine (APE)
**GitHub:** crshdn/mission-control
- AI agents research market and generate features
- Ships code as PRs automatically
- Convoy mode for parallel execution
- Crash recovery and cost tracking
- 80+ API endpoints
- **Steal This:** Autonomous product development workflow, crash recovery

### 7. VoltOps Console (VoltAgent)
**GitHub:** VoltAgent/voltagent
- Framework-agnostic observability
- Real-time execution traces
- Agent memory/context inspection
- Multi-agent interaction analysis
- Transforms complex interactions into visual flowcharts
- **Steal This:** Observability layer, execution traces, interaction visualization

### 8. Swarms Framework
**GitHub:** kyegomez/swarms
- Enterprise-grade, production-ready
- Hierarchical agent swarms and parallel pipelines
- 99.9%+ uptime guarantee
- Agent registry management
- **Steal This:** Enterprise patterns, registry, uptime focus

### 9. Agent Swarm Dashboard (Smilkoski)
**GitHub:** Smilkoski/agent-swarm-dashboard
- Real-time dashboard with live streaming timeline
- Mermaid graph visualization
- Token counter and history
- Server-Sent Events for real-time updates
- **Steal This:** Real-time streaming, timeline view, token tracking

### 10. OpenSwarm
**GitHub:** unohee/OpenSwarm
- Claude Code CLI powered
- Discord control interface
- Linear integration for issue tracking
- Cognitive memory system
- Real-time supervisor dashboard
- **Steal This:** Memory system, issue tracking integration, Discord as channel

---

## Feature Recommendations (Prioritized for SMVP HQ)

### MUST HAVE (Phase 1-2)

**1. Global Command Bar**
- Abort All button (top-right, always visible)
- Pause All / Resume All
- Approval queue badge (pending count)
- Cost tracker (running daily/monthly spend)
- Notification center

**2. Agent Control Panel (Per Agent)**
- Start / Pause / Stop / Restart buttons
- Autonomy slider (0-100%)
- Auto-approve rules per task type
- Task queue (add, reorder, remove tasks)
- Current task with Approve / Reject / Advise / Skip
- Activity log with timestamps
- Performance metrics (tasks completed, quality score)

**3. Real-Time Cost Monitoring**
- Per-agent token spend
- Per-task cost tracking
- Daily/weekly/monthly burn rate
- Runaway spend alerts (auto-pause if threshold exceeded)
- Budget limits per agent and globally
- Learned from: Mission Control, Reddit warnings about $47K cost spirals

**4. Approval Workflow Engine**
- Pending approvals dashboard (across all agents)
- One-click approve/reject with notes
- Batch approve for low-risk items
- Escalation rules (auto-escalate if pending > X hours)
- Approval history and audit trail

**5. Dashboard Views (Switchable)**
- Office Floorplan (top-down, agents in offices)
- Pipeline View (Kanban-style task flow)
- Metrics Grid (KPI cards + charts)
- Timeline View (activity feed, chronological)

**6. Collapsible Sidebar Navigation**
- BD Hub style with nested sub-sidebars
- Agent list that expands to individual agent pages
- Quick-access to Projects, Clients, Content, Stores, Finance
- Theme switcher in settings

### SHOULD HAVE (Phase 2-3)

**7. Override Cascade System**
When you change one agent's task:
- Cortex analyzes downstream impact
- Shows you which agents are affected
- Proposes adjusted plans
- You approve the cascade
- All agents adapt simultaneously
- Learned from: MetaGPT's SOP chains, CrewAI's crew coordination

**8. Campaign Management**
- Create campaigns (e.g., "Austin TX Dental Outreach")
- Assign agents to stages (Research → Outreach → Close → Deliver)
- Per-campaign approval gates
- Budget tracking per campaign
- Progress visualization
- Learned from: Relevance AI's sales workflow, CRM patterns

**9. Client Lifecycle Management**
- Prospect → Active Client → Completed → Retained
- Per-client project tracking
- Communication history
- Satisfaction scoring
- Capacity planning (projects per agent)
- Learned from: Enterprise CRM + project management tools

**10. Agent Knowledge & Training**
- View agent's knowledge base
- Teach agent new information
- Review what agent learned
- Correct mistakes (agent remembers)
- Knowledge sharing between agents (via Cortex)
- Learned from: Ruflo's self-learning, BabyAGI's self-improvement

**11. Step-by-Step Debugging**
- See exactly what an agent did and why
- Replay any task execution
- Identify where things went wrong
- Fix and re-run from specific step
- Learned from: LangGraph Studio's debug mode, VoltOps traces

**12. Integration Hub**
- Connect external tools (Slack, email, CRM, calendar)
- Webhook support for triggers
- API for custom integrations
- Learned from: n8n (422+ integrations), Composio (1000+ toolkits)

### NICE TO HAVE (Phase 3-4)

**13. Agent Marketplace / Templates**
- Pre-built task templates per agent
- Shareable workflows
- Community templates
- Learned from: n8n templates ($3.2K/mo passive), MindStudio's marketplace

**14. Multi-Tenant Support**
- Separate workspaces per client
- Client-facing dashboards (limited view)
- White-label option
- Learned from: Agency model patterns, SaaS best practices

**15. AI-Powered Analytics**
- Ask questions in natural language ("What was our best content this week?")
- Proactive insights ("Rex found 3x more leads in healthcare than tech")
- Trend detection and recommendations
- Learned from: Supervity's command center, conversational analytics trend

**16. Mobile Dashboard**
- Responsive design for phone/tablet
- Push notifications for approvals
- Quick-approve from mobile
- Agent status at a glance

---

## Revenue/Monetization Angles

The research shows real money being made in this space:

**For SMVP as a business tool (primary):**
- Run your own business operations (current use case)
- Client delivery management
- 5 revenue streams managed from one dashboard

**For SMVP as a product (future potential):**
- Template marketplace (sell pre-built agent workflows)
- White-label the dashboard for other solopreneurs
- Consulting on AI agent setup ($2.5K-$10K/engagement)
- SaaS model ($299-$999/mo per seat)

**Market context:**
- AI agent market: $5.3B → $52B by 2030
- 72% of enterprises using/testing agents (Jan 2026)
- n8n workflow builders making $8K-$40K MRR
- Template sellers making $3.2K/mo passive

---

## What Makes SMVP HQ Different

Nobody else has:
1. **Top-down office visualization** with agents moving in their own offices
2. **CEO-level control** with granular autonomy sliders per agent
3. **Full business lifecycle** (prospect → close → deliver → retain)
4. **Conference room handoffs** showing agent collaboration visually
5. **12 specialized business agents** (not generic coding agents)
6. **Override cascade** where changing one plan updates all agents
7. **Capacity planning** for scaling from solo to team

The closest competitors are either framework-heavy (CrewAI, LangGraph) with minimal UI, or dashboard-heavy (Mission Control) with no business operations. You're building the full stack.

---

## Key Risks to Avoid (Learned from Failures)

1. **Cost spirals** — 80% of Reddit horror stories are about unchecked token spend. Build hard limits from day 1.
2. **Over-complexity** — Start narrow (1 campaign, 1 client), expand as trust builds. Your instinct on this is exactly right.
3. **Observability blindness** — Every agent action must be logged and inspectable. No black boxes.
4. **Framework lock-in** — Build agent execution layer to be model-agnostic (Claude today, but extensible).
5. **Ignoring delivery** — 40% of agent projects die because they focus on sales/content but forget client delivery. Your lifecycle approach avoids this.
