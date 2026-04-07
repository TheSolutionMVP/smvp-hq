'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const STAGE_COLORS = {
  outreach: 'badge-new',
  responded: 'badge-responded',
  proposal: 'badge-contacted',
  negotiating: 'badge-qualified',
  closed: 'badge-closed',
}

const EMPTY_DEAL = { stage: 'outreach', stream: 'web-design', deal_value: '', last_action: '', next_action: '' }

export default function PipelinePage() {
  const [leads, setLeads] = useState([])
  const [pipeline, setPipeline] = useState([])
  const [view, setView] = useState('pipeline')
  const [showDealForm, setShowDealForm] = useState(false)
  const [newDeal, setNewDeal] = useState({ ...EMPTY_DEAL })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('pipeline-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pipeline' }, fetchPipeline)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchLeads)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function handleDeleteDeal(id) {
    try {
      await supabase.from('pipeline').delete().eq('id', id)
      setPipeline(prev => prev.filter(d => d.id !== id))
    } catch (e) { /* not connected */ }
  }

  async function handleUpdateStage(id, newStage) {
    try {
      await supabase.from('pipeline').update({ stage: newStage }).eq('id', id)
      setPipeline(prev => prev.map(d => d.id === id ? { ...d, stage: newStage } : d))
    } catch (e) { /* not connected */ }
  }

  async function fetchData() {
    await Promise.all([fetchLeads(), fetchPipeline()])
  }

  async function fetchLeads() {
    try {
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(50)
      setLeads(data || [])
    } catch (e) { /* not connected */ }
  }

  async function fetchPipeline() {
    try {
      const { data } = await supabase.from('pipeline').select('*').order('created_at', { ascending: false }).limit(50)
      setPipeline(data || [])
    } catch (e) { /* not connected */ }
  }

  async function handleCreateDeal(e) {
    e.preventDefault()
    if (!newDeal.deal_value) return
    setSaving(true)
    try {
      const { data } = await supabase.from('pipeline').insert({
        ...newDeal,
        deal_value: parseFloat(newDeal.deal_value),
      }).select()
      if (data?.[0]) setPipeline(prev => [data[0], ...prev])
    } catch (e) { /* not connected */ }
    setNewDeal({ ...EMPTY_DEAL })
    setShowDealForm(false)
    setSaving(false)
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Pipeline & Leads</h1>
          <p className="page-subtitle">Live from Supabase — lead tracking and deal pipeline</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowDealForm(!showDealForm)}>
          {showDealForm ? '✕ Cancel' : '+ New Deal'}
        </button>
      </div>

      {showDealForm && (
        <div className="card" style={{ marginBottom: '20px', borderLeft: '3px solid var(--accent-purple)' }}>
          <div className="card-header"><h3 className="card-title">Add New Deal</h3></div>
          <form onSubmit={handleCreateDeal} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Stage</label>
              <select className="form-input" value={newDeal.stage} onChange={e => setNewDeal({ ...newDeal, stage: e.target.value })}>
                <option value="outreach">Outreach</option>
                <option value="responded">Responded</option>
                <option value="proposal">Proposal</option>
                <option value="negotiating">Negotiating</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Stream</label>
              <select className="form-input" value={newDeal.stream} onChange={e => setNewDeal({ ...newDeal, stream: e.target.value })}>
                <option value="web-design">Web Design</option>
                <option value="etsy-digital">Etsy Digital</option>
                <option value="canva">Canva Templates</option>
                <option value="etsy-physical">Etsy Physical</option>
                <option value="tiktok">TikTok</option>
                <option value="consulting">Consulting</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Deal Value ($) *</label>
              <input className="form-input" type="number" placeholder="e.g. 1000" value={newDeal.deal_value} onChange={e => setNewDeal({ ...newDeal, deal_value: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Last Action</label>
              <input className="form-input" placeholder="e.g. Sent proposal" value={newDeal.last_action} onChange={e => setNewDeal({ ...newDeal, last_action: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Next Step</label>
              <input className="form-input" placeholder="e.g. Follow up Thursday" value={newDeal.next_action} onChange={e => setNewDeal({ ...newDeal, next_action: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-skip" onClick={() => setShowDealForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Deal'}</button>
            </div>
          </form>
        </div>
      )}

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          className={`btn ${view === 'pipeline' ? 'btn-primary' : 'btn-skip'}`}
          onClick={() => setView('pipeline')}
        >
          🔄 Pipeline
        </button>
        <button
          className={`btn ${view === 'leads' ? 'btn-primary' : 'btn-skip'}`}
          onClick={() => setView('leads')}
        >
          🔍 Leads
        </button>
      </div>

      {view === 'pipeline' ? (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Deal Pipeline</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pipeline.length} deals</span>
          </div>
          {pipeline.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔄</div>
              <p className="empty-state-text">No deals in pipeline yet. Activate Rex to start finding leads, then Ace will build the pipeline.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Stream</th>
                  <th>Deal Value</th>
                  <th>Last Action</th>
                  <th>Next Step</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pipeline.map(deal => (
                  <tr key={deal.id}>
                    <td>
                      <select className="form-input" style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
                        value={deal.stage} onChange={e => handleUpdateStage(deal.id, e.target.value)}>
                        {['outreach', 'responded', 'proposal', 'negotiating', 'closed', 'lost'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{deal.stream}</td>
                    <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>${deal.deal_value}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{deal.last_action || '—'}</td>
                    <td style={{ fontSize: '13px' }}>{deal.next_action || '—'}</td>
                    <td>
                      <button onClick={() => handleDeleteDeal(deal.id)} style={{
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
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Lead Database</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{leads.length} leads</span>
          </div>
          {leads.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p className="empty-state-text">No leads yet. Rex will populate this when activated.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Industry</th>
                  <th>Location</th>
                  <th>Has Website</th>
                  <th>Status</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td style={{ fontWeight: 500 }}>{lead.business_name}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{lead.industry || '—'}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{lead.location || '—'}</td>
                    <td>{lead.has_website ? '✅' : '❌'}</td>
                    <td><span className={`badge badge-${lead.status || 'new'}`}>{lead.status || 'new'}</span></td>
                    <td style={{ fontSize: '13px' }}>{lead.contact_found ? '📧' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
            }
