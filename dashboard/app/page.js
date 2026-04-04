'use client'
import { useState, useEffect, useCallback } from 'react'
import { AGENTS, TIERS } from '../lib/agents'
import { getPendingApprovals, approveAction, skipAction, getDashboardStats, subscribeToApprovals, getLeads, getPipeline } from '../lib/queries'

/* ============================================
   DEMO DATA — fake activity until Phase 2
   ============================================ */
const DEMO_TASKS = [
  { id: 1, agent: 'rex', title: 'Research SaaS leads in healthcare', stage: 'Research', progress: 72, priority: 'high' },
  { id: 2, agent: 'rex', title: 'Build prospect list for Q2', stage: 'Research', progress: 45, priority: 'medium' },
  { id: 3, agent: 'ace', title: 'Follow up with TechCorp proposal', stage: 'Outreach', progress: 60, priority: 'high' },
  { id: 4, agent: 'nova', title: 'Write blog post: AI in Small Biz', stage: 'Research', progress: 88, priority: 'medium' },
  { id: 5, agent: 'nova', title: 'Draft email sequence for launch', stage: 'Proposal', progress: 30, priority: 'high' },
  { id: 6, agent: 'pixel', title: 'Redesign landing page hero section', stage: 'Proposal', progress: 55, priority: 'medium' },
  { id: 7, agent: 'echo', title: 'Schedule next week social posts', stage: 'Outreach', progress: 40, priority: 'low' },
  { id: 8, agent: 'cortex', title: 'Coordinate agent handoff: Rex to Ace', stage: 'Closing', progress: 15, priority: 'high' },
  { id: 9, agent: 'dash', title: 'Generate weekly KPI report', stage: 'Delivery', progress: 92, priority: 'medium' },
  { id: 10, agent: 'prism', title: 'Create product mockup renders', stage: 'Proposal', progress: 65, priority: 'medium' },
  { id: 11, agent: 'sentry', title: 'QA review: landing page copy', stage: 'Closing', progress: 80, priority: 'high' },
  { id: 12, agent: 'shelf', title: 'Update Etsy holiday listings', stage: 'Delivery', progress: 50, priority: 'low' },
]

const DEMO_APPROVALS = [
  { id: 1, agent: 'ace', action: 'Send proposal to TechCorp ($12,500)', time: '2m ago', priority: 'high' },
  { id: 2, agent: 'nova', action: 'Publish blog post to WordPress', time: '8m ago', priority: 'medium' },
  { id: 3, agent: 'echo', action: 'Post carousel to Instagram & TikTok', time: '15m ago', priority: 'low' },
]

const DEMO_ACTIVITY = [
  { agent: 'rex', action: 'Found 14 new leads in healthcare SaaS', time: '3m ago', type: 'success' },
  { agent: 'dash', action: 'Weekly report generated — revenue up 12%', time: '7m ago', type: 'success' },
  { agent: 'cortex', action: 'Routed task from Rex to Ace (lead handoff)', time: '12m ago', type: 'info' },
  { agent: 'sentry', action: 'Flagged 2 issues in landing page copy', time: '18m ago', type: 'warning' },
  { agent: 'pixel', action: 'Deployed hero section redesign to staging', time: '25m ago', type: 'success' },
  { agent: 'nova', action: 'Completed draft: "AI in Small Business"', time: '32m ago', type: 'success' },
  { agent: 'flux', action: 'SSL certificate renewed for mvpsolutions.io', time: '45m ago', type: 'info' },
  { agent: 'prism', action: 'Rendered 6 product mockup variations', time: '1h ago', type: 'success' },
  { agent: 'ledger', action: 'Monthly P&L summary ready for review', time: '1h ago', type: 'info' },
  { agent: 'shelf', action: 'Updated 23 Etsy listing descriptions', time: '2h ago', type: 'success' },
]

const DEMO_STATUSES = {
  rex: 'active', ace: 'active', nova: 'active', dash: 'active',
  pixel: 'active', prism: 'active', echo: 'active', sentry: 'active',
  shelf: 'idle', cortex: 'active', flux: 'idle', ledger: 'idle',
}

const DEMO_CURRENT = {
  rex: 'Scanning healthcare SaaS market...',
  ace: 'Drafting TechCorp follow-up...',
  nova: 'Writing blog post intro...',
  dash: 'Crunching weekly metrics...',
  pixel: 'Designing hero section...',
  prism: 'Rendering product mockups...',
  echo: 'Scheduling social posts...',
  sentry: 'Reviewing landing page...',
  shelf: 'Taking a break',
  cortex: 'Coordinating Rex to Ace handoff...',
  flux: 'Monitoring servers...',
  ledger: 'Idle — awaiting tasks',
}

const VIEWS = [
  { id: 'metrics', label: 'Metrics', icon: '◻' },
  { id: 'office', label: 'Office', icon: '▦' },
  { id: 'pipeline', label: 'Pipeline', icon: '▤' },
]

