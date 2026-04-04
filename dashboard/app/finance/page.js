'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const STREAM_LABELS = {
  'web-design': { name: 'Web Design', icon: '🌐', color: '#2563EB' },
  'etsy-digital': { name: 'Etsy Digital', icon: '📦', color: '#22C55E' },
  'canva': { name: 'Canva Templates', icon: '🎨', color: '#EC4899' },
  'etsy-physical': { name: 'Etsy Physical', icon: '👕', color: '#F59E0B' },
  'tiktok': { name: 'TikTok', icon: '📱', color: '#7C3AED' },
  'direct': { name: 'Direct', icon: '💰', color: '#06B6D4' },
}

export default function FinancePage() {
  const [revenue, setRevenue] = useState([])
  const [period, setPeriod] = useState('all')

  useEffect(() => {
    fetchRevenue()
    const channel = supabase
      .channel('revenue-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'revenue' }, fetchRevenue)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchRevenue() {
    try {
      const { data } = await supabase.from('revenue').select('*').order('transaction_date', { ascending: false })
      setRevenue(data || [])
    } catch (e) { /* not connected */ }
  }

  const now = new Date()
  const filtered = period === 'all' ? revenue
    : period === 'month' ? revenue.filter(r => {
        const d = new Date(r.transaction_date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    : revenue.filter(r => {
        const d = new Date(r.transaction_date)
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
        return d >= weekAgo
      })

  const total = filtered.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  const byStream = {}
  filtered.forEach(r => {
    const src = r.source || 'direct'
    byStream[src] = (byStream[src] || 0) + (parseFloat(r.amount) || 0)
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Finance & Revenue</h1>
          <p className="page-subtitle">Track every dollar — by stream, by client, by date</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value green">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Transactions</div>
          <div className="stat-value blue">{filtered.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Streams</div>
          <div className="stat-value purple">{Object.keys(byStream).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Deal Size</div>
          <div className="stat-value yellow">${filtered.length > 0 ? (total / filtered.length).toFixed(0) : '0'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'all', label: 'All Time' },
          { id: 'month', label: 'This Month' },
          { id: 'week', label: 'This Week' },
        ].map(p => (
          <button key={p.id} className={`btn ${period === p.id ? 'btn-primary' : 'btn-skip'}`} onClick={() => setPeriod(p.id)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Revenue by Stream */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">Revenue by Stream</h3>
        </div>
        {Object.keys(byStream).length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <p className="empty-state-text">No revenue recorded yet. Close your first deal and it appears here automatically.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(byStream).sort((a, b) => b[1] - a[1]).map(([stream, amount]) => {
              const info = STREAM_LABELS[stream] || { name: stream, icon: '💵', color: '#94A3B8' }
              const pct = total > 0 ? (amount / total) * 100 : 0
              return (
                <div key={stream} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px', width: '32px' }}>{info.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{info.name}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: info.color }}>${amount.toLocaleString()}</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: info.color, borderRadius: '3px' }}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Transaction Log */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Transaction Log</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{filtered.length} records</span>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p className="empty-state-text">No transactions yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Stream</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Platform</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontSize: '13px' }}>{new Date(r.transaction_date).toLocaleDateString()}</td>
                  <td><span style={{ fontSize: '13px' }}>{(STREAM_LABELS[r.source] || {}).icon || '💵'} {(STREAM_LABELS[r.source] || {}).name || r.source}</span></td>
                  <td style={{ fontWeight: 500 }}>{r.client_name || '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-green)' }}>${parseFloat(r.amount).toLocaleString()}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{r.platform || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
