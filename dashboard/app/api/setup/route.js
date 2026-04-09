import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../../../lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Auto-create all tables the agents need. Safe to run multiple times.
const MIGRATIONS = [
  // Contracts table
  `CREATE TABLE IF NOT EXISTS contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    project_name TEXT,
    scope TEXT,
    hourly_rate DECIMAL(10,2),
    estimated_hours DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    status TEXT DEFAULT 'draft',
    payment_terms TEXT DEFAULT 'Net 15',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    signed_at TIMESTAMPTZ
  )`,

  // Invoices table
  `CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    project_name TEXT,
    contract_id UUID,
    milestone TEXT,
    hours_logged DECIMAL(10,2),
    hourly_rate DECIMAL(10,2),
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'draft',
    payment_method TEXT,
    payment_terms TEXT DEFAULT 'Net 15',
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Time logs table
  `CREATE TABLE IF NOT EXISTS time_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    project_name TEXT,
    agent TEXT,
    description TEXT,
    hours DECIMAL(10,2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    billable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Ensure tasks table has all needed columns
  `CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    agent TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    reviewed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Ensure approval_queue exists
  `CREATE TABLE IF NOT EXISTS approval_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,
    agent TEXT,
    status TEXT DEFAULT 'pending',
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Ensure core tables exist
  `CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    industry TEXT,
    location TEXT,
    has_website BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'new',
    contact_found BOOLEAN DEFAULT false,
    contact_name TEXT,
    score INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS pipeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stage TEXT DEFAULT 'outreach',
    stream TEXT,
    deal_value DECIMAL(10,2) DEFAULT 0,
    last_action TEXT,
    next_action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS deliverables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    type TEXT,
    status TEXT DEFAULT 'in-progress',
    github_path TEXT,
    live_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS revenue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source TEXT,
    amount DECIMAL(10,2),
    client_name TEXT,
    platform TEXT,
    transaction_date TIMESTAMPTZ DEFAULT NOW()
  )`,
]

export async function GET(request) {
  const admin = requireAdmin(request)
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const results = []

  for (const sql of MIGRATIONS) {
    const { error } = await supabase.rpc('exec_sql', { sql_text: sql }).maybeSingle()
    if (error) {
      // rpc might not exist — try raw query via rest
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ sql_text: sql }),
      })
      results.push({ sql: sql.substring(0, 60), status: res.ok ? 'ok' : 'needs_manual_run' })
    } else {
      results.push({ sql: sql.substring(0, 60), status: 'ok' })
    }
  }

  return Response.json({ message: 'Migration complete', results })
}