export default function Dashboard() {
  const [view, setView] = useState('metrics')
  const [agents, setAgents] = useState(() =>
    AGENTS.map(a => ({ ...a, status: DEMO_STATUSES[a.id] || 'idle' }))
  )
  const [approvals, setApprovals] = useState(DEMO_APPROVALS)
  const [stats, setStats] = useState({ leads: 0, pendingApprovals: DEMO_APPROVALS.length, revenue: 0, activeDeliverables: 0 })
  const [liveLeads, setLiveLeads] = useState([])
  const [livePipeline, setLivePipeline] = useState([])
  const activeCount = agents.filter(a => a.status === 'active').length

  // Fetch real data from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const [pending, dashStats, leads, pipeline] = await Promise.all([
          getPendingApprovals(),
          getDashboardStats(),
          getLeads(),
          getPipeline(),
        ])
        if (pending.length > 0) setApprovals(pending.map(a => ({
          id: a.id, agent: a.agent, action: a.title || a.description, time: timeAgo(a.created_at), priority: a.priority || 'medium',
          actionType: a.type, description: a.description, payload: a.payload,
        })))
        if (dashStats.leads > 0 || dashStats.pendingApprovals > 0 || dashStats.revenue > 0) setStats(dashStats)
        if (leads.length > 0) setLiveLeads(leads)
        if (pipeline.length > 0) setLivePipeline(pipeline)
      } catch (e) {
        console.error('Failed to load Supabase data:', e)
      }
    }
    loadData()

    // Subscribe to real-time approval changes
    const channel = subscribeToApprovals(() => {
      getPendingApprovals().then(pending => {
        if (pending.length > 0) setApprovals(pending.map(a => ({
          id: a.id, agent: a.agent, action: a.title || a.description, time: timeAgo(a.created_at), priority: a.priority || 'medium',
          actionType: a.type, description: a.description, payload: a.payload,
        })))
      })
      getDashboardStats().then(setStats)
    })

    return () => { channel?.unsubscribe() }
  }, [])

  async function handleApprove(id) {
    await approveAction(id)
    setApprovals(prev => prev.filter(a => a.id !== id))
    setStats(prev => ({ ...prev, pendingApprovals: Math.max(0, prev.pendingApprovals - 1) }))
  }

  async function handleSkip(id) {
    await skipAction(id)
    setApprovals(prev => prev.filter(a => a.id !== id))
    setStats(prev => ({ ...prev, pendingApprovals: Math.max(0, prev.pendingApprovals - 1) }))
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Command Center</h1>
          <p className="page-subtitle">Real-time overview of all agent operations</p>
        </div>
        <div className="view-switcher">
          {VIEWS.map(v => (
            <button key={v.id} className={`view-btn ${view === v.id ? 'active' : ''}`} onClick={() => setView(v.id)}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Agents</div>
          <div className="stat-value blue">{activeCount} / {agents.length}</div>
          <div className="stat-change up">{agents.filter(a => a.status === 'idle').length} idle</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Approvals</div>
          <div className="stat-value yellow">{approvals.length}</div>
          <div className="stat-change">{approvals.length > 0 ? 'Needs your review' : 'All clear'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Leads</div>
          <div className="stat-value green">{stats.leads || liveLeads.length || DEMO_TASKS.length}</div>
          <div className="stat-change up">{liveLeads.length > 0 ? `${liveLeads.filter(l => l.status === 'new').length} new` : '3 completed'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Revenue</div>
          <div className="stat-value purple">${stats.revenue > 0 ? stats.revenue.toLocaleString() : '0.00'}</div>
          <div className="stat-change">{stats.revenue > 0 ? 'Total earned' : 'Phase 2 pending'}</div>
        </div>
      </div>
      {view === 'metrics' && <MetricsView agents={agents} approvals={approvals} onApprove={handleApprove} onSkip={handleSkip} />}
      {view === 'office' && <OfficeView agents={agents} />}
      {view === 'pipeline' && <PipelineView livePipeline={livePipeline} />}
    </div>
  )
}

function timeAgo(dateStr) {
  if (!dateStr) return 'just now'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

/* ============================================
   METRICS VIEW
   ============================================ */
function MetricsView({ agents, approvals = DEMO_APPROVALS, onApprove, onSkip }) {
  const agentMap = {}
  agents.forEach(a => { agentMap[a.id] = a })
  return (
    <div>
      {Object.entries(TIERS).map(([key, tier]) => (
        <div key={key}>
          <div className="tier-label">{tier.label} — {tier.description}</div>
          <div className="agent-grid">
            {agents.filter(a => a.tier === key).map(agent => (
              <a key={agent.id} href={`/agents/${agent.id}`} className="agent-card">
                <div className="agent-card-accent" style={{ background: agent.color }}></div>
                <div className="agent-header">
                  <div className="agent-emoji">{agent.emoji}</div>
                  <div>
                    <div className="agent-name">{agent.name}</div>
                    <div className="agent-role">{agent.role}</div>
                  </div>
                </div>
                {agent.status === 'active' && (
                  <div style={{ fontSize:'11px', color:'var(--text-muted)', padding:'6px 0 2px', borderTop:'1px solid var(--border)', marginTop:'6px' }}>
                    {DEMO_CURRENT[agent.id]}
                  </div>
                )}
                <div className="agent-card-footer">
                  <span className={`agent-status ${agent.status}`}>
                    <span className="status-dot"></span>
                    {agent.status === 'active' ? 'Working' : agent.status === 'paused' ? 'Paused' : 'Idle'}
                  </span>
                  <span className="agent-autonomy">
                    <span className="autonomy-bar-mini">
                      <span className="autonomy-bar-fill" style={{ width: `${agent.autonomy}%` }}></span>
                    </span>
                    {agent.autonomy}%
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
      <div className="grid-2" style={{ marginTop: '8px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Approval Queue</h3>
            <span style={{ fontSize:'12px', color:'var(--accent-yellow)', fontWeight:600 }}>{approvals.length} pending</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {approvals.length === 0 && (
              <div style={{ padding:'20px', textAlign:'center', color:'var(--text-muted)', fontSize:'13px' }}>
                No pending approvals — all clear.
              </div>
            )}
            {approvals.map(ap => (
              <div key={ap.id} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'10px 12px', background:'var(--bg-secondary)', borderRadius:'var(--radius-md)',
                borderLeft: `3px solid ${agentMap[ap.agent]?.color || '#ccc'}`,
              }}>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:600 }}>{agentMap[ap.agent]?.emoji} {agentMap[ap.agent]?.name}</div>
                  <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'2px' }}>{ap.action}</div>
                </div>
                <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                  <span style={{ fontSize:'10px', color:'var(--text-muted)' }}>{ap.time}</span>
                  <button onClick={() => onApprove?.(ap.id)} style={{ padding:'4px 12px', fontSize:'11px', fontWeight:600, border:'none', borderRadius:'6px', background:'#22C55E', color:'#fff', cursor:'pointer' }}>Approve</button>
                  <button onClick={() => onSkip?.(ap.id)} style={{ padding:'4px 12px', fontSize:'11px', fontWeight:600, border:'1px solid var(--border)', borderRadius:'6px', background:'transparent', color:'var(--text-muted)', cursor:'pointer' }}>Skip</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Activity Feed</h3>
            <span style={{ fontSize:'12px', color:'var(--text-muted)' }}>Today</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'4px', maxHeight:'280px', overflowY:'auto' }}>
            {DEMO_ACTIVITY.map((act, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'flex-start', gap:'8px', padding:'8px', borderRadius:'6px',
                background: i === 0 ? 'var(--bg-secondary)' : 'transparent',
              }}>
                <span style={{ fontSize:'14px', marginTop:'1px' }}>{agentMap[act.agent]?.emoji}</span>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:'12px', fontWeight:600 }}>{agentMap[act.agent]?.name}</span>
                  <span style={{ fontSize:'12px', color:'var(--text-muted)', marginLeft:'6px' }}>{act.action}</span>
                  <div style={{ fontSize:'10px', color:'var(--text-muted)', marginTop:'2px' }}>{act.time}</div>
                </div>
                <span style={{ width:'6px', height:'6px', borderRadius:'50%', marginTop:'6px',
                  background: act.type==='success'?'#22C55E':act.type==='warning'?'#EAB308':'#3B82F6' }}></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   OFFICE VIEW — Animated Game-Style Floor Plan
   ============================================ */
const AGENT_ROOMS = {
  rex:    { desk: [310, 140], spots: [[280, 180], [340, 100], [320, 200]], room: [213, 12, 148, 248] },
  ace:    { desk: [440, 120], spots: [[420, 170], [460, 90], [400, 200]], room: [367, 12, 148, 248] },
  nova:   { desk: [590, 130], spots: [[570, 190], [620, 100], [550, 160]], room: [521, 12, 148, 248] },
  dash:   { desk: [740, 120], spots: [[720, 170], [760, 90], [700, 200]], room: [675, 12, 148, 248] },
  pixel:  { desk: [80, 380], spots: [[60, 420], [120, 360], [100, 440]], room: [12, 319, 160, 158] },
  prism:  { desk: [240, 380], spots: [[220, 420], [280, 360], [260, 440]], room: [178, 319, 160, 158] },
  echo:   { desk: [400, 380], spots: [[380, 420], [440, 360], [420, 440]], room: [344, 319, 160, 158] },
  sentry: { desk: [570, 380], spots: [[550, 420], [610, 360], [580, 440]], room: [510, 319, 155, 158] },
  shelf:  { desk: [80, 550], spots: [[60, 590], [120, 530], [100, 610]], room: [12, 483, 160, 165] },
  cortex: { desk: [500, 560], spots: [[480, 600], [540, 530], [460, 580]], room: [404, 483, 260, 165] },
  flux:   { desk: [740, 400], spots: [[720, 430], [760, 380], [700, 420]], room: [671, 319, 165, 158] },
  ledger: { desk: [740, 560], spots: [[720, 590], [760, 530], [700, 580]], room: [671, 483, 165, 165] },
}

function OfficeView({ agents }) {
  const [hovered, setHovered] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [agentPositions, setAgentPositions] = useState(() => {
    const pos = {}
    agents.forEach(ag => {
      const room = AGENT_ROOMS[ag.id]
      if (room) pos[ag.id] = { x: room.desk[0], y: room.desk[1], atDesk: true, activity: 0 }
    })
    return pos
  })
  const [tick, setTick] = useState(0)
  const a = {}
  agents.forEach(ag => { a[ag.id] = ag })

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
      setAgentPositions(prev => {
        const next = { ...prev }
        Object.keys(next).forEach(id => {
          const agent = a[id]
          const room = AGENT_ROOMS[id]
          if (!agent || !room) return
          const p = { ...next[id] }
          if (agent.status === 'active') {
            if (Math.random() < 0.12) {
              if (p.atDesk) {
                const spot = room.spots[Math.floor(Math.random() * room.spots.length)]
                p.x = spot[0] + (Math.random() - 0.5) * 10
                p.y = spot[1] + (Math.random() - 0.5) * 10
                p.atDesk = false
              } else {
                p.x = room.desk[0]; p.y = room.desk[1]; p.atDesk = true
              }
            }
            p.activity = (p.activity + 1) % 60
          } else {
            if (Math.random() < 0.04) {
              p.x = room.desk[0] + (Math.random() - 0.5) * 8
              p.y = room.desk[1] + (Math.random() - 0.5) * 8
            }
            p.activity = (p.activity + 1) % 120
          }
          next[id] = p
        })
        return next
      })
    }, 1600)
    return () => clearInterval(interval)
  }, [])

  const W = 1060, H = 660, F = '#FDF6EC', HL = '#F1EDE4'
  const agentTasks = (id) => DEMO_TASKS.filter(t => t.agent === id)

  return (
    <div className="card" style={{ padding: '16px', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h3 className="card-title" style={{ marginBottom: '2px', fontSize: '16px' }}>SMVP Auto-Office HQ</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click any agent to see details — hover rooms for info</p>
      </div>

      <style>{`
        @keyframes typing { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        @keyframes pulse-glow { 0%,100% { opacity: 0.3; } 50% { opacity: 0.7; } }
        @keyframes float-bubble { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1.5px); } }
        @keyframes ring-pulse { 0%,100% { opacity: 0.3; stroke-width: 2; } 50% { opacity: 0.6; stroke-width: 3; } }
        .agent-g { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .agent-g:hover { filter: brightness(1.1) drop-shadow(0 3px 6px rgba(0,0,0,0.2)); }
        .screen-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .typing-hand { animation: typing 0.35s ease-in-out infinite; }
        .thought-bubble { animation: float-bubble 2.5s ease-in-out infinite; }
        .agent-bob { animation: bob 2s ease-in-out infinite; }
        .ring-light { animation: ring-pulse 2s ease-in-out infinite; }
        .room-highlight { transition: filter 0.2s; }
        .room-highlight:hover { filter: brightness(1.03) drop-shadow(0 0 8px rgba(37,99,235,0.1)); }
      `}</style>

      {/* Agent detail panel */}
      {selectedAgent && a[selectedAgent] && (
        <div style={{
          position: 'relative', marginBottom: '12px', padding: '16px', borderRadius: '12px',
          background: '#fff', border: `2px solid ${a[selectedAgent].color}20`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          <button onClick={() => setSelectedAgent(null)} style={{
            position: 'absolute', top: '8px', right: '12px', background: 'none', border: 'none',
            fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)',
          }}>x</button>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', background: a[selectedAgent].color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0,
            }}>{a[selectedAgent].emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '18px' }}>{a[selectedAgent].name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{a[selectedAgent].role}</div>
              <div style={{ fontSize: '12px', color: a[selectedAgent].status === 'active' ? '#22C55E' : '#9E9E9E', marginTop: '4px', fontWeight: 600 }}>
                {a[selectedAgent].status === 'active' ? 'Working' : 'Idle'} — {DEMO_CURRENT[selectedAgent]}
              </div>
              {agentTasks(selectedAgent).length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.5px' }}>ACTIVE TASKS</div>
                  {agentTasks(selectedAgent).map(t => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ flex: 1, fontSize: '12px' }}>{t.title}</div>
                      <div style={{ width: '60px', height: '4px', background: '#E0E0E0', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${t.progress}%`, background: a[selectedAgent].color, borderRadius: '2px' }}/>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', minWidth: '28px' }}>{t.progress}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 600, border: 'none', borderRadius: '8px', background: '#22C55E', color: '#fff', cursor: 'pointer' }}>
                {a[selectedAgent].status === 'active' ? 'Pause' : 'Resume'}
              </button>
              <a href={`/agents/${selectedAgent}`} style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 600, border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-primary)', textDecoration: 'none' }}>
                Full Profile
              </a>
            </div>
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxHeight: '560px', borderRadius: '12px', background: '#DDD5C8' }}>
        <defs>
          <filter id="rs" x="-2%" y="-2%" width="104%" height="104%"><feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.06"/></filter>
          <filter id="agent-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15"/></filter>
          <pattern id="wood" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#C4956A"/><line x1="0" y1="2" x2="8" y2="2" stroke="#B8856A" strokeWidth="0.3" opacity="0.4"/>
            <line x1="0" y1="5" x2="8" y2="5" stroke="#B8856A" strokeWidth="0.2" opacity="0.3"/>
          </pattern>
          <radialGradient id="lamp-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FEFCBF" stopOpacity="0.5"/><stop offset="100%" stopColor="#FEFCBF" stopOpacity="0"/></radialGradient>
        </defs>

        {/* Outer walls */}
        <rect x={6} y={6} width={W-12} height={H-12} rx={3} fill="none" stroke="#B0A898" strokeWidth={10}/>

        {/* MAIN HALLWAY */}
        <rect x={10} y={262} width={W-20} height={55} fill={HL}/>
        {Array.from({length:16}).map((_,i) => <line key={`hl${i}`} x1={10+i*66} y1={262} x2={10+i*66} y2={317} stroke="#E2DDD4" strokeWidth={0.5}/>)}
        <text x={W/2} y={294} textAnchor="middle" style={{fontSize:'7px',fill:'#B0A898',letterSpacing:'3px',fontWeight:600}}>MAIN CORRIDOR</text>
        {[120,350,580,800].map((px,i) => (
          <g key={`hp${i}`}>
            <rect x={px-6} y={280} width={12} height={10} rx={3} fill="#8B7355" stroke="#6B5535" strokeWidth={0.5}/>
            <ellipse cx={px} cy={276} rx={7} ry={6} fill="#4CAF50"/><ellipse cx={px-3} cy={278} rx={4} ry={5} fill="#66BB6A"/><ellipse cx={px+2} cy={274} rx={5} ry={4} fill="#81C784"/>
          </g>
        ))}
        <g><rect x={680} y={272} width={12} height={18} rx={2} fill="#E3F2FD" stroke="#90CAF9" strokeWidth={0.8}/><ellipse cx={686} cy={271} rx={5} ry={3} fill="#BBDEFB"/></g>

        {/* ========== TOP ROW ========== */}

        {/* CEO OFFICE */}
        <g className="room-highlight" onClick={() => setSelectedAgent(null)}>
          <rect x={12} y={12} width={195} height={248} rx={2} fill={F} filter="url(#rs)"/>
          <text x={110} y={28} textAnchor="middle" style={{fontFamily:'var(--font-heading)',fontWeight:600,fontSize:'8px',fill:'#A0AEC0',letterSpacing:'1px'}}>CEO OFFICE</text>
          <text x={110} y={38} textAnchor="middle" style={{fontSize:'6.5px',fill:'#CBD5E0'}}>Sarthak Varma</text>
          {/* L-desk */}
          <rect x={30} y={80} width={62} height={26} rx={4} fill="url(#wood)" stroke="#8B6914" strokeWidth={1}/>
          <rect x={30} y={106} width={28} height={38} rx={4} fill="url(#wood)" stroke="#8B6914" strokeWidth={1}/>
          {/* Monitors */}
          <rect x={38} y={83} width={20} height={13} rx={3} fill="#1A1A2E" stroke="#333" strokeWidth={0.6}/>
          <rect x={40} y={85} width={16} height={9} rx={2} fill="#2563EB" opacity={0.4} className="screen-glow"/>
          <rect x={62} y={83} width={20} height={13} rx={3} fill="#1A1A2E" stroke="#333" strokeWidth={0.6}/>
          <rect x={64} y={85} width={16} height={9} rx={2} fill="#2563EB" opacity={0.4} className="screen-glow"/>
          {/* Exec chair */}
          <ellipse cx={55} cy={135} rx={14} ry={16} fill="#3D2E17" stroke="#2A1E0F" strokeWidth={0.8}/>
          <ellipse cx={55} cy={133} rx={10} ry={12} fill="#5D4E37"/>
          <ellipse cx={55} cy={131} rx={7} ry={8} fill="#6B5B43"/>
          <ellipse cx={40} cy={135} rx={3} ry={6} fill="#3D2E17"/><ellipse cx={70} cy={135} rx={3} ry={6} fill="#3D2E17"/>
          {/* Couch */}
          <rect x={120} y={170} width={55} height={20} rx={10} fill="#5D4037" stroke="#3E2723" strokeWidth={0.8}/>
          <ellipse cx={137} cy={178} rx={12} ry={7} fill="#6D4C41"/><ellipse cx={158} cy={178} rx={12} ry={7} fill="#6D4C41"/>
          <rect x={130} y={152} width={30} height={14} rx={4} fill="#A1887F" stroke="#8D6E63" strokeWidth={0.5}/>
          <g><rect x={168} y={42} width={14} height={12} rx={4} fill="#BCAAA4" stroke="#8D6E63" strokeWidth={0.5}/><ellipse cx={175} cy={36} rx={10} ry={10} fill="#388E3C"/><ellipse cx={172} cy={38} rx={6} ry={8} fill="#43A047"/><ellipse cx={178} cy={34} rx={7} ry={7} fill="#66BB6A"/></g>
          <ellipse cx={100} cy={180} rx={50} ry={30} fill="#C4A46C" opacity={0.2}/>
          <rect x={35} y={18} width={55} height={30} rx={2} fill="#E8EAF6" stroke="#C5CAE9" strokeWidth={0.8}/>
          <text x={62} y={36} textAnchor="middle" style={{fontSize:'5px',fill:'#7986CB'}}>WORLD MAP</text>
          {[25,55,85,115].map((wx,i) => <rect key={i} x={wx} y={12} width={22} height={4} rx={1} fill="#B3E5FC" opacity={0.6}/>)}
        </g>

        {/* REX */}
        <g className="room-highlight" onClick={() => setSelectedAgent('rex')}>
          <rect x={213} y={12} width={148} height={248} rx={2} fill={F} filter="url(#rs)"/>
          <rect x={235} y={85} width={52} height={24} rx={5} fill="#A1887F" stroke="#8D6E63" strokeWidth={0.8}/>
          <rect x={245} y={88} width={18} height={12} rx={2} fill="#1A1A2E" stroke="#333" strokeWidth={0.5}/><rect x={247} y={90} width={14} height={8} rx={1} fill="#EF5350" opacity={0.3} className="screen-glow"/>
          <rect x={267} y={88} width={18} height={12} rx={2} fill="#1A1A2E" stroke="#333" strokeWidth={0.5}/><rect x={269} y={90} width={14} height={8} rx={1} fill="#42A5F5" opacity={0.3} className="screen-glow"/>
          <circle cx={260} cy={122} r={10} fill="#455A64" stroke="#37474F" strokeWidth={0.6}/><circle cx={260} cy={121} r={7} fill="#546E7A"/>
          <ellipse cx={249} cy={122} rx={2.5} ry={5} fill="#455A64"/><ellipse cx={271} cy={122} rx={2.5} ry={5} fill="#455A64"/>
          {[240,250,270,280].map((wx,i) => <circle key={i} cx={wx} cy={132} r={1.5} fill="#37474F"/>)}
          <rect x={220} y={20} width={60} height={38} rx={2} fill="#FFF3E0" stroke="#FFB74D" strokeWidth={0.8}/>
          <text x={250} y={32} textAnchor="middle" style={{fontSize:'5px',fill:'#E65100',fontWeight:600}}>PROSPECT MAP</text>
          <circle cx={230} cy={42} r={2.5} fill="#E53935"/><circle cx={248} cy={38} r={2} fill="#1E88E5"/><circle cx={260} cy={45} r={1.8} fill="#43A047"/>
          <line x1={232} y1={42} x2={247} y2={38} stroke="#E53935" strokeWidth={0.4} strokeDasharray="2"/>
          <g transform="translate(330,25)"><circle cx={10} cy={10} r={10} fill="#FFCDD2"/><circle cx={10} cy={10} r={6.5} fill="#EF9A9A"/><circle cx={10} cy={10} r={3.5} fill="#EF5350"/><circle cx={10} cy={10} r={1.2} fill="#B71C1C"/></g>
          <g><rect x={219} y={215} width={12} height={10} rx={3} fill="#8D6E63"/><ellipse cx={225} cy={209} rx={8} ry={8} fill="#388E3C"/></g>
          {[225,255,285].map((wx,i) => <rect key={i} x={wx} y={12} width={22} height={4} rx={1} fill="#B3E5FC" opacity={0.6}/>)}
        </g>
        <g onMouseEnter={()=>setHovered('rex')} onMouseLeave={()=>setHovered(null)} onClick={()=>setSelectedAgent('rex')}>
          <AnimatedAgent pos={agentPositions.rex} agent={a.rex} isHovered={hovered==='rex'} tick={tick}/>
        </g>

        {/* ACE */}
        <g className="room-highlight" onClick={() => setSelectedAgent('ace')}>
          <rect x={367} y={12} width={148} height={248} rx={2} fill={F} filter="url(#rs)"/>
          <rect x={390} y={75} width={50} height={24} rx={5} fill="#795548" stroke="#5D4037" strokeWidth={0.8}/>
          <rect x={405} y={78} width={18} height={12} rx={2} fill="#1A1A2E" stroke="#333" strokeWidth={0.5}/><rect x={407} y={80} width={14} height={8} rx={1} fill="#7E57C2" opacity={0.3} className="screen-glow"/>
          <circle cx={414} cy={112} r={10} fill="#263238" stroke="#1B1F23" strokeWidth={0.6}/><circle cx={414} cy={111} r={7} fill="#37474F"/>
          <ellipse cx={403} cy={112} rx={2.5} ry={5} fill="#263238"/><ellipse cx={425} cy={112} rx={2.5} ry={5} fill="#263238"/>
          <rect x={380} y={170} width={48} height={18} rx={9} fill="#455A64" stroke="#37474F" strokeWidth={0.6}/>
          <circle cx={392} cy={177} r={6} fill="#546E7A" opacity={0.6}/><circle cx={404} cy={177} r={6} fill="#546E7A" opacity={0.6}/><circle cx={416} cy={177} r={6} fill="#546E7A" opacity={0.6}/>
          <rect x={392} y={155} width={26} height={12} rx={3} fill="#A1887F" stroke="#8D6E63" strokeWidth={0.5}/>
          {[378,400,422].map((px,i) => <g key={i}><rect x={px} y={20} width={16} height={22} rx={2} fill="#FFF8E1" stroke="#FFD54F" strokeWidth={0.8}/><circle cx={px+8} cy={30} r={3} fill="#FFD54F"/></g>)}
          <ellipse cx={465} cy={220} rx={28} ry={12} fill="#81C784" opacity={0.5}/><circle cx={478} cy={218} r={2} fill="#2E7D32"/>
          {[380,410,440].map((wx,i) => <rect key={i} x={wx} y={12} width={22} height={4} rx={1} fill="#B3E5FC" opacity={0.6}/>)}
        </g>
        <g onMouseEnter={()=>setHovered('ace')} onMouseLeave={()=>setHovered(null)} onClick={()=>setSelectedAgent('ace')}>
          <AnimatedAgent pos={agentPositions.ace} agent={a.ace} isHovered={hovered==='ace'} tick={tick}/>
        </g>

        {/* NOVA */}
        <g className="room-highlight" onClick={() => setSelectedAgent('nova')}>
          <rect x={521} y={12} width={148} height={248} rx={2} fill={F} filter="url(#rs)"/>
          <rect x={540} y={90} width={48} height={24} rx={5} fill="#A1887F" stroke="#8D6E63" strokeWidth={0.8}/>
          <rect x={555} y={93} width={18} height={12} rx={2} fill="#1A1A2E" stroke="#333" strokeWidth={0.5}/><rect x={557} y={95} width={14} height={8} rx={1} fill="#EC407A" opacity={0.3} className="screen-glow"/>
          <circle cx={563} cy={126} r={10} fill="#7B1FA2" stroke="#6A1B9A" strokeWidth={0.6}/><circle cx={563} cy={125} r={7} fill="#9C27B0"/>
          <ellipse cx={552} cy={126} rx={2.5} ry={5} fill="#7B1FA2"/><ellipse cx={574} cy={126} rx={2.5} ry={5} fill="#7B1FA2"/>
          {[[645,30,55],[530,30,45],[645,95,40]].map(([bx,by,bh],i) => (
            <g key={i}><rect x={bx} y={by} width={14} height={bh} rx={1} fill="#A1887F" stroke="#8D6E63" strokeWidth={0.5}/>
              {Array.from({length:Math.floor(bh/12)}).map((_,j) => <rect key={j} x={bx+2} y={by+2+j*12} width={10} height={9} rx={1} fill={['#EF5350','#42A5F5','#66BB6A','#FFA726','#AB47BC'][j%5]} opacity={0.5}/>)}
            </g>))}
          <rect x={570} y={22} width={11} height={11} fill="#FFF9C4" transform="rotate(-5 575 27)"/>
          <rect x={583} y={18} width={11} height={11} fill="#F8BBD0" transform="rotate(3 588 23)"/>
          <rect x={575} y={32} width={11} height={11} fill="#C8E6C9" transform="rotate(-2 580 37)"/>
          <ellipse cx={560} cy={200} rx={16} ry={14} fill="#CE93D8" opacity={0.3}/><ellipse cx={560} cy={198} rx={12} ry={10} fill="#BA68C8" opacity={0.4}/>
          <circle cx={542} cy={185} r={12} fill="url(#lamp-glow)"/><rect x={540} y={180} width={4} height={12} rx={1} fill="#BF360C"/><ellipse cx={542} cy={179} rx={5} ry={2} fill="#FFE082"/>
          <ellipse cx={575} cy={180} rx={32} ry={22} fill="#E1BEE7" opacity={0.15}/>
          {[535,565,595].map((wx,i) => <rect key={i} x={wx} y={12} width={22} height={4} rx={1} fill="#B3E5FC" opacity={0.6}/>)}
        </g>
        <g onMouseEnter={()=>setHovered('nova')} onMouseLeave={()=>setHovered(null)} onClick={()=>setSelectedAgent('nova')}>
          <AnimatedAgent pos={agentPositions.nova} agent={a.nova} isHovered={hovered==='nova'} tick={tick}/>
        </g>

        {/* DASH */}
        <g className="room-highlight" onClick={() => setSelectedAgent('dash')}>
          <rect x={675} y={12} width={148} height={248} rx={2} fill={F} filter="url(#rs)"/>
          <rect x={695} y={80} width={62} height={26} rx={5} fill="#78909C" stroke="#607D8B" strokeWidth={0.8}/>
          {[700,720,740].map((mx,i) => <g key={i}><rect x={mx} y={83} width={16} height={11} rx={2} fill="#1A1A2E" stroke="#333" strokeWidth={0.5}/><rect x={mx+1.5} y={84.5} width={13} height={8} rx={1} fill={['#42A5F5','#66BB6A','#FFA726'][i]} opacity={0.3} className="screen-glow"/></g>)}
          <circle cx={728} cy={120} r={10} fill="#455A64" stroke="#37474F" strokeWidth={0.6}/><circle cx={728} cy={119} r={7} fill="#607D8B"/>
          <ellipse cx={717} cy={120} rx={2.5} ry={5} fill="#455A64"/><ellipse cx={739} cy={120} rx={2.5} ry={5} fill="#455A64"/>
          <rect x={695} y={20} width={52} height={32} rx={2} fill="#E3F2FD" stroke="#90CAF9" strokeWidth={0.8}/>
          <rect x={700} y={26} width={20} height={5} rx={1} fill="#42A5F5" opacity={0.4}/><rect x={700} y={34} width={40} height={3} rx={1} fill="#66BB6A" opacity={0.4}/>
          <rect x={700} y={40} width={30} height={3} rx={1} fill="#FFA726" opacity={0.4}/>
          <g><rect x={795} y={215} width={10} height={8} rx={3} fill="#8D6E63"/><ellipse cx={800} cy={211} rx={6} ry={6} fill="#388E3C"/></g>
          {[690,720,750].map((wx,i) => <rect key={i} x={wx} y={12} width={22} height={4} rx={1} fill="#B3E5FC" opacity={0.6}/>)}
        </g>
        <g onMouseEnter={()=>setHovered('dash')} onMouseLeave={()=>setHovered(null)} onClick={()=>setSelectedAgent('dash')}>
          <AnimatedAgent pos={agentPositions.dash} agent={a.dash} isHovered={hovered==='dash'} tick={tick}/>
        </g>

        {/* CONFERENCE ROOM */}
        <rect x={829} y={12} width={220} height={248} rx={2} fill={F} filter="url(#rs)"/>
        <text x={939} y={28} textAnchor="middle" style={{fontFamily:'var(--font-heading)',fontWeight:600,fontSize:'8px',fill:'#A0AEC0',letterSpacing:'1px'}}>CONFERENCE ROOM</text>
        <ellipse cx={939} cy={140} rx={58} ry={34} fill="#A1887F" stroke="#8D6E63" strokeWidth={1.2}/><ellipse cx={939} cy={140} rx={52} ry={28} fill="#BCAAA4" opacity={0.4}/>
        {[0,45,90,135,180,225,270,315].map((ang,i) => {
          const rad=ang*Math.PI/180; const cx=939+72*Math.cos(rad); const cy=140+48*Math.sin(rad)
          return <g key={i}><circle cx={cx} cy={cy} r={8} fill="#455A64" stroke="#37474F" strokeWidth={0.5}/><circle cx={cx} cy={cy-0.5} r={5.5} fill="#607D8B"/></g>
        })}
        <rect x={855} y={20} width={70} height={6} rx={1} fill="#ECEFF1" stroke="#CFD8DC" strokeWidth={0.5}/>
        <rect x={960} y={20} width={42} height={28} rx={3} fill="#1A1A2E" stroke="#333" strokeWidth={0.8}/><rect x={963} y={23} width={36} height={22} rx={2} fill="#1E88E5" opacity={0.2} className="screen-glow"/>
        <g><rect x={840} y={228} width={12} height={10} rx={3} fill="#8D6E63"/><ellipse cx={846} cy={222} rx={9} ry={9} fill="#388E3C"/></g>
        <g><rect x={1024} y={228} width={12} height={10} rx={3} fill="#8D6E63"/><ellipse cx={1030} cy={222} rx={9} ry={9} fill="#388E3C"/></g>
        {[845,875,905,935,965].map((wx,i) => <rect key={i} x={wx} y={12} width={22} height={4} rx={1} fill="#B3E5FC" opacity={0.6}/>)}

        {/* ========== BOTTOM ROW ========== */}

        {/* PIXEL */}
        <g className="room-highlight" onClick={() => setSelectedAgent('pixel')}>
          <rect x={12} y={319} width={160} height={158} rx={2} fill={F} filter="url(#rs)"/>
          <rect x={30} y={348} width={52} height={24} rx={5} fill="#A1887F" stroke="#8D6E63" strokeWidth={0.8}/>
          <rect x={42} y={351} width={22} height={14} rx={2} fill="#1A1A2E" stroke="#333" strokeWidth={0.5}/><rect x={44} y={353} width={18} height={10} rx={1} fill="#F57C00" opacity={0.3} className="screen-glow"/>
          <circle cx={55} cy={386} r={10} fill="#E65100" stroke="#BF360C" strokeWidth={0.6}/><circle cx={55} cy={385} r={7} fill="#F4511E"/>
          <ellipse cx={44} cy={386} rx={2.5} ry={5} fill="#E65100"/><ellipse cx={66} cy={386} rx={2.5} ry={5} fill="#E65100"/>
          <rect x={95} y={352} width={32} height={24} rx={4} fill="#37474F" stroke="#263238" strokeWidth={0.6}/>
          <rect x={98} y={355} width={26} height={18} rx={3} fill="#42A5F5" opacity={0.2}/><line x1={103} y1={360} x2={118} y2={368} stroke="#FF7043" strokeWidth={1.5} strokeLinecap="round"/>
          {['#EF9A9A','#90CAF9','#A5D6A7','#FFF59D'].map((c,i) => <rect key={i} x={25+i*24} y={325} width={18} height={14} rx={2} fill={c} opacity={0.7}/>)}
          <g><rect x={139} y={440} width={10} height={8} rx={3} fill="#8D6E63"/><ellipse cx={144} cy={436} rx={6} ry={6} fill="#388E3C"/></g>
        </g>
        <g onMouseEnter={()=>setHovered('pixel')} onMouseLeave={()=>setHovered(null)} onClick={()=>setSelectedAgent('pixel')}>
          <AnimatedAgent pos={agentPositions.pixel} agent={a.pixel} isHovered={hovered==='pixel'} tick={tick}/>
        </g>

        {/* PRISM */}
        <g className="room-highlight" onClick={() => setSelectedAgent('prism')}>
          <rect x={178} y={319} width={160} height={158} rx={2} fill={F} filter="url(#rs)"/>
          <rect x={200} y={348} width={48} height={24} rx={5} fill="#A1887F" stroke="#8D6E63" strokeWidth={0.8}/>
          <rect x={213} y={351} width={20} height={13} rx={2} fill="#1A1A2E" stroke="#333" strokeWidth={0.5}/><rect x={215} y={353} width={16} height={9} rx={1} fill="#AB47BC" opacity={0.3} className="screen-glow"/>
          <circle cx={223} cy={386} r={10} fill="#6A1B9A" stroke="#4A148C" strokeWidth={0.6}/><circle cx={223} cy={385} r={7} fill="#8E24AA"/>
          <ellipse cx={212} cy={386} rx={2.5} ry={5} fill="#6A1B9A"/><ellipse cx={234} cy={386} rx={2.5} ry={5} fill="#6A1B9A"/>
          <rect x={282} y={335} width={18} height={14} rx={3} fill="#37474F" stroke="#263238" strokeWidth={0.5}/>
          <circle cx={291} cy={342} r={5} fill="#455A64" stroke="#607D8B" strokeWidth={0.5}/><circle cx={291} cy={342} r={2.5} fill="#42A5F5" opacity={0.4}/>
          <circle cx={302} cy={370} r={10} fill="none" stroke="#FFE082" strokeWidth={3} opacity={0.4} className="ring-light"/>
          <rect x={268} y={400} width={55} height={40} fill="#A5D6A7" opacity={0.15}/><rect x={268} y={395} width={55} height={5} rx={1} fill="#66BB6A"/>
        </g>
        <g onMouseEnter={()=>setHovered('prism')} onMouseLeave={()=>setHovered(null)} onClick={()=>setSelectedAgent('prism')}>
          <AnimatedAgent pos={agentPositions.prism} agent={a.prism} isHovered={hovered==='prism'} tick={tick}/>
        </g>

        {/* ECHO */}
        <g className="room-highlight" onClick={() => setSelectedAgent('echo')}>
          <rect x={344} y={319} width={160} height={158} rx={2} fill={F} filter="url(#rs)"/>
          <rect x={365} y={348} width={48} height={24} rx={5} fill="#A1887F" stroke="#8D6E63" strokeWidth={0.8}/>
          <rect x={378} y={351} width={18} height={12} rx={2} fill="#1A1A2E" stroke="#333" strokeWidth={0.5}/><rect x={380} y={353} width={14} height={8} rx={1} fill="#26A69A" opacity={0.3} className="screen-glow"/>
          <rect x={400} y={355} width={8} height={13} rx={2} fill="#1A1A2E" stroke="#333" strokeWidth={0.5}/><rect x={401} y={357} width={6} height={9} rx={1} fill="#26A69A" opacity={0.3}/>
          <circle cx={388} cy={386} r={10} fill="#00695C" stroke="#004D40" strokeWidth={0.6}/><circle cx={388} cy={385} r={7} fill="#00897B"/>
          <ellipse cx={377} cy={386} rx={2.5} ry={5} fill="#00695C"/><ellipse cx={399} cy={386} rx={2.5} ry={5} fill="#00695C"/>
          <circle cx={460} cy={360} r={10} fill="none" stroke="#FFE082" strokeWidth={3} opacity={0.4} className="ring-light"/>
          <ellipse cx={470} cy={430} rx={20} ry={15} fill="#F48FB1" opacity={0.3}/><ellipse cx={470} cy={427} rx={15} ry={11} fill="#F06292" opacity={0.3}/>
          <g><rect x={355} y={440} width={12} height={12} rx={3} fill="#8D6E63"/><ellipse cx={361} cy={428} rx={10} ry={14} fill="#2E7D32"/><ellipse cx={358} cy={432} rx={6} ry={10} fill="#388E3C"/></g>
        </g>
        <g onMouseEnter={()=>setHovered('echo')} onMouseLeave={()=>setHovered(null)} onClick={()=>setSelectedAgent('echo')}>
          <AnimatedAgent pos={agentPositions.echo} agent={a.echo} isHovered={hovered==='echo'} tick={tick}/>
        </g>

        {/* SENTRY */}
        <g className="room-highlight" onClick={() => setSelectedAgent('sentry')}>
          <rect x={510} y={319} width={155} height={158} rx={2} fill={F} filter="url(#rs)"/>
          <rect x={530} y={355} width={52} height={24} rx={5} fill="#A1887F" stroke="#8D6E63" strokeWidth={0.8}/>
          <rect x={545} y={358} width={18} height={12} rx={2} fill="#1A1A2E" stroke="#333" strokeWidth={0.5}/><rect x={547} y={360} width={14} height={8} rx={1} fill="#FDD835" opacity={0.3} className="screen-glow"/>
          <circle cx={555} cy={392} r={10} fill="#F9A825" stroke="#F57F17" strokeWidth={0.6}/><circle cx={555} cy={391} r={7} fill="#FBC02D"/>
          <ellipse cx={544} cy={392} rx={2.5} ry={5} fill="#F9A825"/><ellipse cx={566} cy={392} rx={2.5} ry={5} fill="#F9A825"/>
          <g><rect x={625} y={340} width={24} height={38} rx={2} fill="#78909C" stroke="#546E7A" strokeWidth={0.8}/>
            {[0,1,2].map(i => <g key={i}><rect x={628} y={343+i*12} width={18} height={9} rx={1} fill="#90A4AE"/><circle cx={637} cy={347.5+i*12} r={1.5} fill="#546E7A"/></g>)}</g>
          <path d="M543 325 L551 329 L551 337 L543 343 L535 337 L535 329 Z" fill="#FDD835" stroke="#F9A825" strokeWidth={0.8}/>
          <text x={543} y={337} textAnchor="middle" style={{fontSize:'7px',fill:'#5D4037',fontWeight:700}}>QA</text>
          <rect x={565} y={325} width={38} height={28} rx={2} fill="#FFFDE7" stroke="#FFF176" strokeWidth={0.8}/>
          {[0,1,2,3].map(i => <g key={i}><rect x={569} y={330+i*6} width={4} height={4} rx={0.5} fill={i<2?'#66BB6A':'#E0E0E0'} stroke="#9E9E9E" strokeWidth={0.3}/><line x1={576} y1={332+i*6} x2={596} y2={332+i*6} stroke="#BDBDBD" strokeWidth={0.5}/></g>)}
        </g>
        <g onMouseEnter={()=>setHovered('sentry')} onMouseLeave={()=>setHovered(null)} onClick={()=>setSelectedAgent('sentry')}>
          <AnimatedAgent pos={agentPositions.sentry} agent={a.sentry} isHovered={hovered==='sentry'} tick={tick}/>
        </g>

        {/* SERVER ROOM */}
        <rect x={671} y={319} width={165} height={158} rx={2} fill="#EDEBE6" filter="url(#rs)"/>
        <text x={753} y={336} textAnchor="middle" style={{fontFamily:'var(--font-heading)',fontWeight:600,fontSize:'8px',fill:'#78909C',letterSpacing:'1px'}}>SERVER ROOM</text>
        {[690,718,746,774].map((rx,i) => (
          <g key={i}><rect x={rx} y={350} width={20} height={40} rx={2} fill="#37474F" stroke="#263238" strokeWidth={0.8}/>
            {[0,1,2,3].map(j => <g key={j}><rect x={rx+2} y={353+j*9} width={16} height={6} rx={1} fill="#455A64"/><circle cx={rx+16} cy={356+j*9} r={1.2} fill={j<2?'#66BB6A':'#FFA726'}/></g>)}</g>
        ))}
        <rect x={800} y={355} width={20} height={30} rx={3} fill="#90A4AE" stroke="#78909C" strokeWidth={0.6}/>
        <text x={810} y={374} textAnchor="middle" style={{fontSize:'6px',fill:'#455A64',fontWeight:600}}>AC</text>
        <g onMouseEnter={()=>setHovered('flux')} onMouseLeave={()=>setHovered(null)} onClick={()=>setSelectedAgent('flux')}>
          <AnimatedAgent pos={agentPositions.flux} agent={a.flux} isHovered={hovered==='flux'} tick={tick}/>
        </g>

        {/* SHELF */}
        <g className="room-highlight" onClick={() => setSelectedAgent('shelf')}>
          <rect x={12} y={483} width={160} height={165} rx={2} fill={F} filter="url(#rs)"/>
          <rect x={30} y={515} width={48} height={24} rx={5} fill="#A1887F" stroke="#8D6E63" strokeWidth={0.8}/>
          <rect x={43} y={518} width={18} height={12} rx={2} fill="#1A1A2E" stroke="#333" strokeWidth={0.5}/><rect x={45} y={520} width={14} height={8} rx={1} fill="#7CB342" opacity={0.3} className="screen-glow"/>
          <circle cx={53} cy={550} r={10} fill="#558B2F" stroke="#33691E" strokeWidth={0.6}/><circle cx={53} cy={549} r={7} fill="#689F38"/>
          <ellipse cx={42} cy={550} rx={2.5} ry={5} fill="#558B2F"/><ellipse cx={64} cy={550} rx={2.5} ry={5} fill="#558B2F"/>
          {[0,1,2].map(i => <g key={i}><rect x={105} y={500+i*20} width={52} height={14} rx={2} fill="#A1887F" stroke="#8D6E63" strokeWidth={0.6}/>
            {[0,1,2,3].map(j => <rect key={j} x={110+j*12} y={502+i*20} width={9} height={10} rx={2} fill={['#F48FB1','#64B5F6','#81C784','#FFB74D'][j]} opacity={0.5}/>)}</g>)}
          <rect x={30} y={580} width={18} height={16} rx={2} fill="#FFA726" stroke="#F57C00" strokeWidth={0.5}/>
          <rect x={50} y={585} width={16} height={13} rx={2} fill="#FF8A65" stroke="#E64A19" strokeWidth={0.5}/>
          {[30,60,90].map((wx,i) => <rect key={i} x={wx} y={H-10} width={22} height={4} rx={1} fill="#B3E5FC" opacity={0.6}/>)}
        </g>
        <g onMouseEnter={()=>setHovered('shelf')} onMouseLeave={()=>setHovered(null)} onClick={()=>setSelectedAgent('shelf')}>
          <AnimatedAgent pos={agentPositions.shelf} agent={a.shelf} isHovered={hovered==='shelf'} tick={tick}/>
        </g>

        {/* BREAK ROOM */}
        <rect x={178} y={483} width={220} height={165} rx={2} fill={F} filter="url(#rs)"/>
        <text x={288} y={498} textAnchor="middle" style={{fontFamily:'var(--font-heading)',fontWeight:600,fontSize:'8px',fill:'#A0AEC0',letterSpacing:'1px'}}>BREAK ROOM</text>
        <circle cx={260} cy={565} r={22} fill="#A1887F" stroke="#8D6E63" strokeWidth={1}/><circle cx={260} cy={565} r={18} fill="#BCAAA4" opacity={0.4}/>
        {[0,90,180,270].map((ang,i) => { const rad=ang*Math.PI/180; return <g key={i}><circle cx={260+32*Math.cos(rad)} cy={565+32*Math.sin(rad)} r={7} fill="#455A64" stroke="#37474F" strokeWidth={0.4}/><circle cx={260+32*Math.cos(rad)} cy={565+32*Math.sin(rad)-0.5} r={5} fill="#607D8B"/></g> })}
        <rect x={355} y={510} width={18} height={22} rx={3} fill="#455A64" stroke="#37474F" strokeWidth={0.6}/><circle cx={364} cy={526} r={3} fill="#EF5350" opacity={0.6}/>
        <rect x={190} y={510} width={44} height={18} rx={9} fill="#7B1FA2" stroke="#6A1B9A" strokeWidth={0.5}/>
        <g><rect x={370} y={610} width={12} height={10} rx={3} fill="#8D6E63"/><ellipse cx={376} cy={604} rx={8} ry={8} fill="#388E3C"/></g>
        {[200,235,270,305,340].map((wx,i) => <rect key={i} x={wx} y={H-10} width={22} height={4} rx={1} fill="#B3E5FC" opacity={0.6}/>)}

        {/* CORTEX */}
        <g className="room-highlight" onClick={() => setSelectedAgent('cortex')}>
          <rect x={404} y={483} width={260} height={165} rx={2} fill={F} filter="url(#rs)"/>
          <rect x={430} y={520} width={62} height={26} rx={4} fill="url(#wood)" stroke="#8B6914" strokeWidth={0.8}/>
          <rect x={464} y={546} width={28} height={38} rx={4} fill="url(#wood)" stroke="#8B6914" strokeWidth={0.8}/>
          <rect x={440} y={523} width={20} height={13} rx={2} fill="#1A1A2E" stroke="#333" strokeWidth={0.5}/><rect x={442} y={525} width={16} height={9} rx={1} fill="#5C6BC0" opacity={0.3} className="screen-glow"/>
          <rect x={464} y={523} width={20} height={13} rx={2} fill="#1A1A2E" stroke="#333" strokeWidth={0.5}/><rect x={466} y={525} width={16} height={9} rx={1} fill="#5C6BC0" opacity={0.3} className="screen-glow"/>
          <ellipse cx={455} cy={565} rx={12} ry={14} fill="#283593" stroke="#1A237E" strokeWidth={0.6}/><ellipse cx={455} cy={563} rx={8} ry={10} fill="#3949AB"/>
          <ellipse cx={442} cy={565} rx={2.5} ry={6} fill="#283593"/><ellipse cx={468} cy={565} rx={2.5} ry={6} fill="#283593"/>
          <rect x={540} y={495} width={102} height={58} rx={4} fill="#ECEFF1" stroke="#CFD8DC" strokeWidth={0.8}/>
          <text x={591} y={508} textAnchor="middle" style={{fontSize:'6px',fill:'#546E7A',fontWeight:700,letterSpacing:'0.5px'}}>OPERATIONS BOARD</text>
          {[0,1,2,3].map(i => <g key={i}><rect x={548} y={514+i*10} width={8} height={7} rx={1.5} fill={['#66BB6A','#66BB6A','#FFA726','#42A5F5'][i]} opacity={0.6}/><rect x={560} y={515+i*10} width={68} height={5} rx={1} fill="#E0E0E0"/><rect x={560} y={515+i*10} width={[55,42,30,68][i]} height={5} rx={1} fill={['#66BB6A','#66BB6A','#FFA726','#42A5F5'][i]} opacity={0.2}/></g>)}
          <g><rect x={415} y={618} width={14} height={12} rx={4} fill="#8D6E63"/><ellipse cx={422} cy={610} rx={12} ry={12} fill="#2E7D32"/><ellipse cx={419} cy={614} rx={7} ry={9} fill="#388E3C"/></g>
          <ellipse cx={500} cy={575} rx={40} ry={25} fill="#C5CAE9" opacity={0.12}/>
          {[420,455,490,525,560,595].map((wx,i) => <rect key={i} x={wx} y={H-10} width={22} height={4} rx={1} fill="#B3E5FC" opacity={0.6}/>)}
        </g>
        <g onMouseEnter={()=>setHovered('cortex')} onMouseLeave={()=>setHovered(null)} onClick={()=>setSelectedAgent('cortex')}>
          <AnimatedAgent pos={agentPositions.cortex} agent={a.cortex} isHovered={hovered==='cortex'} tick={tick}/>
        </g>

        {/* LEDGER */}
        <g className="room-highlight" onClick={() => setSelectedAgent('ledger')}>
          <rect x={671} y={483} width={165} height={165} rx={2} fill={F} filter="url(#rs)"/>
          <rect x={695} y={520} width={52} height={24} rx={5} fill="#A1887F" stroke="#8D6E63" strokeWidth={0.8}/>
          <rect x={710} y={523} width={18} height={12} rx={2} fill="#1A1A2E" stroke="#333" strokeWidth={0.5}/><rect x={712} y={525} width={14} height={8} rx={1} fill="#43A047" opacity={0.3} className="screen-glow"/>
          <circle cx={720} cy={558} r={10} fill="#2E7D32" stroke="#1B5E20" strokeWidth={0.6}/><circle cx={720} cy={557} r={7} fill="#388E3C"/>
          <ellipse cx={709} cy={558} rx={2.5} ry={5} fill="#2E7D32"/><ellipse cx={731} cy={558} rx={2.5} ry={5} fill="#2E7D32"/>
          {[780,808].map((fx,i) => <g key={i}><rect x={fx} y={500} width={24} height={38} rx={2} fill="#78909C" stroke="#546E7A" strokeWidth={0.6}/>
            {[0,1,2].map(j => <g key={j}><rect x={fx+3} y={503+j*12} width={18} height={9} rx={1} fill="#90A4AE"/><circle cx={fx+12} cy={507.5+j*12} r={1.5} fill="#546E7A"/></g>)}</g>)}
          <rect x={790} y={600} width={24} height={24} rx={3} fill="#455A64" stroke="#37474F" strokeWidth={1}/><circle cx={802} cy={612} r={5.5} fill="none" stroke="#90A4AE" strokeWidth={1.2}/><circle cx={802} cy={612} r={1.8} fill="#90A4AE"/>
          <rect x={750} y={525} width={14} height={18} rx={2} fill="#ECEFF1" stroke="#CFD8DC" strokeWidth={0.5}/><rect x={752} y={527} width={10} height={5} rx={1} fill="#C8E6C9"/>
        </g>
        <g onMouseEnter={()=>setHovered('ledger')} onMouseLeave={()=>setHovered(null)} onClick={()=>setSelectedAgent('ledger')}>
          <AnimatedAgent pos={agentPositions.ledger} agent={a.ledger} isHovered={hovered==='ledger'} tick={tick}/>
        </g>

        {/* Side windows */}
        {[40,70,100,130,160].map((wy,j) => <rect key={`rw${j}`} x={W-10} y={wy} width={4} height={22} rx={1} fill="#B3E5FC" opacity={0.6}/>)}
        {[335,365,395,425].map((wy,j) => <rect key={`rw2${j}`} x={W-10} y={wy} width={4} height={22} rx={1} fill="#B3E5FC" opacity={0.6}/>)}
        {[500,530,560,590].map((wy,j) => <rect key={`rw3${j}`} x={W-10} y={wy} width={4} height={22} rx={1} fill="#B3E5FC" opacity={0.6}/>)}
        {[335,370,405].map((wy,j) => <rect key={`lw${j}`} x={10} y={wy} width={4} height={22} rx={1} fill="#B3E5FC" opacity={0.6}/>)}
        {[500,535,570].map((wy,j) => <rect key={`lw2${j}`} x={10} y={wy} width={4} height={22} rx={1} fill="#B3E5FC" opacity={0.6}/>)}

        {/* LEGEND */}
        <rect x={842} y={483} width={206} height={165} rx={2} fill={F} filter="url(#rs)"/>
        <text x={945} y={502} textAnchor="middle" style={{fontFamily:'var(--font-heading)',fontWeight:700,fontSize:'9px',fill:'#1A1A2E'}}>FLOOR LEGEND</text>
        <line x1={870} y1={508} x2={1020} y2={508} stroke="#E0E0E0" strokeWidth={0.5}/>
        <circle cx={870} cy={525} r={5} fill="#66BB6A"/><text x={882} y={528} style={{fontSize:'8px',fill:'#455A64'}}>Active / Working</text>
        <circle cx={870} cy={542} r={5} fill="#FFA726"/><text x={882} y={545} style={{fontSize:'8px',fill:'#455A64'}}>Paused</text>
        <circle cx={870} cy={559} r={5} fill="#BDBDBD"/><text x={882} y={562} style={{fontSize:'8px',fill:'#455A64'}}>Idle / Offline</text>
        <rect x={866} y={572} width={8} height={8} rx={1} fill="#B3E5FC" opacity={0.8}/><text x={882} y={580} style={{fontSize:'8px',fill:'#455A64'}}>Windows</text>
        <rect x={866} y={588} width={8} height={6} rx={1} fill="#A1887F"/><text x={882} y={594} style={{fontSize:'8px',fill:'#455A64'}}>Desk / Furniture</text>
        <ellipse cx={870} cy={610} rx={4} ry={4} fill="#388E3C"/><text x={882} y={613} style={{fontSize:'8px',fill:'#455A64'}}>Plant</text>
        <text x={945} y={638} textAnchor="middle" style={{fontSize:'6.5px',fill:'#BDBDBD',letterSpacing:'0.5px'}}>SMVP AUTO-OFFICE HQ v2.0</text>
      </svg>
    </div>
  )
}

/* ============================================
   ANIMATED AGENT — top-down mini person
   ============================================ */
function AnimatedAgent({ pos, agent, isHovered, tick }) {
  if (!pos || !agent) return null
  const isActive = agent.status === 'active'
  const sc = isActive ? '#66BB6A' : agent.status === 'paused' ? '#FFA726' : '#BDBDBD'
  const atDesk = pos.atDesk
  const handPhase = tick * 0.5
  const leftOff = isActive && atDesk ? Math.sin(handPhase) * 2.5 : 0
  const rightOff = isActive && atDesk ? Math.sin(handPhase + Math.PI) * 2.5 : 0
  const walkBob = !atDesk && isActive ? Math.sin(tick * 2) * 1.2 : 0

  return (
    <g className="agent-g" style={{ transform: `translate(${pos.x}px, ${pos.y + walkBob}px)` }} filter="url(#agent-shadow)">
      {/* Ground shadow */}
      <ellipse cx={0} cy={16} rx={isHovered ? 14 : 11} ry={isHovered ? 5 : 3.5} fill="rgba(0,0,0,0.12)" style={{transition:'all 0.2s'}}/>

      {/* Body torso */}
      <ellipse cx={0} cy={3} rx={isHovered ? 12 : 10} ry={isHovered ? 14 : 12} fill={agent.color} stroke="#fff" strokeWidth={2.2} style={{transition:'all 0.15s', filter: isHovered ? 'brightness(1.15)' : 'none'}}/>

      {/* Head */}
      <circle cx={0} cy={-6} r={isHovered ? 8.5 : 7.5} fill={agent.color} stroke="#fff" strokeWidth={1.8}/>

      {/* Hair/top accent */}
      <ellipse cx={0} cy={-10} rx={6} ry={3} fill={agent.color} opacity={0.7}/>

      {/* Eyes */}
      <ellipse cx={-2.8} cy={-7} rx={1.5} ry={1.8} fill="#fff"/>
      <ellipse cx={2.8} cy={-7} rx={1.5} ry={1.8} fill="#fff"/>
      <circle cx={-2.8} cy={-6.8} r={0.8} fill="#1A1A2E"/>
      <circle cx={2.8} cy={-6.8} r={0.8} fill="#1A1A2E"/>

      {/* Smile when active */}
      {isActive && <path d="M-2 -3.5 Q0 -1.5 2 -3.5" fill="none" stroke="#fff" strokeWidth={0.6} strokeLinecap="round"/>}

      {/* Arms and hands */}
      <line x1={-8} y1={2} x2={-12 + leftOff} y2={7} stroke={agent.color} strokeWidth={2.5} strokeLinecap="round"/>
      <line x1={8} y1={2} x2={12 + rightOff} y2={7} stroke={agent.color} strokeWidth={2.5} strokeLinecap="round"/>
      <circle cx={-12 + leftOff} cy={7} r={3} fill={agent.color} stroke="#fff" strokeWidth={0.8} className={isActive && atDesk ? 'typing-hand' : ''}/>
      <circle cx={12 + rightOff} cy={7} r={3} fill={agent.color} stroke="#fff" strokeWidth={0.8}
        className={isActive && atDesk ? 'typing-hand' : ''} style={isActive && atDesk ? {animationDelay:'0.2s'} : {}}/>

      {/* Emoji badge on chest */}
      <text x={0} y={6} textAnchor="middle" fontSize={isHovered ? 9 : 7} style={{pointerEvents:'none'}}>{agent.emoji}</text>

      {/* Status ring */}
      <circle cx={0} cy={-6} r={isHovered ? 11 : 10} fill="none" stroke={sc} strokeWidth={1.5} opacity={isActive ? 0.6 : 0.3} strokeDasharray={isActive ? "3 2" : "none"}/>

      {/* Status dot */}
      <circle cx={8} cy={-12} r={3.5} fill={sc} stroke="#fff" strokeWidth={1.5}/>

      {/* Name */}
      <text x={0} y={28} textAnchor="middle" style={{fontFamily:'var(--font-heading)',fontWeight:700,fontSize:'9.5px',fill:'#1A1A2E',pointerEvents:'none'}}>{agent.name}</text>
      <text x={0} y={38} textAnchor="middle" style={{fontSize:'7px',fill: isActive ? '#43A047' : '#9E9E9E',fontWeight:600,pointerEvents:'none'}}>
        {isActive ? 'Working' : agent.status === 'paused' ? 'Paused' : 'Idle'}
      </text>

      {/* Thought bubble on hover */}
      {isHovered && (
        <g className="thought-bubble">
          <rect x={-52} y={-42} width={104} height={22} rx={11} fill="white" stroke="#E0E0E0" strokeWidth={0.8} style={{filter:'drop-shadow(0 1px 3px rgba(0,0,0,0.08))'}}/>
          <text x={0} y={-27} textAnchor="middle" style={{fontSize:'6.5px',fill:'#455A64',fontWeight:500}}>
            {DEMO_CURRENT[agent.id]?.substring(0, 32) || agent.role}
          </text>
          <circle cx={-3} cy={-18} r={2.5} fill="white" stroke="#E0E0E0" strokeWidth={0.5}/>
          <circle cx={0} cy={-14} r={1.5} fill="white" stroke="#E0E0E0" strokeWidth={0.4}/>
        </g>
      )}

      {/* Typing particles */}
      {isActive && atDesk && [0,1,2].map(i => (
        <rect key={i} x={-4+i*4} y={-16-(tick+i*3)%7} width={2} height={2} rx={0.5} fill={agent.color} opacity={0.5-((tick+i*3)%7)*0.07}/>
      ))}

      {/* Walking dust when moving */}
      {isActive && !atDesk && [0,1].map(i => (
        <circle key={i} cx={-3+i*6} cy={17+(tick+i*2)%4} r={1.5-((tick+i*2)%4)*0.3} fill="#D7CCC8" opacity={0.4-((tick+i*2)%4)*0.1}/>
      ))}
    </g>
  )
}

/* ============================================
   PIPELINE VIEW — with demo tasks
   ============================================ */
function PipelineView() {
  const stages = ['Research', 'Outreach', 'Proposal', 'Closing', 'Delivery']
  const agentMap = {}
  AGENTS.forEach(a => { agentMap[a.id] = a })
  return (
    <div className="card" style={{ padding: '24px' }}>
      <div className="card-header">
        <h3 className="card-title">Pipeline Overview</h3>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{DEMO_TASKS.length} active tasks</span>
      </div>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
        {stages.map(stage => {
          const tasks = DEMO_TASKS.filter(t => t.stage === stage)
          return (
            <div key={stage} style={{ flex: '1', minWidth: '200px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '13px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid var(--accent-blue)', display: 'flex', justifyContent: 'space-between' }}>
                {stage}
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff', background: tasks.length > 0 ? 'var(--accent-blue)' : 'var(--text-muted)', borderRadius: '10px', padding: '1px 8px' }}>{tasks.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tasks.map(task => (
                  <div key={task.id} style={{ padding: '10px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border)', borderLeft: `3px solid ${agentMap[task.agent]?.color || '#ccc'}` }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>{task.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{agentMap[task.agent]?.emoji} {agentMap[task.agent]?.name}</span>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: task.priority === 'high' ? '#EF5350' : task.priority === 'medium' ? '#FFA726' : '#66BB6A' }}>{task.priority}</span>
                    </div>
                    <div style={{ marginTop: '6px', height: '4px', background: '#E0E0E0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '2px', width: `${task.progress}%`, background: agentMap[task.agent]?.color || '#42A5F5' }}/>
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '3px', textAlign: 'right' }}>{task.progress}%</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
