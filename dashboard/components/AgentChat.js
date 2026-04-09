'use client'
import { useState, useRef, useEffect } from 'react'

export default function AgentChat({ agent }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEnd = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          message: userMsg.content,
          history: messages,
        }),
      })

      const data = await res.json()
      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }])
      } else {
        // Show actions the agent took
        if (data.actions?.length) {
          const actionSummary = data.actions.map(a => `⚡ ${a.result}`).join('\n')
          setMessages(prev => [...prev, { role: 'action', content: actionSummary }])
        }
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Connection error: ${err.message}` }])
    }

    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '500px',
      border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      background: 'var(--bg-primary)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
      }}>
        <span style={{ fontSize: '20px' }}>{agent.emoji}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>Chat with {agent.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{agent.role} — ask anything, assign tasks, get advice</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '60px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{agent.emoji}</div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{agent.name} is ready</div>
            <div>Ask a question, assign a task, or get advice</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : msg.role === 'action' ? 'center' : 'flex-start',
          }}>
            {msg.role === 'action' ? (
              <div style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '11px', lineHeight: '1.5',
                background: '#22C55E10', border: '1px solid #22C55E30', color: '#22C55E',
                fontWeight: 600, whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            ) : (
              <>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.5px' }}>
                  {msg.role === 'user' ? 'SARTHAK' : agent.name.toUpperCase()}
                </div>
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', lineHeight: '1.5',
                  background: msg.role === 'user' ? agent.color + '15' : 'var(--bg-secondary)',
                  border: msg.role === 'user' ? `1px solid ${agent.color}30` : '1px solid var(--border)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
            <span style={{ fontSize: '16px' }}>{agent.emoji}</span>
            <span>{agent.name} is thinking...</span>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} style={{
        padding: '12px 16px', borderTop: '1px solid var(--border)',
        display: 'flex', gap: '8px', flexShrink: 0,
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Talk to ${agent.name}...`}
          disabled={loading}
          style={{
            flex: 1, padding: '10px 14px', fontSize: '13px',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 20px', fontSize: '13px', fontWeight: 600,
            border: 'none', borderRadius: 'var(--radius-md)',
            background: agent.color, color: '#fff', cursor: 'pointer',
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </form>
    </div>
  )
}
