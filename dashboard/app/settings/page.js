'use client'
import { useState } from 'react'
import { AGENTS } from '../../lib/agents'

export default function SettingsPage() {
  const [agentSettings, setAgentSettings] = useState(() =>
    AGENTS.map(a => ({ ...a }))
  )

  function updateAutonomy(agentId, value) {
    setAgentSettings(prev => prev.map(a => a.id === agentId ? { ...a, autonomy: parseInt(value) } : a))
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Agent autonomy levels, approval rules, system config</p>
        </div>
      </div>

      {/* Agent Autonomy */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">Agent Autonomy Levels</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Higher = more autonomous decisions</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {agentSettings.map(agent => (
            <div key={agent.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '12px',
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
            }}>
              <span style={{ fontSize: '24px', width: '32px' }}>{agent.emoji}</span>
              <div style={{ width: '100px' }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{agent.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{agent.role}</div>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="range" min="0" max="100" value={agent.autonomy}
                  onChange={e => updateAutonomy(agent.id, e.target.value)}
                  style={{ flex: 1, accentColor: agent.color }}
                />
                <span style={{ fontWeight: 700, fontSize: '14px', width: '45px', textAlign: 'right', color: agent.color }}>{agent.autonomy}%</span>
              </div>
              <span style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                background: agent.autonomy >= 80 ? 'rgba(34,197,94,0.1)' : agent.autonomy >= 40 ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
                color: agent.autonomy >= 80 ? '#22C55E' : agent.autonomy >= 40 ? '#EAB308' : '#EF4444',
              }}>
                {agent.autonomy >= 80 ? 'Full Auto' : agent.autonomy >= 40 ? 'Supervised' : 'Manual'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Approval Rules */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">What Sarthak Approves</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Everything else: agents decide autonomously</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { action: 'Sending any email', reason: 'Legal/brand protection', icon: '📧' },
            { action: 'Publishing any listing', reason: 'Quality control', icon: '📋' },
            { action: 'Deploying to client', reason: 'Final check', icon: '🚀' },
            { action: 'Creating accounts', reason: 'Can\'t create for you', icon: '🔐' },
            { action: 'Spend over $20', reason: 'Budget protection', icon: '💰' },
            { action: 'Receiving payments', reason: 'Money to your accounts only', icon: '🏦' },
          ].map(rule => (
            <div key={rule.action} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
            }}>
              <span style={{ fontSize: '18px' }}>{rule.icon}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{rule.action}</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rule.reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">System</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Dashboard</span><span>smvp-hq.vercel.app</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Backend</span><span>Supabase (SMVP HQ)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Repo</span><span>TheSolutionMVP/smvp-hq</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Stack</span><span>Next.js 16 + React 19 + Supabase</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ color: 'var(--text-muted)' }}>Budget ceiling</span><span>$100/mo new spend</span>
          </div>
        </div>
      </div>
    </div>
  )
}
