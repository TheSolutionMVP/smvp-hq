'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ProjectsPage() {
  const [deliverables, setDeliverables] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchDeliverables()
    const channel = supabase
      .channel('deliverables-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliverables' }, fetchDeliverables)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchDeliverables() {
    try {
      const { data } = await supabase.from('deliverables').select('*').order('created_at', { ascending: false })
      setDeliverables(data || [])
    } catch (e) { /* not connected */ }
  }

  const filtered = filter === 'all' ? deliverables : deliverables.filter(d => d.status === filter)
  const counts = {
    all: deliverables.length,
    'in-progress': deliverables.filter(d => d.status === 'in-progress').length,
    ready: deliverables.filter(d => d.status === 'ready').length,
    delivered: deliverables.filter(d => d.status === 'delivered').length,
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Projects & Deliverables</h1>
          <p className="page-subtitle">Track every build — websites, products, assets</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Projects</div>
          <div className="stat-value blue">{counts.all}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value yellow">{counts['in-progress']}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ready for Review</div>
          <div className="stat-value green">{counts.ready}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Delivered</div>
          <div className="stat-value purple">{counts.delivered}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'in-progress', 'ready', 'delivered'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-skip'}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f] || 0})
          </button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏗️</div>
            <p className="empty-state-text">
              {deliverables.length === 0
                ? 'No projects yet. When Pixel builds a site or product, it shows up here.'
                : `No ${filter} projects.`}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Type</th>
                <th>Status</th>
                <th>GitHub</th>
                <th>Live URL</th>
                <th>Delivered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 500 }}>{d.client_name || '—'}</td>
                  <td><span className={`badge badge-${d.deliverable_type || 'new'}`}>{d.deliverable_type || '—'}</span></td>
                  <td><span className={`badge badge-${d.status || 'new'}`}>{d.status || '—'}</span></td>
                  <td style={{ fontSize: '13px' }}>{d.github_path ? <a href={`https://github.com/TheSolutionMVP/smvp-hq/tree/main/${d.github_path}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)' }}>View Code</a> : '—'}</td>
                  <td style={{ fontSize: '13px' }}>{d.live_url ? <a href={d.live_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-green)' }}>Live</a> : '—'}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.delivered_date ? new Date(d.delivered_date).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
