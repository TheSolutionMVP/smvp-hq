'use client'
import { useState, useEffect } from 'react'

const PRIORITY_COLORS = {
  urgent: '#EF4444', high: '#F59E0B', medium: '#3B82F6', low: '#6B7280',
}

const STATUS_LABELS = {
  pending: 'Pending', 'in-progress': 'In Progress', completed: 'Done',
  approved: 'Approved', rejected: 'Rejected', blocked: 'Blocked',
}

export default function AgentTasks({ agent }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => { fetchTasks() }, [agent.id])

  async function fetchTasks() {
    try {
      const res = await fetch(`/api/tasks?agent=${agent.id}`)
      const data = await res.json()
      setTasks(Array.isArray(data) ? data : [])
    } catch { setTasks([]) }
    setLoading(false)
  }

  async function addTask(e) {
    e.preventDefault()
    if (!newTask.title.trim()) return

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTask, agent: agent.id }),
    })

    if (res.ok) {
      setNewTask({ title: '', description: '', priority: 'medium' })
      setShowAdd(false)
      fetchTasks()
    }
  }

  async function updateTask(id, updates) {
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    setEditingId(null)
    fetchTasks()
  }

  async function deleteTask(id) {
    await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
    fetchTasks()
  }

  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'rejected')
  const doneTasks = tasks.filter(t => t.status === 'completed' || t.status === 'rejected')

  return (
    <div>
      {/* Header with Add button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
          TASKS ({activeTasks.length} active)
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            padding: '4px 12px', fontSize: '12px', fontWeight: 600,
            border: `1px solid ${agent.color}40`, borderRadius: 'var(--radius-md)',
            background: showAdd ? agent.color + '15' : 'transparent',
            color: agent.color, cursor: 'pointer',
          }}
        >
          {showAdd ? 'Cancel' : '+ Assign Task'}
        </button>
      </div>

      {/* Add task form */}
      {showAdd && (
        <form onSubmit={addTask} style={{
          padding: '12px', marginBottom: '12px', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', background: 'var(--bg-secondary)',
        }}>
          <input
            type="text" placeholder="Task title..."
            value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            style={{
              width: '100%', padding: '8px 10px', fontSize: '13px', marginBottom: '8px',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)', color: 'var(--text-primary)',
            }}
          />
          <textarea
            placeholder="Description (optional)..."
            value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })}
            rows={2}
            style={{
              width: '100%', padding: '8px 10px', fontSize: '12px', marginBottom: '8px',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
              style={{
                padding: '6px 10px', fontSize: '12px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-primary)', color: 'var(--text-primary)',
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <button type="submit" style={{
              padding: '6px 16px', fontSize: '12px', fontWeight: 600,
              border: 'none', borderRadius: 'var(--radius-md)',
              background: agent.color, color: '#fff', cursor: 'pointer',
            }}>
              Assign to {agent.name}
            </button>
          </div>
        </form>
      )}

      {/* Task list */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px' }}>Loading tasks...</div>
      ) : activeTasks.length === 0 && !showAdd ? (
        <div style={{
          textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px',
          padding: '24px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)',
        }}>
          No active tasks. Click "Assign Task" or chat with {agent.name} to get started.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {activeTasks.map(task => (
            <div key={task.id} style={{
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', background: 'var(--bg-secondary)',
            }}>
              {editingId === task.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <input
                    value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    style={{
                      padding: '6px 8px', fontSize: '13px', border: '1px solid var(--border)',
                      borderRadius: '4px', background: 'var(--bg-primary)', color: 'var(--text-primary)',
                    }}
                  />
                  <textarea
                    value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    rows={2}
                    style={{
                      padding: '6px 8px', fontSize: '12px', border: '1px solid var(--border)',
                      borderRadius: '4px', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => updateTask(task.id, editForm)} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, border: 'none', borderRadius: '4px', background: '#22C55E', color: '#fff', cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', flex: 1 }}>{task.title}</div>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600,
                        background: PRIORITY_COLORS[task.priority] + '20',
                        color: PRIORITY_COLORS[task.priority],
                      }}>
                        {task.priority}
                      </span>
                      <span style={{
                        fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                        background: 'var(--bg-primary)', color: 'var(--text-muted)',
                      }}>
                        {STATUS_LABELS[task.status] || task.status}
                      </span>
                    </div>
                  </div>
                  {task.description && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{task.description}</div>
                  )}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <button onClick={() => updateTask(task.id, { status: 'approved' })} style={{ padding: '3px 8px', fontSize: '10px', fontWeight: 600, border: 'none', borderRadius: '4px', background: '#22C55E', color: '#fff', cursor: 'pointer' }}>Approve</button>
                    <button onClick={() => updateTask(task.id, { status: 'in-progress' })} style={{ padding: '3px 8px', fontSize: '10px', fontWeight: 600, border: 'none', borderRadius: '4px', background: '#3B82F6', color: '#fff', cursor: 'pointer' }}>Start</button>
                    <button onClick={() => updateTask(task.id, { status: 'completed' })} style={{ padding: '3px 8px', fontSize: '10px', fontWeight: 600, border: 'none', borderRadius: '4px', background: '#6B7280', color: '#fff', cursor: 'pointer' }}>Done</button>
                    <button onClick={() => { setEditingId(task.id); setEditForm({ title: task.title, description: task.description || '' }) }} style={{ padding: '3px 8px', fontSize: '10px', fontWeight: 600, border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => updateTask(task.id, { status: 'rejected' })} style={{ padding: '3px 8px', fontSize: '10px', fontWeight: 600, border: 'none', borderRadius: '4px', background: '#EF4444', color: '#fff', cursor: 'pointer' }}>Reject</button>
                    <button onClick={() => deleteTask(task.id)} style={{ padding: '3px 8px', fontSize: '10px', fontWeight: 600, border: '1px solid #EF444440', borderRadius: '4px', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Completed tasks (collapsed) */}
      {doneTasks.length > 0 && (
        <details style={{ marginTop: '12px' }}>
          <summary style={{ fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
            {doneTasks.length} completed/rejected
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
            {doneTasks.map(task => (
              <div key={task.id} style={{
                padding: '6px 10px', fontSize: '12px', borderRadius: '4px',
                background: 'var(--bg-secondary)', color: 'var(--text-muted)',
                textDecoration: 'line-through', opacity: 0.6,
              }}>
                {task.title}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
