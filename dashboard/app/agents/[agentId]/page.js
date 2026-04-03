'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { getAgent, AGENTS } from '../../../lib/agents'

export default function AgentDetailPage() {
  const params = useParams()
  const agent = getAgent(params.agentId)

  const [autonomy, setAutonomy] = useState(agent?.autonomy || 30)
  const [status, setStatus] = useState(agent?.status || 'idle')
  const [taskQueue] = useState([
    // Placeholder — will come from Supabase
  ])
  const [activityLog] = useState([
    // Placeholder — will come from Supabase
  ])

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
        <button className="control-btn" onClick={() => { setStatus('idle'); setTimeout(() => setStatus('active'), 500); }}>↻ Restart</button>

        <div className="autonomy-section">
          <span className="autonomy-label">Autonomy</span>
          <input
            type="range"
            className="autonomy-slider"
            min="0"
            max="100"
            value={autonomy}
            onChange={(e) => setAutonomy(parseInt(e.target.value))}
          />
          <span className="autonomy-value">{autonomy}%</span>
        </div>
      </div>

      {/* Two Column: Task + Performance */}
      <div className="grid-2">
        {/* Left: Current Task + Queue */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Current Task</h3>
            </div>
            {status === 'active' ? (
              <div>
                <div className="current-task">
                  <div className="current-task-label">In Progress</div>
                  <div className="current-task-title">No active task — assign one below</div>
                  <div className="task-actions">
                    <button className="btn btn-approve">✓ Approve</button>
                    <button className="btn btn-reject">✗ Reject</button>
                    <button className="btn btn-advise">✎ Advise</button>
                    <button className="btn btn-skip">→ Skip</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <div className="empty-state-icon">◎</div>
                <p className="empty-state-text">Agent is {status} — resume to start working</p>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Task Queue</h3>
              <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>+ Add Task</button>
            </div>
            {taskQueue.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 16px' }}>
                <p className="empty-state-text">No tasks queued — add a task to get started</p>
              </div>
            ) : (
              <div>
                {taskQueue.map((task, i) => (
                  <div className="task-queue-item" key={i}>
                    <span className="task-number">{i + 1}.</span>
                    <span>{task.title}</span>
                    <span className={`task-queue-status ${task.status}`}>{task.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Performance + Activity */}
        <div>
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
              <h3 className="card-title">Knowledge & Training</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" style={{ fontSize: '12px' }}>View Knowledge Base</button>
              <button className="btn btn-advise" style={{ fontSize: '12px' }}>Teach Agent</button>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
              Task limit: {agent.taskLimit} concurrent &nbsp;|&nbsp; Tier: {agent.tier}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Activity Log</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Recent</span>
            </div>
            {activityLog.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 16px' }}>
                <p className="empty-state-text">No activity recorded yet</p>
              </div>
            ) : (
              <div>
                {activityLog.map((item, i) => (
                  <div className="activity-item" key={i}>
                    <span className="activity-time">{item.time}</span>
                    <span className="activity-text">{item.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
