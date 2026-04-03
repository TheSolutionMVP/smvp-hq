'use client'
import { useState } from 'react'
import { AGENTS, TIERS } from '../lib/agents'

const VIEWS = [
  { id: 'metrics', label: 'Metrics', icon: '◻' },
  { id: 'office', label: 'Office', icon: '▦' },
  { id: 'pipeline', label: 'Pipeline', icon: '▤' },
]

export default function Dashboard() {
  const [view, setView] = useState('metrics')
  const [agents, setAgents] = useState(AGENTS)

  return (
    <div>
      {/* Page Header with View Switcher */}
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

      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Agents</div>
          <div className="stat-value blue">{agents.filter(a => a.status === 'active').length} / {agents.length}</div>
          <div className="stat-change">{agents.filter(a => a.status === 'idle').length} idle</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Approvals</div>
          <div className="stat-value yellow">0</div>
          <div className="stat-change up">All clear</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tasks Today</div>
          <div className="stat-value green">0</div>
          <div className="stat-change">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Token Spend</div>
          <div className="stat-value purple">$0.00</div>
          <div className="stat-change">Today's cost</div>
        </div>
      </div>

      {/* View Content */}
      {view === 'metrics' && <MetricsView agents={agents} />}
      {view === 'office' && <OfficeView agents={agents} />}
      {view === 'pipeline' && <PipelineView />}
    </div>
  )
}

function MetricsView({ agents }) {
  return (
    <div>
      {/* Agents by Tier */}
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

      {/* Two Column: Approval Queue + Activity Feed */}
      <div className="grid-2" style={{ marginTop: '8px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Approval Queue</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>0 pending</span>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">✓</div>
            <p className="empty-state-text">No pending approvals — all clear</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Activity Feed</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Today</span>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">◎</div>
            <p className="empty-state-text">No agent activity yet — deploy your first task</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function OfficeView({ agents }) {
  return (
    <div className="card" style={{ padding: '32px', minHeight: '500px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h3 className="card-title" style={{ marginBottom: '4px' }}>SMVP Auto-Office HQ</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Top-down view — click any office to manage agent</p>
      </div>

      {/* Office Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Row 1: Front Office */}
        {agents.filter(a => a.tier === 'front-office').map(agent => (
          <a key={agent.id} href={`/agents/${agent.id}`} style={{
            background: 'var(--bg-secondary)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            textAlign: 'center',
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s',
            position: 'relative',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{agent.emoji}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '13px' }}>{agent.name}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{agent.status}</div>
            <div style={{
              position: 'absolute', top: '6px', right: '6px',
              width: '8px', height: '8px', borderRadius: '50%',
              background: agent.status === 'active' ? 'var(--accent-green)' : 'var(--text-muted)',
            }}></div>
          </a>
        ))}

        {/* Conference Room - spans 2 columns in middle */}
        <div style={{
          gridColumn: '2 / 4',
          background: 'var(--accent-blue-glow)',
          border: '2px dashed rgba(37, 99, 235, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>🤝</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '12px', color: 'var(--accent-blue)' }}>Conference Room</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Agent handoff zone</div>
        </div>

        {/* Spacer cells */}
        <div></div>
        <div></div>

        {/* Row 2: Back Office */}
        {agents.filter(a => a.tier === 'back-office').slice(0, 4).map(agent => (
          <a key={agent.id} href={`/agents/${agent.id}`} style={{
            background: 'var(--bg-secondary)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            textAlign: 'center',
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s',
            position: 'relative',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{agent.emoji}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '13px' }}>{agent.name}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{agent.status}</div>
            <div style={{
              position: 'absolute', top: '6px', right: '6px',
              width: '8px', height: '8px', borderRadius: '50%',
              background: agent.status === 'active' ? 'var(--accent-green)' : 'var(--text-muted)',
            }}></div>
          </a>
        ))}

        {/* Row 3: Back Office cont + Infrastructure */}
        {agents.filter(a => a.tier === 'back-office').slice(4).map(agent => (
          <a key={agent.id} href={`/agents/${agent.id}`} style={{
            background: 'var(--bg-secondary)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            textAlign: 'center',
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s',
            position: 'relative',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{agent.emoji}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '13px' }}>{agent.name}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{agent.status}</div>
            <div style={{
              position: 'absolute', top: '6px', right: '6px',
              width: '8px', height: '8px', borderRadius: '50%',
              background: agent.status === 'active' ? 'var(--accent-green)' : 'var(--text-muted)',
            }}></div>
          </a>
        ))}
        {agents.filter(a => a.tier === 'infrastructure').map(agent => (
          <a key={agent.id} href={`/agents/${agent.id}`} style={{
            background: 'var(--bg-secondary)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: agent.id === 'cortex' ? '16px' : '16px',
            textAlign: 'center',
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s',
            position: 'relative',
            gridColumn: agent.id === 'cortex' ? 'span 2' : 'span 1',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{agent.emoji}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '13px' }}>{agent.name}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{agent.role}</div>
            <div style={{
              position: 'absolute', top: '6px', right: '6px',
              width: '8px', height: '8px', borderRadius: '50%',
              background: agent.status === 'active' ? 'var(--accent-green)' : 'var(--text-muted)',
            }}></div>
          </a>
        ))}
      </div>
    </div>
  )
}

function PipelineView() {
  const stages = ['Research', 'Outreach', 'Proposal', 'Closing', 'Delivery']
  return (
    <div className="card" style={{ padding: '24px' }}>
      <div className="card-header">
        <h3 className="card-title">Pipeline Overview</h3>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Drag tasks between stages</span>
      </div>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
        {stages.map(stage => (
          <div key={stage} style={{
            flex: '1',
            minWidth: '180px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '13px',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '2px solid var(--accent-blue)',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              {stage}
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>0</span>
            </div>
            <div className="empty-state" style={{ padding: '24px 12px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No tasks yet</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
