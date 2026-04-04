'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const STORES = [
  { id: 'etsy', name: 'Etsy Store', icon: '🛍️', desc: 'Digital products + print-on-demand', streams: ['etsy-digital', 'etsy-physical'] },
  { id: 'canva', name: 'Canva Creator', icon: '🎨', desc: 'Template packs — social media, pitch decks, resumes', streams: ['canva'] },
  { id: 'tiktok', name: 'TikTok Shop', icon: '📱', desc: 'Trending merch + affiliate products', streams: ['tiktok'] },
]

export default function StoresPage() {
  const [deliverables, setDeliverables] = useState([])
  const [revenue, setRevenue] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [{ data: d }, { data: r }] = await Promise.all([
        supabase.from('deliverables').select('*').in('deliverable_type', ['etsy-listing', 'canva-template', 'print-product']).order('created_at', { ascending: false }),
        supabase.from('revenue').select('*').in('source', ['etsy-digital', 'etsy-physical', 'canva', 'tiktok']).order('transaction_date', { ascending: false }),
      ])
      setDeliverables(d || [])
      setRevenue(r || [])
    } catch (e) { /* not connected */ }
  }

  function getStoreRevenue(streams) {
    return revenue.filter(r => streams.includes(r.source)).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  }

  function getStoreProducts(streams) {
    return deliverables.filter(d => {
      if (streams.includes('etsy-digital') && d.deliverable_type === 'etsy-listing') return true
      if (streams.includes('canva') && d.deliverable_type === 'canva-template') return true
      if (streams.includes('etsy-physical') && d.deliverable_type === 'print-product') return true
      return false
    })
  }

  const totalStoreRevenue = revenue.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  const totalProducts = deliverables.length

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Stores</h1>
          <p className="page-subtitle">Etsy, Canva Creator, TikTok Shop — product inventory and sales</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Store Revenue</div>
          <div className="stat-value green">${totalStoreRevenue.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value blue">{totalProducts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Stores</div>
          <div className="stat-value purple">{STORES.filter(s => getStoreRevenue(s.streams) > 0 || getStoreProducts(s.streams).length > 0).length || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Listings</div>
          <div className="stat-value yellow">{deliverables.filter(d => d.status === 'ready').length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {STORES.map(store => {
          const storeRev = getStoreRevenue(store.streams)
          const products = getStoreProducts(store.streams)
          return (
            <div key={store.id} className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '28px' }}>{store.icon}</span>
                  <div>
                    <h3 className="card-title" style={{ margin: 0 }}>{store.name}</h3>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{store.desc}</span>
                  </div>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700, color: storeRev > 0 ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                  ${storeRev.toLocaleString()}
                </span>
              </div>

              {products.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No products yet. Pixel creates them, Nova writes the listings, Shelf manages the store.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Live URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.client_name || 'Untitled'}</td>
                        <td style={{ fontSize: '13px' }}>{p.deliverable_type}</td>
                        <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                        <td>{p.live_url ? <a href={p.live_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', fontSize: '13px' }}>View</a> : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
