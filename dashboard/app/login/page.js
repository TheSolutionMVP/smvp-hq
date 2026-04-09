'use client'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/check')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) window.location.href = '/'
        else setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.success) {
        window.location.href = '/'
      } else {
        setError('Invalid email or password')
      }
    } catch {
      setError('Something went wrong. Try again.')
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f172a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '32px', height: '32px', border: '3px solid #3b82f6',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '16px',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: '24px',
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(59,130,246,0.25)',
          }}>S</div>
          <h1 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: 700, margin: 0 }}>
            SMVP Auto-Office HQ
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Authorized access only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: '#1e293b', border: '1px solid rgba(51,65,85,0.5)',
          borderRadius: '16px', padding: '24px',
        }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#cbd5e1', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="sarthak@thesolutionmvp.com"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#cbd5e1', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
            }}>
              <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>
            </div>
          )}

          <button type="submit" style={{
            width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}>
            Sign In
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '11px', marginTop: '24px' }}>
          Authorized personnel only
        </p>
      </div>
    </div>
  )
}
