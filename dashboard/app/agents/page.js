'use client'
import { useState } from 'react'

const AGENTS = [
  {
    name: 'Rex',
    emoji: '🔍',
    role: 'Research & Prospecting',
    status: 'idle',
    color: '#3B82F6',
    description: 'Finds money-making opportunities — local businesses without websites, Etsy niches, competitor pricing.',
    tasks: ['Lead scraping', 'Niche validation', 'Competitor research', 'Lead scoring'],
    handoff: 'Ace (Sales)',
    promptFile: 'agents/rex.md',
  },
  {
    name: 'Pixel',
    emoji: '🎨',
    role: 'Product Designer',
    status: 'idle',
    color: '#EC4899',
    description: 'Builds everything visual — client websites, Etsy graphics, Canva templates, mockups.',
    tasks: ['Website builds', 'Etsy designs', 'Canva templates', 'Image prompts'],
    handoff: 'Flux (Ops)',
    promptFile: 'agents/pixel.md',
  },
  {
    name: 'Nova',
    emoji: '✍️',
    role: 'Content & Marketing',
    status: 'idle',
    color: '#F59E0B',
    description: 'Writes everything customers see — listings, emails, scripts, social posts, pitch decks.',
    tasks: ['SEO listings', 'TikTok scripts', 'Email sequences', 'Social captions'],
    handoff: 'Flux (Log) / Ace (Send)',
    promptFile: 'agents/nova.md',
  },
  {
    name: 'Ace',
    emoji: '🤝',
    role: 'Sales & Outreach',
    status: 'idle',
    color: '#10B981',
    description: 'Turns leads into paying clients. Cold emails, follow-ups, proposals, deal tracking.',
    tasks: ['Cold emails', 'Follow-up sequences', 'Proposals', 'Pipeline management'],
    handoff: 'Pixel (Build)',
    promptFile: 'agents/ace.md',
  },
  {
    name: 'Flux',
    emoji: '⚙️',
    role: 'Operations & Delivery',
    status: 'idle',
    color: '#8B5CF6',
    description: 'Runs the infrastructure. Deploys sites, manages Supabase, pushes code, logs everything.',
    tasks: ['Vercel deploys', 'GitHub pushes', 'Supabase records', 'Delivery tracking'],
    handoff: 'Dash (Revenue)',
    promptFile: 'agents/flux.md',
  },
  {
    name: 'Dash',
    emoji: '📈',
    role: 'Analytics & Growth',
    status: 'idle',
    color: '#C8F04E',
    description: 'The advisor. Weekly reports, revenue tracking, stream activation recommendations.',
    tasks: ['Weekly briefs', 'Revenue reports', 'Stream monitoring', 'Growth recommendations'],
    handoff: 'Routes to correct agent',
    promptFile: 'agents/dash.md',
  },
]

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [copiedAgent, setCopiedAgent] = useState(null)

  function handleCopyPrompt(agent) {
    // In production, this would fetch the .md file content
    setCopiedAgent(agent.name)
    setTimeout(() => setCopiedAgent(null), 2000)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Agent Squad</h1>
        <p className="page-subtitle">6 AI agents — each with a defined role, toolset, and handoff protocol</p>
      </div>

      <div className="grid-2" style={{ gap: '20px' }}>
        {AGENTS.map(agent => (
          <div
            key={agent.name}
            className="card"
            style={{
              cursor: 'pointer',
              borderColor: selectedAgent === agent.name ? agent.color : undefined,
              boxShadow: selectedAgent === agent.name ? `0 0 20px ${agent.color}22` : undefined,
            }}
            onClick={() => setSelectedAgent(selectedAgent === agent.name ? null : agent.name)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="agent-header">
                <div className="agent-emoji" style={{ fontSize: '32px', width: '52px', height: '52px' }}>
                  {agent.emoji}
                </div>
                <div>
                  <div className="agent-name" style={{ fontSize: '20px' }}>{agent.name}</div>
                  <div className="agent-role">{agent.role}</div>
                </div>
              </div>
              <span className={`agent-status ${agent.status}`}>
                <span className="status-dot"></span>
                {agent.status === 'active' ? 'Working' : 'Idle'}
              </span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '16px 0', lineHeight: '1.6' }}>
              {agent.description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {agent.tasks.map(task => (
                <span key={task} style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: `${agent.color}18`,
                  color: agent.color,
                  fontWeight: 500,
                }}>
                  {task}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Handoff → <strong style={{ color: 'var(--text-secondary)' }}>{agent.handoff}</strong>
              </span>
              <button
                className="btn btn-skip"
                style={{ fontSize: '11px', padding: '5px 12px' }}
                onClick={(e) => { e.stopPropagation(); handleCopyPrompt(agent) }}
              >
                {copiedAgent === agent.name ? '✓ Copied!' : '📋 Copy Prompt'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
                  }
