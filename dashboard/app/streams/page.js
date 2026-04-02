'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const STREAMS = [
  {
    number: '01',
    name: 'Web Design',
    desc: 'Local business websites — $500–$1,500 per build',
    status: 'active',
    target: 500,
    icon: '🌐',
  },
  {
    number: '02',
    name: 'Etsy Digital',
    desc: 'Digital product listings — planners, templates, printables',
    status: 'active',
    target: 500,
    icon: '📦',
  },
  {
    number: '03',
    name: 'Canva Templates',
    desc: 'Social media kits, pitch decks, resume packs',
    status: 'locked',
    target: 500,
    unlockCondition: 'Stream 2 hits $500/mo',
    icon: '🎨',
  },
  {
    number: '04',
    name: 'Etsy Physical',
    desc: 'Print-on-demand via Printify — mugs, shirts, totes',
    status: 'locked',
    target: 500,
    unlockCondition: 'Stream 3 hits $500/mo',
    icon: '👕',
  },
  {
    number: '05',
    name: 'TikTok Affiliate',
    desc: 'Video content + affiliate links — passive income at scale',
    status: 'locked',
    target: 500,
    unlockCondition: 'Stream 4 hits $500/mo',
    icon: '📱',
  },
]

export default function StreamsPage() {
  const [revenue, setRevenue] = useState({})

  useEffect(() => {
    fetchRevenue()
  }, [])

  async function fetchRevenue() {
    try {
      const { data } = await supabase.from('revenue').select('source, amount')
      if (data) {
        const bySource = {}
        data.forEach(r => {
          const src = r.source || 'other'
          bySource[src] = (bySource[src] || 0) + r.amount
        })
        setRevenue(bySource)
      }
    } catch (e) { /* not connected */ }
  }

  const streamKeyMap = {
    '01': 'web-design',
    '02': 'etsy-digital',
    '03': 'canva',
    '04': 'etsy-physical',
    '05': 'tiktok',
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Revenue Streams</h1>
        <p className="page-subtitle">5 streams activate in sequence — each one unlocks the next at $500/mo</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {STREAMS.map(stream => {
          const streamRevenue = revenue[streamKeyMap[stream.number]] || 0
          const progress = Math.min((streamRevenue / stream.target) * 100, 100)

          return (
            <div key={stream.number} className={`stream-card ${stream.status === 'active' ? 'active' : ''}`}>
              <span className="stream-number">{stream.number}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <span style={{ fontSize: '28px' }}>{stream.icon}</span>
                <div>
                  <div className="stream-name">{stream.name}</div>
                  <div className="stream-desc">{stream.desc}</div>
                </div>
              </div>

              {stream.status === 'active' ? (
                <>
                  <div className="stream-progress">
                    <div className="stream-progress-bar" style={{ width: `${Math.max(progress, 2)}%` }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="stream-revenue">$${streamRevenue.toLocaleString()}</span>
                    <span className="stream-target">/ $${stream.target}/mo target</span>
                  </div>
                </>
              ) : (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 16px',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  🔒 Unlocks when: {stream.unlockCondition}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
