'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { createLead, updateLead, deleteLead } from '../../lib/queries'

const EMPTY_LEAD = { business_name: '', industry: '', location: '', contact_name: '', contact_email: '', has_website: false, score: 0, status: 'new' }

export default function ClientsPage() {
  const [leads, setLeads] = useState([])
  const [view, setView] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [newLead, setNewLead] = useState({ ...EMPTY_LEAD })
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editStatus, setEditStatus] = useState('')

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

  async function handleCreateLead(e) {
    e.preventDefault()
    if (!newLead.business_name.trim()) return
    setSaving(true)
    const { data } = await createLead(newLead)
    if (data) {
      setLeads(prev => [data, ...prev])
    }
    setNewLead({ ...EMPTY_LEAD })
    setShowForm(false)
    setSaving(false)
  }

  async function handleUpdateStatus(id, newStatus) {
    const { data } = await updateLead(id, { status: newStatus })
    if (data) setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))
    setEditingId(null)
  }

  async function handleDelete(id) {
    const { error } = await deleteLead(id)
    if (!error) setLeads(prev => prev.filter(l => l.id !== id))
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
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Lead'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px', borderLeft: '3px solid var(--accent-blue)' }}>
          <div className="card-header"><h3 className="card-title">Add New Lead</h3></div>
          <form onSubmit={handleCreateLead} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Business Name *</label>
              <input className="form-input" placeholder="e.g. Joe's Pizza" value={newLead.business_name} onChange={e => setNewLead({ ...newLead, business_name: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Industry</label>
              <input className="form-input" placeholder="e.g. Restaurant" value={newLead.industry} onChange={e => setNewLead({ ...newLead, industry: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Location</label>
              <input className="form-input" placeholder="e.g. Newark, NJ" value={newLead.location} onChange={e => setNewLead({ ...newLead, location: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Contact Name</label>
              <input className="form-input" placeholder="e.g. Joe Smith" value={newLead.contact_name} onChange={e => setNewLead({ ...newLead, contact_name: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Contact Email</label>
              <input className="form-input" type="email" placeholder="e.g. joe@pizza.com" value={newLead.contact_email} onChange={e => setNewLead({ ...newLead, contact_email: e.target.value })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'end', gap: '12px' }}>
              <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={newLead.has_website} onChange={e => setNewLead({ ...newLead, has_website: e.target.checked })} />
                Has Website
              </label>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-skip" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Lead'}</button>
            </div>
          </form>
        </div>
      )}

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
                <th>Actions</th>
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
                  <td>
                    {editingId === lead.id ? (
                      <select className="form-input" style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
                        value={editStatus || lead.status}
                        onChange={e => { setEditStatus(e.target.value); handleUpdateStatus(lead.id, e.target.value) }}>
                        {['new', 'qualified', 'contacted', 'responded', 'closed', 'lost'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`badge badge-${lead.status || 'new'}`} style={{ cursor: 'pointer' }}
                        onClick={() => { setEditingId(lead.id); setEditStatus(lead.status) }}>
                        {lead.status || 'new'}
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, color: (lead.score || 0) >= 80 ? 'var(--accent-green)' : (lead.score || 0) >= 50 ? 'var(--accent-yellow)' : 'var(--text-muted)' }}>{lead.score || '—'}</td>
                  <td>
                    <button onClick={() => handleDelete(lead.id)} style={{
                      padding: '3px 8px', fontSize: '11px', border: '1px solid var(--border)', borderRadius: '4px',
                      background: 'transparent', color: 'var(--accent-red)', cursor: 'pointer',
                    }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
