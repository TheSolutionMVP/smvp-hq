import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { AGENT_PROMPTS, buildSystemPrompt } from '../../../../lib/agent-prompts'
import { requireAdmin } from '../../../../lib/auth'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const ccSupabase = process.env.COMMAND_CENTER_SUPABASE_URL
  ? createClient(process.env.COMMAND_CENTER_SUPABASE_URL, process.env.COMMAND_CENTER_SUPABASE_KEY)
  : null

// ─── Tools that agents can use to take action ──────────────────
const AGENT_TOOLS = [
  {
    name: 'create_task',
    description: 'Create a task for any agent. Use this when the CEO asks you to do something, or when you need to create a follow-up task.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short task title' },
        description: { type: 'string', description: 'Detailed description of what needs to be done' },
        agent: { type: 'string', description: 'Agent ID to assign to (rex, ace, atlas, nova, pixel, etc.)' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], description: 'Task priority' },
      },
      required: ['title', 'agent'],
    },
  },
  {
    name: 'queue_for_approval',
    description: 'Queue something for CEO approval. Use this for emails, invoices, contracts, deployments — anything that needs Sarthak to sign off.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short title for the approval item' },
        description: { type: 'string', description: 'Full details of what is being approved' },
        type: { type: 'string', description: 'Type: send-email, send-invoice, draft-contract, publish-listing, deploy, other' },
      },
      required: ['title', 'description', 'type'],
    },
  },
  {
    name: 'add_lead',
    description: 'Add a new lead to the database.',
    input_schema: {
      type: 'object',
      properties: {
        business_name: { type: 'string' },
        industry: { type: 'string' },
        location: { type: 'string' },
        has_website: { type: 'boolean' },
        contact_name: { type: 'string' },
        notes: { type: 'string' },
        score: { type: 'number', description: 'Lead score 0-100' },
      },
      required: ['business_name'],
    },
  },
  {
    name: 'update_pipeline',
    description: 'Add or update a deal in the pipeline.',
    input_schema: {
      type: 'object',
      properties: {
        stage: { type: 'string', enum: ['outreach', 'responded', 'proposal', 'negotiating', 'closed', 'onboarding', 'in-progress', 'billing', 'paid', 'overdue'] },
        stream: { type: 'string', description: 'Revenue stream: web-design, etsy-digital, canva, etc.' },
        deal_value: { type: 'number' },
        last_action: { type: 'string' },
        next_action: { type: 'string' },
      },
      required: ['stage'],
    },
  },
  {
    name: 'create_invoice',
    description: 'Create an invoice draft. Always queue for CEO approval after.',
    input_schema: {
      type: 'object',
      properties: {
        client_name: { type: 'string' },
        project_name: { type: 'string' },
        milestone: { type: 'string', description: 'What this invoice is for' },
        hours_logged: { type: 'number' },
        hourly_rate: { type: 'number' },
        amount: { type: 'number' },
        payment_terms: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['client_name', 'amount'],
    },
  },
  {
    name: 'log_time',
    description: 'Log billable hours for a client project.',
    input_schema: {
      type: 'object',
      properties: {
        client_name: { type: 'string' },
        project_name: { type: 'string' },
        description: { type: 'string' },
        hours: { type: 'number' },
        agent: { type: 'string' },
        billable: { type: 'boolean' },
      },
      required: ['client_name', 'hours'],
    },
  },
]

// ─── Execute a tool call ────────────────────────────────────────
async function executeTool(toolName, input, agentId) {
  switch (toolName) {
    case 'create_task': {
      const { data, error } = await supabase.from('tasks').insert({
        title: input.title,
        description: input.description || null,
        agent: input.agent,
        priority: input.priority || 'medium',
        status: 'pending',
      }).select().single()
      if (error) return `Error creating task: ${error.message}`
      return `Task created: "${input.title}" assigned to ${input.agent} (priority: ${input.priority || 'medium'})`
    }

    case 'queue_for_approval': {
      const { data, error } = await supabase.from('approval_queue').insert({
        title: input.title,
        description: input.description,
        type: input.type,
        agent: agentId,
        status: 'pending',
      }).select().single()
      if (error) return `Error queuing approval: ${error.message}`
      return `Queued for CEO approval: "${input.title}"`
    }

    case 'add_lead': {
      const { data, error } = await supabase.from('leads').insert({
        business_name: input.business_name,
        industry: input.industry || null,
        location: input.location || null,
        has_website: input.has_website || false,
        contact_name: input.contact_name || null,
        contact_found: !!input.contact_name,
        notes: input.notes || null,
        score: input.score || 0,
        status: 'new',
      }).select().single()
      if (error) return `Error adding lead: ${error.message}`
      return `Lead added: ${input.business_name} (score: ${input.score || 0})`
    }

    case 'update_pipeline': {
      const { data, error } = await supabase.from('pipeline').insert({
        stage: input.stage,
        stream: input.stream || null,
        deal_value: input.deal_value || 0,
        last_action: input.last_action || null,
        next_action: input.next_action || null,
      }).select().single()
      if (error) return `Error updating pipeline: ${error.message}`
      return `Pipeline updated: stage=${input.stage}, value=$${input.deal_value || 0}`
    }

    case 'create_invoice': {
      const { data, error } = await supabase.from('invoices').insert({
        client_name: input.client_name,
        project_name: input.project_name || null,
        milestone: input.milestone || null,
        hours_logged: input.hours_logged || null,
        hourly_rate: input.hourly_rate || null,
        amount: input.amount,
        payment_terms: input.payment_terms || 'Net 15',
        notes: input.notes || null,
        status: 'draft',
      }).select().single()
      if (error) return `Error creating invoice: ${error.message}`
      return `Invoice draft created: ${input.client_name} — $${input.amount}`
    }

    case 'log_time': {
      const { data, error } = await supabase.from('time_logs').insert({
        client_name: input.client_name,
        project_name: input.project_name || null,
        description: input.description || null,
        hours: input.hours,
        agent: input.agent || agentId,
        billable: input.billable !== false,
      }).select().single()
      if (error) return `Error logging time: ${error.message}`
      return `Logged ${input.hours}h for ${input.client_name} (billable: ${input.billable !== false})`
    }

    default:
      return `Unknown tool: ${toolName}`
  }
}

