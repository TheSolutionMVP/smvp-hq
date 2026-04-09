import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../../../lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// GET — fetch tasks, optionally filtered by agent
export async function GET(request) {
  const admin = requireAdmin(request)
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const agent = searchParams.get('agent')
  const status = searchParams.get('status')

  let query = supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(50)
  if (agent) query = query.eq('agent', agent)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

// POST — create a new task (assign to agent)
export async function POST(request) {
  const admin = requireAdmin(request)
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, description, agent, status = 'pending', priority = 'medium' } = body

  if (!title || !agent) {
    return Response.json({ error: 'title and agent are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({ title, description, agent, status, priority })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}

// PATCH — update a task (adjust, approve, reject, complete)
export async function PATCH(request) {
  const admin = requireAdmin(request)
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  // If approving/rejecting, add timestamp
  if (updates.status === 'approved' || updates.status === 'rejected') {
    updates.reviewed_at = new Date().toISOString()
  }
  if (updates.status === 'completed') {
    updates.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

// DELETE — remove a task
export async function DELETE(request) {
  const admin = requireAdmin(request)
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
