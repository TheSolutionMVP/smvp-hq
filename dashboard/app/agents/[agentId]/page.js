'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getAgent, AGENTS } from '../../../lib/agents'
import { supabase } from '../../../lib/supabase'
import { getTasksByAgent, getActivityByAgent, createTask, updateTaskStatus, deleteTask, logActivity } from '../../../lib/queries'

export default function AgentDetailPage() {
  const params = useParams()
  const agent = getAgent(params.agentId)

  const [autonomy, setAutonomy] = useState(agent?.autonomy || 30)
  const [status, setStatus] = useState(agent?.status || 'idle')
  const [taskQueue, setTaskQueue] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!agent) return
    fetchData()

    const channel = supabase
      .channel(`agent-${agent.id}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, fetchData)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [agent?.id])

  async function fetchData() {
    if (!agent) return
    const [tasks, activity] = await Promise.all([
      getTasksByAgent(agent.id),
      getActivityByAgent(agent.id),
    ])
    setTaskQueue(tasks)
    setActivityLog(activity)
  }

  async function handleCreateTask(e) {
    e.preventDefault()
    if (!newTask.title.trim()) return
    setSaving(true)
    const { data } = await createTask({
      agent_id: agent.id,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'pending',
    })
    if (data) {
      setTaskQueue(prev => [data, ...prev])
      await logActivity({
        agent_id: agent.id,
        action: 'task_created',
        details: `New task: ${newTask.title}`,
      })
    }
    setNewTask({ title: '', description: '', priority: 'medium' })
    setShowTaskForm(false)
    setSaving(false)
  }

  async function handleTaskAction(taskId, newStatus) {
    const { data } = await updateTaskStatus(taskId, newStatus)
    if (data) {
      setTaskQueue(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    }
  }

  async function handleDeleteTask(taskId) {
    const { error } = await deleteTask(taskId)
    if (!error) {
      setTaskQueue(prev => prev.filter(t => t.id !== taskId))
    }
  }

  if (!agent) {
    return (
      <div>
        <a href="/agents" className="back-link">← Back to Agents</a>
        <div className="empty-state">
          <div className="empty-state-icon">?</div>
          <p className="empty-state-text">Agent not found</p>
        </div>
      </div>
    )
  }

  const activeTasks = taskQueue.filter(t => t.status === 'in-progress')
  const pendingTasks = taskQueue.filter(t => t.status === 'pending')
  const completedTasks = taskQueue.filter(t => t.status === 'completed')

  return (
    <div className="agent-detail">
      <a href="/agents" className="back-link">← All Agents</a>

      {/* Agent Header */}
      <div className="agent-detail-header">
        <div className="agent-detail-icon" style={{ borderLeft: `4px solid ${agent.color}` }}>
          {agent.emoji}
        </div>
        <div className="agent-detail-info">
          <h1>{agent.name}</h1>
          <div className="agent-detail-role">{agent.role}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{agent.description}</div>
        </div>
        <div className="agent-detail-status">
          <span className={`agent-status ${status}`} style={{ fontSize: '14px', padding: '6px 14px' }}>
            <span className="status-dot"></span>
            {status === 'active' ? 'Working' : status === 'paused' ? 'Paused' : 'Idle'}
          </span>
        </div>
      </div>

      {/* Controls Row */}
      <div className="controls-row">
        <button className="control-btn primary" onClick={() => setStatus('active')}>▶ Resume</button>
        <button className="control-btn" onClick={() => setStatus('paused')}>⏸ Pause</button>
        <button className="control-btn danger" onClick={() => setStatus('idle')}>⏹ Stop</button>
        <button className="control-btn" onClick={() => { setStatus('idle'); setTimeout(() => setStatus('active'), 500); }}>↻ Restart</button>

        <div className="autonomy-section">
          <span className="autonomy-label">Autonomy</span>
          <input
            type="range"
            className="autonomy-slider"
            min="0"
            max="100"
            value={autonomy}
            onChange={(e) => setAutonomy(parseInt(e.target.value))}
          />
          <span className="autonomy-value">{autonomy}%</span>
        </div>
      </div>

      {/* Two Column: Task + Performance */}
      <div className="grid-2">
        {/* Left: Current Task + Queue */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Current Task</h3>
            </div>
            {activeTasks.length > 0 ? (
              <div>
                {activeTasks.map(task => (
                  <div key={task.id} className="current-task">
                    <div className="current-task-label">In Progress</div>
                    <div className="current-task-title">{task.title}</div>
                    {task.description && <div style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0' }}>{task.description}</div>}
                    <div className="task-actions">
                      <button className="btn btn-approve" onClick={() => handleTaskAction(task.id, 'completed')}>✓ Complete</button>
                      <button className="btn btn-reject" onClick={() => handleTaskAction(task.id, 'rejected')}>✗ Reject</button>
                      <button className="btn btn-skip" onClick={() => handleTaskAction(task.id, 'pending')}>→ Back to Queue</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <div className="empty-state-icon">◎</div>
                <p className="empty-state-text">
                  {status === 'idle' ? 'Agent is idle — resume to start working' : 'No active task — assign one below'}
                </p>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Task Queue</h3>
              <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => setShowTaskForm(!showTaskForm)}>
                {showTaskForm ? '✕ Cancel' : '+ Add Task'}
              </button>
            </div>

            {showTaskForm && (
              <form onSubmit={handleCreateTask} style={{ marginBottom: '16px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ marginBottom: '10px' }}>
                  <input className="form-input" placeholder="Task title *" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <input className="form-input" placeholder="Description (optional)" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select className="form-input" style={{ width: 'auto' }} value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: '12px' }} disabled={saving}>{saving ? 'Adding...' : 'Add Task'}</button>
                </div>
              </form>
            )}

            {pendingTasks.length === 0 && completedTasks.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 16px' }}>
                <p className="empty-state-text">No tasks queued — add a task to get started</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {pendingTasks.map((task, i) => (
                  <div key={task.id} style={{
                    padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, width: '20px' }}>{i + 1}.</span>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{task.title}</span>
                        <span style={{ fontSize: '11px', marginLeft: '8px', padding: '2px 6px', borderRadius: '3px',
                          background: task.priority === 'high' ? 'rgba(239,68,68,0.1)' : task.priority === 'medium' ? 'rgba(234,179,8,0.1)' : 'rgba(148,163,184,0.1)',
                          color: task.priority === 'high' ? '#EF4444' : task.priority === 'medium' ? '#EAB308' : '#94A3B8',
                        }}>{task.priority}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-approve" style={{ fontSize: '11px', padding: '3px 8px' }} onClick={() => handleTaskAction(task.id, 'in-progress')}>▶ Start</button>
                      <button className="btn btn-skip" style={{ fontSize: '11px', padding: '3px 8px' }} onClick={() => handleTaskAction(task.id, 'completed')}>✓ Done</button>
                      <button style={{ fontSize: '11px', padding: '3px 8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--accent-red)', cursor: 'pointer' }}
                        onClick={() => handleDeleteTask(task.id)}>✕</button>
                    </div>
                  </div>
                ))}
                {completedTasks.length > 0 && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed</div>
                    {completedTasks.slice(0, 5).map(task => (
                      <div key={task.id} style={{
                        padding: '8px 14px', display: 'flex', justifyContent: 'space-between',
                        background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', opacity: 0.6,
                      }}>
                        <span style={{ fontSize: '13px', textDecoration: 'line-through' }}>{task.title}</span>
                        <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>Done</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Performance + Activity */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Performance</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>All Time</span>
            </div>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 0 }}>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--accent-blue)' }}>{completedTasks.length}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Tasks Done</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--accent-green)' }}>{pendingTasks.length}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>In Queue</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--accent-yellow)' }}>{activeTasks.length}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Active Now</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: agent.color }}>{autonomy}%</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Autonomy</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Knowledge & Training</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" style={{ fontSize: '12px' }}>View Knowledge Base</button>
              <button className="btn btn-advise" style={{ fontSize: '12px' }}>Teach Agent</button>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
              Task limit: {agent.taskLimit} concurrent &nbsp;|&nbsp; Tier: {agent.tier}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Activity Log</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Recent</span>
            </div>
            {activityLog.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 16px' }}>
                <p className="empty-state-text">No activity recorded yet — assign tasks to see activity here</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activityLog.map((item) => (
                  <div key={item.id} style={{
                    padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.details || item.action}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
