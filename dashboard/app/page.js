'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AGENTS = [
  { name: 'Rex', emoji: '🔍', role: 'Research & Prospecting', status: 'idle' },
  { name: 'Pixel', emoji: '🎨', role: 'Product Designer', status: 'idle' },
  { name: 'Nova', emoji: '✍️', role: 'Content & Marketing', status: 'idle' },
  { name: 'Ace', emoji: '🤝', role: 'Sales & Outreach', status: 'idle' },
  { name: 'Flux', emoji: '⚙️', role: 'Operations & Delivery', status: 'idle' },
  { name: 'Dash', emoji: '📈', role: 'Analytics & Growth', status: 'idle' },
]

const MOCK_REVENUE = [
  { month: 'Jan', amount: 0 },
  { month: 'Feb', amount: 0 },
  { month: 'Mar', amount: 0 },
  { month: 'Apr', amount: 0 },
]

export default function Dashboard() {
  const [approvalQueue, setApprovalQueue] = useState([])
  const [stats, setStats] = useState({ leads: 0, pipeline: 0, revenue: 0, deliverables: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()

    // Real-time subscription for approval queue
    const channel = supabase
      .channel('approval-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approval_queue' }, () => {
        fetchApprovalQueue()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchData() {
    setLoading(false)
    await Promise.all([fetchStats(), fetchApprovalQueue()])
  }

  async function fetchStats() {
    try {
      const [leads, pipeline, revenue, deliverables] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('pipeline').select('id', { count: 'exact', head: true }),
        supabase.from('revenue').select('amount'),
        supabase.from('deliverables').select('id', { count: 'exact', head: true }),
      ])

      const totalRevenue = revenue.data?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0

      setStats({
        leads: leads.count || 0,
        pipeline: pipeline.count || 0,
        revenue: totalRevenue,
        deliverables: deliverables.count || 0,
      })
    } catch (e) {
      // Supabase not connected yet — show zeros
    }
  }

  async function fetchApprovalQueue() {
    try {
      const { data } = await supabase
        .from('approval_queue')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10)
      setApprovalQueue(data || [])
    } catch (e) {
      // Supabase not connected yet
    }
  }

  async function handleApproval(id, status) {
    await supabase
      .from('approval_queue')
      .update({
        status,
        [status === 'approved' ? 'approved_at' : 'executed_at']: new Date().toISOString()
      })
      .eq('id', id)
    fetchApprovalQueue()
  }

  const maxRevenue = Math.max(...MOCK_REVENUE.map(r => r.amount), 1)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Command Center</h1>
        <p className="page-subtitle">SMVP Auto-Office — real-time business overview</p>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Leads</div>
          <div className="stat-value purple">{stats.leads}</div>
          <div className="stat-change up">Ready for outreach</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Pipeline</div>
          <div className="stat-value blue">{stats.pipeline}</div>
          <div className="stat-change">Deals in progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Revenue MTD</div>
          <div className="stat-value lime">${stats.revenue.toLocaleString()}</div>
          <div className="stat-change up">Month to date</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Deliverables</div>
          <div className="stat-value green">{stats.deliverables}</div>
          <div className="stat-change">Completed items</div>
        </div>
      </div>

      {/* Agent Status */}
      <div className="agent-grid">
        {AGENTS.map(agent => (
          <div className="agent-card" key={agent.name}>
            <div className="agent-header">
              <div className="agent-emoji">{agent.emoji}</div>
              <div>
                <div className="agent-name">{agent.name}</div>
                <div className="agent-role">{agent.role}</div>
              </div>
            </div>
            <span className={`agent-status ${agent.status}`}>
              <span className="status-dot"></span>
              {agent.status === 'active' ? 'Working' : agent.status === 'pending' ? 'Waiting' : 'Idle'}
            </span>
          </div>
        ))}
      </div>

      {/* Two Column: Approval Queue + Revenue */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚡ Approval Queue</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {approvalQueue.length} pending
            </span>
          </div>
          {approvalQueue.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <p className="empty-state-text">No pending approvals — you're all clear</p>
            </div>
          ) : (
            <div className="approval-list">
              {approvalQueue.map(item => (
                <div className="approval-item" key={item.id}>
                  <div className="approval-info">
                    <span className="approval-agent">{item.agent}</span>
                    <div>
                      <div className="approval-title">{item.title}</div>
                      <div className="approval-desc">{item.description}</div>
                    </div>
                  </div>
                  <div className="approval-actions">
                    <button className="btn btn-approve" onClick={() => handleApproval(item.id, 'approved')}>
                      ✓ Approve
                    </button>
                    <button className="btn btn-skip" onClick={() => handleApproval(item.id, 'skipped')}>
                      Skip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">💰 Revenue</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Monthly</span>
          </div>
          <div className="chart-container">
            {MOCK_REVENUE.map((item, i) => (
              <div
                key={i}
                className="chart-bar"
                style={{ height: `${Math.max((item.amount / maxRevenue) * 100, 8)}%` }}
              >
                <span className="chart-bar-label">{item.month}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
            Revenue chart will populate as streams activate
          </div>
        </div>
      </div>
    </div>
  )
        }
