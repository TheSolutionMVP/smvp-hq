import { supabase } from './supabase'

// ─── Leads ───────────────────────────────────────────────
export async function getLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('getLeads error:', error)
  return data || []
}

export async function getLeadsByStatus(status) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
  if (error) console.error('getLeadsByStatus error:', error)
  return data || []
}

export async function getLeadCount() {
  const { count, error } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
  if (error) console.error('getLeadCount error:', error)
  return count || 0
}

// ─── Pipeline ────────────────────────────────────────────
export async function getPipeline() {
  const { data, error } = await supabase
    .from('pipeline')
    .select('*, leads(*)')
    .order('created_at', { ascending: false })
  if (error) console.error('getPipeline error:', error)
  return data || []
}

export async function getPipelineByStage(stage) {
  const { data, error } = await supabase
    .from('pipeline')
    .select('*, leads(*)')
    .eq('stage', stage)
    .order('created_at', { ascending: false })
  if (error) console.error('getPipelineByStage error:', error)
  return data || []
}

// ─── Deliverables ────────────────────────────────────────
export async function getDeliverables() {
  const { data, error } = await supabase
    .from('deliverables')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('getDeliverables error:', error)
  return data || []
}

export async function getDeliverablesByStatus(status) {
  const { data, error } = await supabase
    .from('deliverables')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
  if (error) console.error('getDeliverablesByStatus error:', error)
  return data || []
}

// ─── Revenue ─────────────────────────────────────────────
export async function getRevenue() {
  const { data, error } = await supabase
    .from('revenue')
    .select('*')
    .order('transaction_date', { ascending: false })
  if (error) console.error('getRevenue error:', error)
  return data || []
}

export async function getRevenueTotal() {
  const { data, error } = await supabase
    .from('revenue')
    .select('amount')
  if (error) console.error('getRevenueTotal error:', error)
  const total = (data || []).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  return total
}

export async function getRevenueByStream(stream) {
  const { data, error } = await supabase
    .from('revenue')
    .select('*')
    .eq('source', stream)
    .order('transaction_date', { ascending: false })
  if (error) console.error('getRevenueByStream error:', error)
  return data || []
}

// ─── Approval Queue ──────────────────────────────────────
export async function getApprovalQueue() {
  const { data, error } = await supabase
    .from('approval_queue')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('getApprovalQueue error:', error)
  return data || []
}

export async function getPendingApprovals() {
  const { data, error } = await supabase
    .from('approval_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) console.error('getPendingApprovals error:', error)
  return data || []
}

export async function getPendingApprovalCount() {
  const { count, error } = await supabase
    .from('approval_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
  if (error) console.error('getPendingApprovalCount error:', error)
  return count || 0
}

export async function approveAction(id) {
  const { data, error } = await supabase
    .from('approval_queue')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', id)
    .select()
  if (error) console.error('approveAction error:', error)
  return data?.[0] || null
}

export async function skipAction(id) {
  const { data, error } = await supabase
    .from('approval_queue')
    .update({ status: 'skipped' })
    .eq('id', id)
    .select()
  if (error) console.error('skipAction error:', error)
  return data?.[0] || null
}

// ─── Tasks ───────────────────────────────────────────────
export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('getTasks error:', error)
  return data || []
}

// ─── Realtime subscriptions ──────────────────────────────
export function subscribeToApprovals(callback) {
  return supabase
    .channel('approval_queue_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'approval_queue' }, callback)
    .subscribe()
}

export function subscribeToPipeline(callback) {
  return supabase
    .channel('pipeline_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pipeline' }, callback)
    .subscribe()
}

export function subscribeToLeads(callback) {
  return supabase
    .channel('leads_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, callback)
    .subscribe()
}

// ─── Dashboard stats (aggregated) ────────────────────────
export async function getDashboardStats() {
  const [leadCount, pendingCount, revenueTotal, deliverables] = await Promise.all([
    getLeadCount(),
    getPendingApprovalCount(),
    getRevenueTotal(),
    getDeliverables(),
  ])

  const activeDeliverables = deliverables.filter(d => d.status === 'in-progress').length

  return {
    leads: leadCount,
    pendingApprovals: pendingCount,
    revenue: revenueTotal,
    activeDeliverables,
  }
}
