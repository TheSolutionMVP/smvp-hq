import './globals.css'

export const metadata = {
  title: 'SMVP HQ — Auto-Office Command Center',
  description: 'The Solution MVP operations dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="app-container">
          <nav className="sidebar">
            <div className="sidebar-logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">SMVP HQ</span>
            </div>
            <div className="nav-links">
              <a href="/" className="nav-link">
                <span className="nav-icon">📊</span>
                <span>Dashboard</span>
              </a>
              <a href="/agents" className="nav-link">
                <span className="nav-icon">🤖</span>
                <span>Agents</span>
              </a>
              <a href="/pipeline" className="nav-link">
                <span className="nav-icon">🔄</span>
                <span>Pipeline</span>
              </a>
              <a href="/streams" className="nav-link">
                <span className="nav-icon">💰</span>
                <span>Streams</span>
              </a>
              <a href="/command" className="nav-link">
                <span className="nav-icon">🎯</span>
                <span>Command</span>
              </a>
            </div>
            <div className="sidebar-footer">
              <div className="user-badge">
                <div className="user-avatar">SV</div>
                <div className="user-info">
                  <span className="user-name">Sarthak Varma</span>
                  <span className="user-role">CEO</span>
                </div>
              </div>
            </div>
          </nav>
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
