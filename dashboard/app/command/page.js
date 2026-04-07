'use client'
import { useState } from 'react'

const QUICK_COMMANDS = [
  { label: 'Activate Rex', desc: 'Start a lead generation sweep', agent: 'rex', icon: '🔍' },
  { label: 'Activate Ace', desc: 'Draft outreach for top leads', agent: 'ace', icon: '🤝' },
  { label: 'Activate Pixel', desc: 'Build a demo site or product', agent: 'pixel', icon: '🎨' },
  { label: 'Activate Nova', desc: 'Write listings or marketing copy', agent: 'nova', icon: '✍️' },
  { label: 'Run Weekly Report', desc: 'Dash pulls all data and emails brief', agent: 'dash', icon: '📈' },
  { label: 'Deploy to Vercel', desc: 'Flux pushes latest code live', agent: 'flux', icon: '⚙️' },
  { label: 'Activate Atlas', desc: 'Draft contract or invoice for a client', agent: 'atlas', icon: '📋' },
]

const RECENT_COMMANDS = []

export default function CommandPage() {
  const [input, setInput] = useState('')
  const [commandLog, setCommandLog] = useState(RECENT_COMMANDS)

  function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim()) return

    const newCommand = {
      text: input,
      timestamp: new Date().toLocaleTimeString(),
      status: 'sent',
    }
    setCommandLog([newCommand, ...commandLog])
    setInput('')
  }

  function handleQuickCommand(cmd) {
    const newCommand = {
      text: `@${cmd.agent} — ${cmd.desc}`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'sent',
    }
    setCommandLog([newCommand, ...commandLog])
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Command Center</h1>
        <p className="page-subtitle">Direct any agent — type a command or use quick actions</p>
      </div>

      {/* Command Input */}
      <form onSubmit={handleSubmit}>
        <div className="command-input-wrapper">
          <span className="command-prefix">→</span>
          <input
            className="command-input"
            type="text"
            placeholder="Tell an agent what to do... e.g. 'Rex, find 10 restaurants in Newark NJ without websites'"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>
      </form>

      {/* Quick Commands */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">⚡ Quick Commands</h3>
        </div>
        <div className="grid-3">
          {QUICK_COMMANDS.map(cmd => (
            <div
              key={cmd.label}
              style={{
                padding: '16px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => handleQuickCommand(cmd)}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent-purple)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{cmd.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{cmd.label}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cmd.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Command Log */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 Command Log</h3>
        </div>
        {commandLog.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <p className="empty-state-text">No commands sent yet. Use the input above or quick commands to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {commandLog.map((cmd, i) => (
              <div key={i} style={{
                padding: '12px 16px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '14px' }}>{cmd.text}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cmd.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
          }
