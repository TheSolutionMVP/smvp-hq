-- ============================================
-- SMVP HQ — Supabase Schema
-- Run this in Supabase SQL Editor to create all tables
-- Then run supabase-rls-policies.sql for access policies
-- ============================================

-- ─── Leads ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  industry TEXT,
  location TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  has_website BOOLEAN DEFAULT false,
  website_url TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'qualified', 'contacted', 'responded', 'closed', 'lost')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  source TEXT,
  notes TEXT,
  assigned_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Pipeline ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  stage TEXT DEFAULT 'outreach' CHECK (stage IN ('outreach', 'responded', 'proposal', 'negotiating', 'closed', 'lost')),
  stream TEXT,
  deal_value NUMERIC(10,2) DEFAULT 0,
  last_action TEXT,
  next_action TEXT,
  assigned_agent TEXT,
  close_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Deliverables ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deliverables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT,
  deliverable_type TEXT CHECK (deliverable_type IN ('website', 'etsy-listing', 'canva-template', 'print-product', 'video', 'other')),
  status TEXT DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'ready', 'delivered', 'cancelled')),
  github_path TEXT,
  live_url TEXT,
  delivered_date DATE,
  assigned_agent TEXT,
  project_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Revenue ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS revenue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT CHECK (source IN ('web-design', 'etsy-digital', 'etsy-physical', 'canva', 'tiktok', 'consulting', 'direct', 'other')),
  amount NUMERIC(10,2) NOT NULL,
  client_name TEXT,
  platform TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Tasks ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'rejected', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Approval Queue ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS approval_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent TEXT NOT NULL,
  type TEXT CHECK (type IN ('send-email', 'publish-listing', 'publish-content', 'publish-post', 'deploy', 'spend', 'create-account', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  payload JSONB,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped', 'executed')),
  approved_at TIMESTAMPTZ,
  reviewed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Activity Log ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Clients ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('prospect', 'active', 'paused', 'completed', 'churned')),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  onboarded_at DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Projects ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('planning', 'active', 'review', 'completed', 'cancelled')),
  agents_assigned TEXT[],
  budget NUMERIC(10,2),
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Indexes for performance ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_activity_agent ON activity_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_status ON approval_queue(status);
CREATE INDEX IF NOT EXISTS idx_revenue_source ON revenue(source);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ─── Updated_at triggers ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER pipeline_updated_at BEFORE UPDATE ON pipeline FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER deliverables_updated_at BEFORE UPDATE ON deliverables FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
