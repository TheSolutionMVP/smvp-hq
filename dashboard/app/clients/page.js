'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ClientsPage() {
  const [leads, setLeads] = useState([])
  const [view, setView] = useState('all')

  useEffect(() => {
    fetchLeads()
    const channel = supabase
      .channel('leads-clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchLeads)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchLeads() {
    try {
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
      setLeads(data || [])
    } catch (e) { /* not connected */ }
  }

  const prospects = leads.filter(l => ['new', 'qualified'].includes(l.status))
  const contacted = leads.filter(l => l.status === 'contacted')
  const responded = leads.filter(l => l.status === 'responded')
  const closed = leads.filter(l => l.status === 'closed')

  const filtered = view === 'all' ? leads
    : view === 'prospects' ? prospects
    : view === 'active' ? [...contacted, ...responded]
    : closed

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Clients & Prospects</h1>
          <p className="page-subtitle">Full lifecycle — prospect to active client to retained</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Leads</div>
          <div className="stat-value blue">{leads.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Prospects</div>
          <div className="stat-value yellow">{prospects.length}</div>
          <div className="stat-change">New + Qualified</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Outreach</div>
          <div className="stat-value green">{contacted.length + responded.length}</div>
          <div className="stat-change">Contacted + Responded</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Closed Deals</div>
          <div className="stat-value purple">{closed.length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'all', label: 'All', count: leads.length },
          { id: 'prospects', label: 'Prospects', count: prospects.length },
          { id: 'active', label: 'In Outreach', count: contacted.length + responded.length },
          { id: 'closed', label: 'Closed', count: closed.length },
        ].map(f => (
          <button key={f.id} className={`btn ${view === f.id ? 'btn-primary' : 'btn-skip'}`} onClick={() => setView(f.id)}>
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p className="empty-state-text">No leads yet. Activate Rex to start prospecting.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Website</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id}>
                  <td style={{ fontWeight: 600 }}>{lead.business_name}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{lead.industry || '—'}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{lead.location || '—'}</td>
                  <td>{lead.has_website ? <span style={{ color: 'var(--accent-green)' }}>Yes</span> : <span style={{ color: 'var(--accent-red)' }}>No</span>}</td>
                  <td style={{ fontSize: '13px' }}>{lead.contact_name || '—'}</td>
                  <td><span className={`badge badge-${lead.status || 'new'}`}>{lead.status || 'new'}</span></td>
                  <td style={{ fontWeight: 600, color: (lead.score || 0) >= 80 ? 'var(--accent-green)' : (lead.score || 0) >= 50 ? 'var(--accent-yellow)' : 'var(--text-muted)' }}>{lead.score || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
