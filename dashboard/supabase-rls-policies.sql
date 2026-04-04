-- RLS Policies for SMVP HQ Dashboard
-- Run this in Supabase SQL Editor to allow the dashboard to read/write data

-- Leads: anon can read all, insert, update
CREATE POLICY "Allow anon read leads" ON leads FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert leads" ON leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update leads" ON leads FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Pipeline: anon can read all, insert, update
CREATE POLICY "Allow anon read pipeline" ON pipeline FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert pipeline" ON pipeline FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update pipeline" ON pipeline FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Deliverables: anon can read all, insert, update
CREATE POLICY "Allow anon read deliverables" ON deliverables FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert deliverables" ON deliverables FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update deliverables" ON deliverables FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Revenue: anon can read all, insert
CREATE POLICY "Allow anon read revenue" ON revenue FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert revenue" ON revenue FOR INSERT TO anon WITH CHECK (true);

-- Approval Queue: anon can read all, insert, update (for approve/skip)
CREATE POLICY "Allow anon read approval_queue" ON approval_queue FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert approval_queue" ON approval_queue FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update approval_queue" ON approval_queue FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Tasks: anon can read all, insert, update
CREATE POLICY "Allow anon read tasks" ON tasks FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert tasks" ON tasks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update tasks" ON tasks FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Enable realtime for core tables
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE pipeline;
ALTER PUBLICATION supabase_realtime ADD TABLE approval_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE deliverables;
ALTER PUBLICATION supabase_realtime ADD TABLE revenue;
