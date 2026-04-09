-- ============================================
-- Seed: Raineri Jewelers — First SMVP Client
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add Raineri as a lead (if not already there)
INSERT INTO leads (business_name, industry, location, has_website, status, contact_found, contact_name, score, notes, created_at)
VALUES (
  'Raineri Jewelers',
  'Jewelry & Retail',
  'Newark, NJ',
  false,
  'closed',
  true,
  'Raineri Family',
  95,
  'First SMVP client. Web design project. Deal closed — needs contract + hours audit before invoicing.',
  NOW() - INTERVAL '14 days'
)
ON CONFLICT DO NOTHING;

-- 2. Add to pipeline — currently in contract stage (NOT billing yet)
INSERT INTO pipeline (stage, stream, deal_value, last_action, next_action, created_at)
VALUES (
  'closed',
  'web-design',
  0,
  'Deal closed — contract not yet sent',
  'Atlas: Draft contract with hours + scope, get CEO approval',
  NOW()
);

-- 3. Add deliverable (in-progress — not yet delivered)
INSERT INTO deliverables (client_name, type, status, github_path, live_url, created_at)
VALUES (
  'Raineri Jewelers',
  'website',
  'in-progress',
  'TheSolutionMVP/raineri-jewelers',
  NULL,
  NOW()
);

-- 4. Create the contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  project_name TEXT,
  scope TEXT,
  hourly_rate DECIMAL(10,2),
  estimated_hours DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'sent', 'signed', 'active', 'completed')),
  payment_terms TEXT DEFAULT 'Net 15',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  signed_at TIMESTAMPTZ
);

-- Enable RLS on contracts
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read contracts" ON contracts FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert contracts" ON contracts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update contracts" ON contracts FOR UPDATE TO anon USING (true);

-- Enable realtime on contracts
ALTER PUBLICATION supabase_realtime ADD TABLE contracts;

-- 5. Create the invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  project_name TEXT,
  contract_id UUID REFERENCES contracts(id),
  milestone TEXT,
  hours_logged DECIMAL(10,2),
  hourly_rate DECIMAL(10,2),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'sent', 'viewed', 'paid', 'overdue')),
  payment_method TEXT,
  payment_terms TEXT DEFAULT 'Net 15',
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read invoices" ON invoices FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert invoices" ON invoices FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update invoices" ON invoices FOR UPDATE TO anon USING (true);

-- Enable realtime on invoices
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;

-- 6. Create time_logs table for tracking hours per client
CREATE TABLE IF NOT EXISTS time_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  project_name TEXT,
  agent TEXT,
  description TEXT,
  hours DECIMAL(10,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  billable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read time_logs" ON time_logs FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert time_logs" ON time_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update time_logs" ON time_logs FOR UPDATE TO anon USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE time_logs;

-- 7. Queue contract drafting for Sarthak's approval
INSERT INTO approval_queue (title, description, type, agent, status, created_at)
VALUES (
  'Contract: Raineri Jewelers — Web Design',
  'Atlas needs to draft a contract for Raineri Jewelers. Before invoicing, we need: (1) audit total hours worked, (2) define scope & deliverables, (3) set rate/pricing, (4) get contract signed. Awaiting CEO input on hours and rate.',
  'draft-contract',
  'atlas',
  'pending',
  NOW()
);

-- 8. Atlas tasks — proper order: contract → hours audit → invoice
INSERT INTO tasks (title, description, agent, status, created_at)
VALUES
  ('Audit hours for Raineri Jewelers', 'Pull all hours logged for Raineri project from SMVP command center. Verify with CEO.', 'atlas', 'in-progress', NOW()),
  ('Draft contract for Raineri Jewelers', 'Include scope (website design + dev), hours, rate, payment terms. Queue for CEO approval.', 'atlas', 'pending', NOW()),
  ('Send contract to Raineri for signature', 'After CEO approves contract, send to client.', 'atlas', 'pending', NOW()),
  ('Generate invoice after contract signed', 'Only after contract is signed and hours verified. Amount = verified hours x rate.', 'atlas', 'pending', NOW());
