'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { getAgent } from '../../../lib/agents'
import AgentChat from '../../../components/AgentChat'
import AgentTasks from '../../../components/AgentTasks'

export default function AgentDetailPage() {
  const params = useParams()
  const agent = getAgent(params.agentId)

  const [autonomy, setAutonomy] = useState(agent?.autonomy || 30)
  const [status, setStatus] = useState(agent?.status || 'idle')
  const [activeTab, setActiveTab] = useState('chat')

  if (!agent) {
    return (
      <div>
        <a href="/agents" className="back-link">← Back to Agents</a>
        <div className="empty-state">
          <div className="empty-state-icon">?</div>
          <p className="empty-state-text">Agent not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="agent-detail">
      <a href="/agents" className="back-link">← All Agents</a>

      {/* Agent Header */}
      <div className="agent-detail-header">
        <div className="agent-detail-icon" style={{ borderLeft: `4px solid ${agent.color}` }}>
          {agent.emoji}
        </div>
        <div className="agent-detail-info">
          <h1>{agent.name}</h1>
          <div className="agent-detail-role">{agent.role}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{agent.description}</div>
        </div>
        <div className="agent-detail-status">
          <span className={`agent-status ${status}`} style={{ fontSize: '14px', padding: '6px 14px' }}>
            <span className="status-dot"></span>
            {status === 'active' ? 'Working' : status === 'paused' ? 'Paused' : 'Idle'}
          </span>
        </div>
      </div>

      {/* Controls Row */}
      <div className="controls-row">
        <button className="control-btn primary" onClick={() => setStatus('active')}>▶ Resume</button>
        <button className="control-btn" onClick={() => setStatus('paused')}>⏸ Pause</button>
        <button className="control-btn danger" onClick={() => setStatus('idle')}>⏹ Stop</button>
        <button className="control-btn" onClick={() => { setStatus('idle'); setTimeout(() => setStatus('active'), 500) }}>↻ Restart</button>

        <div className="autonomy-section">
          <span className="autonomy-label">Autonomy</span>
          <input
            type="range"
            className="autonomy-slider"
            min="0" max="100"
            value={autonomy}
            onChange={(e) => setAutonomy(parseInt(e.target.value))}
          />
          <span className="autonomy-value">{autonomy}%</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {[
          { id: 'chat', label: 'Chat', icon: '💬' },
          { id: 'tasks', label: 'Tasks', icon: '📋' },
          { id: 'stats', label: 'Stats', icon: '📊' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 20px', fontSize: '13px', fontWeight: 600,
              border: activeTab === tab.id ? `2px solid ${agent.color}` : '2px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: activeTab === tab.id ? agent.color + '10' : 'transparent',
              color: activeTab === tab.id ? agent.color : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' && (
        <div className="grid-2">
          <div>
            <AgentChat agent={agent} />
          </div>
          <div>
            <div className="card" style={{ padding: '16px' }}>
              <AgentTasks agent={agent} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="card" style={{ padding: '16px' }}>
          <AgentTasks agent={agent} />
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Performance</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Today</span>
            </div>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 0 }}>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--accent-blue)' }}>0</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Tasks Done</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--accent-green)' }}>—</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Quality Score</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--accent-yellow)' }}>0</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Escalations</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--text-muted)' }}>$0</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Token Spend</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Agent Info</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tier</span><span>{agent.tier}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Task Limit</span><span>{agent.taskLimit} concurrent</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Autonomy</span><span>{autonomy}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span><span>{status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
