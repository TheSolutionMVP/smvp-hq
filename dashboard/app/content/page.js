'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ContentPage() {
  const [approvals, setApprovals] = useState([])

  useEffect(() => {
    fetchContent()
    const channel = supabase
      .channel('content-approvals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approval_queue' }, fetchContent)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchContent() {
    try {
      const { data } = await supabase.from('approval_queue').select('*')
        .in('type', ['publish-listing', 'publish-content', 'publish-post'])
        .order('created_at', { ascending: false })
      setApprovals(data || [])
    } catch (e) { /* not connected */ }
  }

  async function handleApprove(id) {
    await supabase.from('approval_queue').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id)
    fetchContent()
  }

  async function handleSkip(id) {
    await supabase.from('approval_queue').update({ status: 'skipped' }).eq('id', id)
    fetchContent()
  }

  const pending = approvals.filter(a => a.status === 'pending')
  const published = approvals.filter(a => a.status === 'approved' || a.status === 'executed')

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Content</h1>
          <p className="page-subtitle">Blog posts, social media, listings — Nova writes it, you approve it</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value yellow">{pending.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Published</div>
          <div className="stat-value green">{published.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Content</div>
          <div className="stat-value blue">{approvals.length}</div>
        </div>
      </div>

      {/* Pending Content */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">Pending Approval</h3>
          <span style={{ fontSize: '12px', color: 'var(--accent-yellow)', fontWeight: 600 }}>{pending.length} waiting</span>
        </div>
        {pending.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✍️</div>
            <p className="empty-state-text">No content waiting for approval. Nova and Echo will queue items here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pending.map(item => (
              <div key={item.id} style={{
                padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--accent-yellow)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{item.description}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Agent: {item.agent} | Type: {item.type}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleApprove(item.id)} style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 600, border: 'none', borderRadius: '6px', background: '#22C55E', color: '#fff', cursor: 'pointer' }}>Approve</button>
                    <button onClick={() => handleSkip(item.id)} style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 600, border: '1px solid var(--border)', borderRadius: '6px', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>Skip</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Published */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Published</h3>
        </div>
        {published.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No published content yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {published.map(item => (
              <div key={item.id} style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '14px' }}>{item.title}</span>
                <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>Published</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
