'use client'
import './globals.css'
import { useState, useEffect } from 'react'
import { AGENTS, TIERS } from '../lib/agents'

const NAV_ITEMS = [
  { id: 'home', label: 'Dashboard', icon: '◻', href: '/' },
  { id: 'agents', label: 'Agents', icon: '⬡', href: '/agents', hasSubmenu: true },
  { id: 'projects', label: 'Projects', icon: '▦', href: '/projects' },
  { id: 'clients', label: 'Clients', icon: '◉', href: '/clients' },
  { id: 'content', label: 'Content', icon: '▤', href: '/content' },
  { id: 'stores', label: 'Stores', icon: '◈', href: '/stores' },
  { id: 'finance', label: 'Finance', icon: '◇', href: '/finance' },
  { id: 'settings', label: 'Settings', icon: '⚙', href: '/settings' },
]

export default function RootLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState(null)
  const [pendingApprovals] = useState(0)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const saved = localStorage.getItem('smvp-theme')
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('smvp-theme', next)
  }

  function handleNavClick(item) {
    if (item.hasSubmenu) {
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id)
    } else {
      setActiveSubmenu(null)
    }
  }

  return (
    <html lang="en">
      <head>
        <title>SMVP HQ — Auto-Office Command Center</title>
        <meta name="description" content="The Solution MVP operations dashboard" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className={`app-container ${collapsed ? 'collapsed' : ''}`}>
          {/* Sidebar */}
          <nav className="sidebar">
            <div className="sidebar-header">
              <div className="sidebar-brand">
                <div className="brand-icon">S</div>
                <span className="brand-text">SMVP HQ</span>
              </div>
              <button className="collapse-btn" onClick={() => { setCollapsed(!collapsed); setActiveSubmenu(null); }} title={collapsed ? 'Expand' : 'Collapse'}>
                {collapsed ? '▶' : '◀'}
              </button>
            </div>

            <div className="nav-section">
              <div className="nav-group">
                <div className="nav-group-label">Menu</div>
                {NAV_ITEMS.map(item => (
                  <a
                    key={item.id}
                    href={item.hasSubmenu ? undefined : item.href}
                    className={`nav-link ${activeSubmenu === item.id ? 'active' : ''}`}
                    onClick={(e) => {
                      if (item.hasSubmenu) { e.preventDefault(); handleNavClick(item); }
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {item.hasSubmenu && <span className={`nav-arrow ${activeSubmenu === item.id ? 'open' : ''}`}>▸</span>}
                  </a>
                ))}
              </div>
            </div>

            <div className="sidebar-footer">
              <div className="user-badge">
                <div className="user-avatar">SV</div>
                <div className="user-info">
                  <span className="user-name">Sarthak Varma</span>
                  <span className="user-role">CEO</span>
                </div>
                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' })
                    window.location.href = '/login'
                  }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '12px', padding: '4px 8px',
                    borderRadius: '4px', marginLeft: 'auto',
                  }}
                  title="Sign out"
                >
                  ↪ Out
                </button>
              </div>
            </div>
          </nav>

          {/* Sub-sidebar for Agents */}
          <div className={`sub-sidebar ${activeSubmenu === 'agents' ? 'open' : ''}`}>
            <div className="sub-sidebar-header">
              <span>Agents</span>
              <button className="sub-sidebar-close" onClick={() => setActiveSubmenu(null)}>✕</button>
            </div>
            <div className="sub-nav-links">
              <a href="/agents" className="sub-nav-link">
                <span className="nav-icon">▦</span>
                <span>All Agents</span>
              </a>
              {Object.entries(TIERS).map(([key, tier]) => (
                <div key={key}>
                  <div className="nav-group-label" style={{ marginTop: '12px' }}>{tier.label}</div>
                  {AGENTS.filter(a => a.tier === key).map(agent => (
                    <a key={agent.id} href={`/agents/${agent.id}`} className="sub-nav-link">
                      <span className="sub-nav-dot" style={{ background: agent.color }}></span>
                      <span>{agent.name}</span>
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Top Bar */}
          <div className="topbar">
            <div className="topbar-left">
              <span className="topbar-title">Auto-Office Command Center</span>
            </div>
            <div className="topbar-right">
              <button className="theme-toggle" onClick={toggleTheme} title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                {theme === 'light' ? '◑' : '◐'}
              </button>
              <div className="approval-badge">
                Approvals <span className="approval-count">{pendingApprovals}</span>
              </div>
              <button className="btn-pause-all">⏸ Pause All</button>
              <button className="btn-abort">⏹ ABORT ALL</button>
            </div>
          </div>

          {/* Main Content */}
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
