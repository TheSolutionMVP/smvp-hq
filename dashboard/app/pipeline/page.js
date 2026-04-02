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

export default function PipelinePage() {
  const [leads, setLeads] = useState([])
  const [pipeline, setPipeline] = useState([])
  const [view, setView] = useState('pipeline')

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('pipeline-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pipeline' }, fetchPipeline)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchLeads)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pipeline & Leads</h1>
        <p className="page-subtitle">Live from Supabase — lead tracking and deal pipeline</p>
      </div>

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
                </tr>
              </thead>
              <tbody>
                {pipeline.map(deal => (
                  <tr key={deal.id}>
                    <td><span className={`badge ${STAGE_COLORS[deal.stage] || 'badge-new'}`}>{deal.stage}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{deal.stream}</td>
                    <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>${deal.deal_value}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{deal.last_action || '—'}</td>
                    <td style={{ fontSize: '13px' }}>{deal.next_action || '—'}</td>
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
