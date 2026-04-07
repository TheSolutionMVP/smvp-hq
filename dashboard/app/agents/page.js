'use client'
import { AGENTS, TIERS } from '../../lib/agents'

export default function AgentsPage() {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Agents</h1>
          <p className="page-subtitle">13 agents across 3 tiers — click any agent to manage</p>
        </div>
      </div>

      {Object.entries(TIERS).map(([key, tier]) => (
        <div key={key}>
          <div className="tier-label">{tier.label} — {tier.description}</div>
          <div className="agent-grid">
            {AGENTS.filter(a => a.tier === key).map(agent => (
              <a key={agent.id} href={`/agents/${agent.id}`} className="agent-card">
                <div className="agent-card-accent" style={{ background: agent.color }}></div>
                <div className="agent-header">
                  <div className="agent-emoji">{agent.emoji}</div>
                  <div>
                    <div className="agent-name">{agent.name}</div>
                    <div className="agent-role">{agent.role}</div>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {agent.description}
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
    </div>
  )
}