// ─── Safe query — returns [] if table doesn't exist ─────────────
async function safeQuery(client, table, opts = {}) {
  try {
    let q = client.from(table).select('*')
    if (opts.eq) q = q.eq(opts.eq[0], opts.eq[1])
    if (opts.order) q = q.order(opts.order, { ascending: false })
    if (opts.limit) q = q.limit(opts.limit)
    const { data } = await q
    return data || []
  } catch { return [] }
}

// ─── Fetch live data for agent context ──────────────────────────
async function fetchAgentData(agentId) {
  const agent = AGENT_PROMPTS[agentId]
  if (!agent) return ''

  const sections = []
  const needs = agent.dataNeeds || []

  // Run all queries in parallel with a 5s timeout
  const queries = {}
  if (needs.includes('leads')) queries.leads = safeQuery(supabase, 'leads', { order: 'created_at', limit: 20 })
  if (needs.includes('pipeline')) queries.pipeline = safeQuery(supabase, 'pipeline', { order: 'created_at', limit: 20 })
  if (needs.includes('deliverables')) queries.deliverables = safeQuery(supabase, 'deliverables', { order: 'created_at', limit: 20 })
  if (needs.includes('revenue')) queries.revenue = safeQuery(supabase, 'revenue', { order: 'transaction_date', limit: 50 })
  if (needs.includes('approval_queue')) queries.approvals = safeQuery(supabase, 'approval_queue', { eq: ['status', 'pending'], order: 'created_at' })
  if (needs.includes('tasks')) queries.tasks = safeQuery(supabase, 'tasks', { order: 'created_at', limit: 30 })
  if (needs.includes('invoices')) queries.invoices = safeQuery(supabase, 'invoices', { order: 'created_at', limit: 20 })

  if (ccSupabase && (agentId === 'ledger' || agentId === 'atlas' || agentId === 'dash')) {
    queries.financials = safeQuery(ccSupabase, 'financial_records', { order: 'date', limit: 50 })
    queries.engClients = safeQuery(ccSupabase, 'engagement_clients', {})
    queries.timeEntries = safeQuery(ccSupabase, 'engagement_time_entries', { order: 'date', limit: 50 })
  }

  // Wait for all with timeout
  const timeout = new Promise(resolve => setTimeout(() => resolve('TIMEOUT'), 5000))
  const results = await Promise.race([
    Promise.all(Object.entries(queries).map(async ([key, promise]) => {
      const data = await promise
      return [key, data]
    })),
    timeout,
  ])

  if (results !== 'TIMEOUT' && Array.isArray(results)) {
    for (const [key, data] of results) {
      if (data?.length) {
        const label = key.toUpperCase().replace(/([A-Z])/g, ' $1').trim()
        sections.push(`${label} (${data.length}):\n${JSON.stringify(data, null, 2)}`)
      }
    }
  }

  return sections.join('\n\n')
}

// ─── Main chat endpoint ─────────────────────────────────────────
export async function POST(request) {
  const admin = requireAdmin(request)
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { agentId, message, history = [] } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ error: 'ANTHROPIC_API_KEY not set. Add it to .env.local.' }, { status: 500 })
    }

    if (!AGENT_PROMPTS[agentId]) {
      return Response.json({ error: `Unknown agent: ${agentId}` }, { status: 400 })
    }

    // Fetch data with 4s timeout — don't let it block the chat
    let dataContext = ''
    try {
      const dataPromise = fetchAgentData(agentId)
      const timeout = new Promise(resolve => setTimeout(() => resolve(''), 4000))
      dataContext = await Promise.race([dataPromise, timeout])
    } catch { /* proceed without data */ }

    const systemPrompt = buildSystemPrompt(agentId, dataContext)

    const messages = [
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    // First call — may include tool use
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages,
      tools: AGENT_TOOLS,
    })

    // Process tool calls in a loop
    const actions = []
    let maxLoops = 5
    while (response.stop_reason === 'tool_use' && maxLoops > 0) {
      maxLoops--
      const toolBlocks = response.content.filter(b => b.type === 'tool_use')
      const toolResults = []

      for (const block of toolBlocks) {
        const result = await executeTool(block.name, block.input, agentId)
        actions.push({ tool: block.name, input: block.input, result })
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        })
      }

      // Continue conversation with tool results
      messages.push({ role: 'assistant', content: response.content })
      messages.push({ role: 'user', content: toolResults })

      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages,
        tools: AGENT_TOOLS,
      })
    }

    const textBlocks = response.content.filter(b => b.type === 'text')
    const reply = textBlocks.map(b => b.text).join('\n') || 'Done.'

    return Response.json({ reply, agentId, actions })
  } catch (err) {
    console.error('Agent chat error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
