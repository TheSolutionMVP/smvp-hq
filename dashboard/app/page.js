'use client'
import { useState } from 'react'
import { AGENTS, TIERS } from '../lib/agents'

const VIEWS = [
  { id: 'metrics', label: 'Metrics', icon: '◻' },
  { id: 'office', label: 'Office', icon: '▦' },
  { id: 'pipeline', label: 'Pipeline', icon: '▤' },
]

export default function Dashboard() {
  const [view, setView] = useState('metrics')
  const [agents, setAgents] = useState(AGENTS)

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Command Center</h1>
          <p className="page-subtitle">Real-time overview of all agent operations</p>
        </div>
        <div className="view-switcher">
          {VIEWS.map(v => (
            <button key={v.id} className={`view-btn ${view === v.id ? 'active' : ''}`} onClick={() => setView(v.id)}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Agents</div>
          <div className="stat-value blue">{agents.filter(a => a.status === 'active').length} / {agents.length}</div>
          <div className="stat-change">{agents.filter(a => a.status === 'idle').length} idle</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Approvals</div>
          <div className="stat-value yellow">0</div>
          <div className="stat-change up">All clear</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tasks Today</div>
          <div className="stat-value green">0</div>
          <div className="stat-change">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Token Spend</div>
          <div className="stat-value purple">$0.00</div>
          <div className="stat-change">Today's cost</div>
        </div>
      </div>

      {view === 'metrics' && <MetricsView agents={agents} />}
      {view === 'office' && <OfficeView agents={agents} />}
      {view === 'pipeline' && <PipelineView />}
    </div>
  )
}

function MetricsView({ agents }) {
  return (
    <div>
      {Object.entries(TIERS).map(([key, tier]) => (
        <div key={key}>
          <div className="tier-label">{tier.label} — {tier.description}</div>
          <div className="agent-grid">
            {agents.filter(a => a.tier === key).map(agent => (
              <a key={agent.id} href={`/agents/${agent.id}`} className="agent-card">
                <div className="agent-card-accent" style={{ background: agent.color }}></div>
                <div className="agent-header">
                  <div className="agent-emoji">{agent.emoji}</div>
                  <div>
                    <div className="agent-name">{agent.name}</div>
                    <div className="agent-role">{agent.role}</div>
                  </div>
                </div>
                <div className="agent-card-footer">
                  <span className={`agent-status ${agent.status}`}>
                    <span className="status-dot"></span>
                    {agent.status === 'active' ? 'Working' : agent.status === 'paused' ? 'Paused' : 'Idle'}
                  </span>
                  <span className="agent-autonomy">
                    <span className="autonomy-bar-mini">
                      <span className="autonomy-bar-fill" style={{ width: `${agent.autonomy}%` }}></span>
                    </span>
                    {agent.autonomy}%
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
      <div className="grid-2" style={{ marginTop: '8px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Approval Queue</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>0 pending</span>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">✓</div>
            <p className="empty-state-text">No pending approvals — all clear</p>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Activity Feed</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Today</span>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">◎</div>
            <p className="empty-state-text">No agent activity yet — deploy your first task</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =============================================
   OFFICE VIEW — Top-Down Floor Plan (SVG)
   Each office has personality matching the agent
   ============================================= */

// --- SVG furniture primitives ---
function Desk({ x, y, w=48, h=24, color='#D4A574' }) {
  return <rect x={x} y={y} width={w} height={h} rx={3} fill={color} stroke="#B8956A" strokeWidth={1.2}/>
}
function LDesk({ x, y, flip=false }) {
  // L-shaped executive desk
  return (
    <g>
      <rect x={x} y={y} width={60} height={24} rx={3} fill="#8B6914" stroke="#7A5C10" strokeWidth={1.2}/>
      <rect x={flip ? x+32 : x} y={y+24} width={28} height={36} rx={3} fill="#8B6914" stroke="#7A5C10" strokeWidth={1.2}/>
    </g>
  )
}
function Chair({ cx, cy, r=8, color='#4A5568' }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} stroke="#2D3748" strokeWidth={0.8}/>
      <circle cx={cx} cy={cy} r={r-3} fill="#718096"/>
    </g>
  )
}
function MassageChair({ cx, cy }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={11} ry={13} fill="#5D4E37" stroke="#3D2E17" strokeWidth={1}/>
      <ellipse cx={cx} cy={cy-2} rx={8} ry={9} fill="#7B6B4F"/>
      <circle cx={cx} cy={cy+6} r={3} fill="#3D2E17" opacity={0.3}/>
    </g>
  )
}
function Monitor({ x, y, w=16, h=10 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2} fill="#1A1A2E" stroke="#2D3748" strokeWidth={0.8}/>
      <rect x={x+1.5} y={y+1.5} width={w-3} height={h-4} rx={1} fill="#4A90D9" opacity={0.5}/>
    </g>
  )
}
function Plant({ cx, cy, size=10 }) {
  return (
    <g>
      <rect x={cx-size*0.3} y={cy+size*0.1} width={size*0.6} height={size*0.4} rx={2} fill="#8B6914"/>
      <circle cx={cx} cy={cy-size*0.1} r={size*0.5} fill="#48BB78"/>
      <circle cx={cx-size*0.2} cy={cy} r={size*0.3} fill="#38A169"/>
      <circle cx={cx+size*0.15} cy={cy-size*0.25} r={size*0.28} fill="#68D391"/>
    </g>
  )
}
function TallPlant({ cx, cy }) {
  return (
    <g>
      <rect x={cx-5} y={cy+4} width={10} height={10} rx={3} fill="#8B6914"/>
      <ellipse cx={cx} cy={cy-6} rx={10} ry={14} fill="#38A169"/>
      <ellipse cx={cx-4} cy={cy-2} rx={6} ry={9} fill="#48BB78"/>
      <ellipse cx={cx+5} cy={cy-8} rx={5} ry={8} fill="#68D391"/>
    </g>
  )
}
function Bookshelf({ x, y, w=12, h=36 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={1} fill="#B8956A" stroke="#9C7A50" strokeWidth={0.8}/>
      {[0,1,2,3].map(i => (
        <rect key={i} x={x+2} y={y+2+i*(h/4)} width={w-4} height={h/4-3} rx={1}
          fill={['#E53E3E','#3182CE','#38A169','#D69E2E'][i]} opacity={0.6}/>
      ))}
    </g>
  )
}
function Couch({ x, y, w=50, h=18, color='#6B7280' }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h/2} fill={color}/>
      <rect x={x} y={y-2} width={10} height={h+4} rx={4} fill={color}/>
      <rect x={x+w-10} y={y-2} width={10} height={h+4} rx={4} fill={color}/>
    </g>
  )
}
function CoffeeTable({ x, y, w=28, h=14 }) {
  return <rect x={x} y={y} width={w} height={h} rx={3} fill="#C4A46C" stroke="#A38A55" strokeWidth={0.8}/>
}
function ServerRack({ x, y, w=18, h=36 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2} fill="#2D3748" stroke="#1A202C" strokeWidth={1}/>
      {[0,1,2,3].map(i => (
        <g key={i}>
          <rect x={x+2} y={y+3+i*8} width={w-4} height={5} rx={1} fill="#4A5568"/>
          <circle cx={x+w-4} cy={y+5.5+i*8} r={1.2} fill={i<2?'#48BB78':'#ECC94B'}/>
        </g>
      ))}
    </g>
  )
}
function Whiteboard({ x, y, w=50, h=6 }) {
  return <rect x={x} y={y} width={w} height={h} rx={1} fill="#EDF2F7" stroke="#CBD5E0" strokeWidth={0.8}/>
}
function Rug({ cx, cy, rx=35, ry=22, color='#D4A574' }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} opacity={0.3}/>
}
function PuttingGreen({ x, y }) {
  return (
    <g>
      <ellipse cx={x+25} cy={y+10} rx={25} ry={10} fill="#68D391" opacity={0.7}/>
      <circle cx={x+38} cy={y+8} r={2} fill="#2D3748"/>
      <line x1={x+38} y1={y+8} x2={x+38} y2={y+2} stroke="#2D3748" strokeWidth={0.8}/>
      <rect x={x+36} y={y+1} width={5} height={3} rx={1} fill="#E53E3E" opacity={0.7}/>
    </g>
  )
}
function TargetBoard({ x, y }) {
  return (
    <g>
      <circle cx={x+10} cy={y+10} r={10} fill="#FEB2B2" stroke="#FC8181" strokeWidth={0.8}/>
      <circle cx={x+10} cy={y+10} r={6} fill="#FED7D7"/>
      <circle cx={x+10} cy={y+10} r={3} fill="#E53E3E"/>
    </g>
  )
}
function DrawingTablet({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width={30} height={22} rx={3} fill="#4A5568" stroke="#2D3748" strokeWidth={0.8}/>
      <rect x={x+3} y={y+3} width={24} height={16} rx={2} fill="#63B3ED" opacity={0.4}/>
      <line x1={x+8} y1={y+8} x2={x+20} y2={y+14} stroke="#F6AD55" strokeWidth={1.5} strokeLinecap="round"/>
    </g>
  )
}
function RingLight({ cx, cy }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={9} fill="none" stroke="#F6E05E" strokeWidth={3} opacity={0.5}/>
      <circle cx={cx} cy={cy} r={9} fill="none" stroke="#FEFCBF" strokeWidth={1}/>
    </g>
  )
}
function Camera({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width={16} height={12} rx={2} fill="#2D3748" stroke="#1A202C" strokeWidth={0.8}/>
      <circle cx={x+8} cy={y+6} r={4} fill="#4A5568" stroke="#718096" strokeWidth={0.8}/>
      <circle cx={x+8} cy={y+6} r={2} fill="#63B3ED" opacity={0.5}/>
    </g>
  )
}
function FilingCabinet({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width={22} height={36} rx={2} fill="#A0AEC0" stroke="#718096" strokeWidth={0.8}/>
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x={x+3} y={y+3+i*11} width={16} height={8} rx={1} fill="#CBD5E0"/>
          <circle cx={x+11} cy={y+7+i*11} r={1.5} fill="#718096"/>
        </g>
      ))}
    </g>
  )
}
function Safe({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width={22} height={22} rx={2} fill="#4A5568" stroke="#2D3748" strokeWidth={1.2}/>
      <circle cx={x+11} cy={y+11} r={5} fill="none" stroke="#A0AEC0" strokeWidth={1.5}/>
      <circle cx={x+11} cy={y+11} r={1.5} fill="#A0AEC0"/>
    </g>
  )
}
function StickyNotes({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width={10} height={10} fill="#FEFCBF" transform={`rotate(-5 ${x+5} ${y+5})`}/>
      <rect x={x+8} y={y-2} width={10} height={10} fill="#FED7E2" transform={`rotate(3 ${x+13} ${y+3})`}/>
      <rect x={x+4} y={y+7} width={10} height={10} fill="#C6F6D5" transform={`rotate(-2 ${x+9} ${y+12})`}/>
    </g>
  )
}
function ShieldBadge({ x, y }) {
  return (
    <g>
      <path d={`M${x+8} ${y} L${x+16} ${y+4} L${x+16} ${y+12} L${x+8} ${y+18} L${x} ${y+12} L${x} ${y+4} Z`}
        fill="#ECC94B" stroke="#D69E2E" strokeWidth={0.8}/>
      <text x={x+8} y={y+12} textAnchor="middle" style={{fontSize:'7px',fill:'#744210',fontWeight:700}}>QA</text>
    </g>
  )
}
function PackageBoxes({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width={16} height={14} rx={1} fill="#D69E2E" stroke="#B7791F" strokeWidth={0.8}/>
      <line x1={x} y1={y+5} x2={x+16} y2={y+5} stroke="#B7791F" strokeWidth={0.5}/>
      <rect x={x+12} y={y+8} width={14} height={12} rx={1} fill="#ED8936" stroke="#C05621" strokeWidth={0.8}/>
      <line x1={x+12} y1={y+13} x2={x+26} y2={y+13} stroke="#C05621" strokeWidth={0.5}/>
    </g>
  )
}

// Agent avatar
function AgentAvatar({ cx, cy, agent, isHovered }) {
  const sc = agent.status === 'active' ? '#48BB78' : agent.status === 'paused' ? '#ECC94B' : '#A0AEC0'
  return (
    <g style={{ cursor: 'pointer' }}>
      <ellipse cx={cx} cy={cy+13} rx={11} ry={3.5} fill="rgba(0,0,0,0.08)"/>
      <circle cx={cx} cy={cy} r={isHovered?15:13} fill={agent.color} stroke="#fff" strokeWidth={2.5}
        style={{ transition:'all 0.15s', filter: isHovered?'drop-shadow(0 3px 8px rgba(0,0,0,0.3))':'none' }}/>
      <text x={cx} y={cy+5} textAnchor="middle" fontSize={isHovered?14:12} style={{pointerEvents:'none'}}>{agent.emoji}</text>
      <circle cx={cx+9} cy={cy-9} r={4} fill={sc} stroke="#fff" strokeWidth={1.5}/>
    </g>
  )
}
function AgentLabel({ cx, cy, agent }) {
  return (
    <g style={{pointerEvents:'none'}}>
      <text x={cx} y={cy} textAnchor="middle" style={{fontFamily:'var(--font-heading)',fontWeight:700,fontSize:'9.5px',fill:'#1A1A2E'}}>{agent.name}</text>
      <text x={cx} y={cy+10} textAnchor="middle" style={{fontSize:'7px',fill:'#94A3B8'}}>
        {agent.status==='active'?'Working':agent.status==='paused'?'Paused':'Idle'}
      </text>
    </g>
  )
}
function RoomLabel({ x, y, text, sub }) {
  return (
    <g style={{pointerEvents:'none'}}>
      <text x={x} y={y} textAnchor="middle" style={{fontFamily:'var(--font-heading)',fontWeight:600,fontize:'8px',fill:'#A0AEC0',letterSpacing:'1px'}}>{text}</text>
      {sub && <text x={x} y={y+10} textAnchor="middle" style={{fontSize:'6.5px',fill:'#CBD5E0'}}>{sub}</text>}
    </g>
  )
}
function WindowStrip({ x, y, count=3, vertical=false }) {
  return (
    <g>
      {Array.from({length:count}).map((_,i) => vertical
        ? <rect key={i} x={x} y={y+i*30} width={4} height={22} rx={1} fill="#BEE3F8" opacity={0.6}/>
        : <rect key={i} x={x+i*35} y={y} width={22} height={4} rx={1} fill="#BEE3F8" opacity={0.6}/>
      )}
    </g>
  )
}

function OfficeView({ agents }) {
  const [hovered, setHovered] = useState(null)
  const a = {}; agents.forEach(ag => { a[ag.id] = ag })

  const W = 1060, H = 660
  const F = '#FDF6EC' // floor
  const HL = '#F1EDE4' // hallway

  return (
    <div className="card" style={{ padding: '16px', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h3 className="card-title" style={{ marginBottom: '2px', fontSize: '16px' }}>SMVP Auto-Office HQ</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Top-down floor plan — click any agent to manage</p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxHeight: '560px', borderRadius: '12px', background: '#DDD5C8' }}>
        <defs>
          <filter id="rs" x="-2%" y="-2%" width="104%" height="104%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.06"/>
          </filter>
        </defs>

        {/* Outer building walls */}
        <rect x={6} y={6} width={W-12} height={H-12} rx={3} fill="none" stroke="#B0A898" strokeWidth={10}/>

        {/* ===== MAIN HALLWAY (horizontal) ===== */}
        <rect x={10} y={262} width={W-20} height={55} fill={HL}/>
        {Array.from({length:16}).map((_,i) => (
          <line key={`hl${i}`} x1={10+i*66} y1={262} x2={10+i*66} y2={317} stroke="#E2DDD4" strokeWidth={0.5}/>
        ))}
        <text x={W/2} y={294} textAnchor="middle" style={{fontSize:'7px',fill:'#B0A898',letterSpacing:'3px',fontWeight:600}}>MAIN CORRIDOR</text>
        <Plant cx={120} cy={289} size={7}/><Plant cx={350} cy={289} size={7}/><Plant cx={580} cy={289} size={7}/><Plant cx={800} cy={289} size={7}/>

        {/* Water cooler */}
        <rect x={680} y={275} width={10} height={16} rx={3} fill="#63B3ED" stroke="#4299E1" strokeWidth={0.8}/>
        <circle cx={685} cy={273} r={4} fill="#BEE3F8"/>

        {/* ================================================================
            TOP ROW — FRONT OFFICE + CEO + CONFERENCE
            ================================================================ */}

        {/* CEO CORNER OFFICE — large, luxurious */}
        <rect x={12} y={12} width={195} height={248} rx={2} fill={F} filter="url(#rs)"/>
        <RoomLabel x={110} y={28} text="CEO OFFICE" sub="Sarthak Varma"/>
        <LDesk x={30} y={80}/>
        <Monitor x={48} y={83} w={18} h={11}/><Monitor x={70} y={83} w={18} h={11}/>
        <MassageChair cx={55} cy={140}/>
        <Couch x={120} y={170} w={55} h={16} color="#5D4E37"/>
        <CoffeeTable x={130} y={152}/>
        <TallPlant cx={175} cy={40}/>
        <Plant cx={25} cy={220} size={11}/>
        <Bookshelf x={160} y={60} w={14} h={45}/>
        <Rug cx={100} cy={180} rx={50} ry={30} color="#C4A46C"/>
        {/* World map on wall */}
        <rect x={35} y={20} width={55} height={30} rx={2} fill="#E2E8F0" stroke="#CBD5E0" strokeWidth={0.8}/>
        <text x={62} y={38} textAnchor="middle" style={{fontSize:'5px',fill:'#A0AEC0'}}>WORLD MAP</text>
        <WindowStrip x={25} y={12} count={4}/>

        {/* REX — Lead Hunter: Target boards, maps, binoculars, very focused hunter vibe */}
        <rect x={213} y={12} width={148} height={248} rx={2} fill={F} filter="url(#rs)"/>
        <Desk x={235} y={45} w={50} h={22}/>
        <Monitor x={250} y={48}/><Monitor x={268} y={88}/>
        <Chair cx={260} cy={122}/>
        <TargetBoard x={330} y={25}/>
        <TargetBoard x={330} y={55}/>
        {/* Pin board with string connections */}
        <rect x={220} y={22} width={60} height={35} rx={2} fill="#FFF5F5" stroke="#FEB2B2" strokeWidth={0.8}/>
        <text x={250} y={35} textAnchor="middle" style={{fontSize:'5px',fill:'#E53E3E'}}>PROSPECT MAP</text>
        <circle cx={230} cy={45} r={2} fill="#E53E3E"/><circle cx={260} cy={42} r={2} fill="#3182CE"/>
        <line x1={232} y1={45} x2={258} y2={42} stroke="#E53E3E" strokeWidth={0.3}/>
        <Plant cx={225} cy={210} size={9}/>
        <a href="/agents/rex" onMouseEnter={()=>setHovered('rex')} onMouseLeave={()=>setHovered(null)}>
          <AgentAvatar cx={280} cy={175} agent={a.rex} isHovered={hovered==='rex'}/>
        </a>
        <AgentLabel cx={280} cy={210} agent={a.rex}/>
        <WindowStrip x={225} y={12} count={3}/>

        {/* ACE — Sales Closer: Client couch, awards, putting green, slick */}
        <rect x={367} y={12} width={148} height={248} rx={2} fill={F} filter="url(#rs)"/>
        <Desk x={390} y={75} w={48} h={22}/>
        <Monitor x={405} y={78}/>
        <Chair cx={414} cy={112} color="#2D3748"/>
        <Couch x={380} y={170} w={45} h={14} color="#4A5568"/>
        <CoffeeTable x={390} y={155} w={24} h={12}/>
        <PuttingGreen x={440} y={210}/>
        {/* Award plaques on wall */}
        <rect x={378} y={22} width={16} height={20} rx={1} fill="#FEFCBF" stroke="#ECC94B" strokeWidth={0.8}/>
        <rect x={400} y={22} width={16} height={20} rx={1} fill="#FEFCBF" stroke="#ECC94B" strokeWidth={0.8}/>
        <rect x={422} y={22} width={16} height={20} rx={1} fill="#FEFCBF" stroke="#ECC94B" strokeWidth={0.8}/>
        <text x={414} y={50} textAnchor="middle" style={{fontSize:'4.5px',fill:'#B7791F'}}>TOP CLOSER</text>
        <a href="/agents/ace" onMouseEnter={()=>setHovered('ace')} onMouseLeave={()=>setHovered(null)}>
          <AgentAvatar cx={430} cy={130} agent={a.ace} isHovered={hovered==='ace'}/>
        </a>
        <AgentLabel cx={430} cy={155} agent={a.ace}/>
        <WindowStrip x={380} y={12} count={3}/>

        {/* NOVA — Content Writer: Books everywhere, cozy reading nook, sticky notes, warm */}
        <rect x={521} y={12} width={148} height={248} rx={2} fill={F} filter="url(#rs)"/>
        <Desk x={540} y={90} w={46} h={22}/>
        <Monitor x={555} y={93}/>
        <Chair cx={563} cy={126}/>
        <Bookshelf x={645} y={30} w={12} h={50}/>
        <Bookshelf x={645} y={90} w={12} h={40}/>
        <Bookshelf x={530} y={30} w={12} h={40}/>
        <StickyNotes x={570} y={25}/>
        <StickyNotes x={595} y={20}/>
        {/* Cozy reading chair + lamp */}
        <circle cx={560} cy={200} r={14} fill="#B794F4" opacity={0.3}/>
        <Chair cx={560} cy={200} r={10} color="#805AD5"/>
        <circle cx={540} cy={185} r={5} fill="#FEFCBF" opacity={0.4}/>{/* lamp glow */}
        <rect x={538} y={178} width={4} height={12} rx={1} fill="#D69E2E"/>
        <Plant cx={640} cy={200} size={10}/>
        <Rug cx={575} cy={180} rx={30} ry={20} color="#E9D8FD"/>
        <a href="/agents/nova" onMouseEnter={()=>setHovered('nova')} onMouseLeave={()=>setHovered(null)}>
          <AgentAvatar cx={590} cy={170} agent={a.nova} isHovered={hovered==='nova'}/>
        </a>
        <AgentLabel cx={590} cy={205} agent={a.nova}/>
        <WindowStrip x={535} y={12} count={3}/>

        {/* DASH — Analytics: Triple monitor, clean, minimal, data-focused */}
        <rect x={675} y={12} width={148} height={248} rx={2} fill={F} filter="url(#rs)"/>
        <Desk x={695} y={80} w={60} h={24}/>
        <Monitor x={700} y={83} w={16} h={10}/><Monitor x={719} y={83} w={16} h={10}/><Monitor x={738} y={83} w={16} h={10}/>
        <Chair cx={728} cy={120}/>
        {/* Dashboard printout on wall */}
        <rect x={695} y={22} width={50} height={30} rx={2} fill="#EBF8FF" stroke="#90CDF4" strokeWidth={0.8}/>
        <rect x={700} y={28} width={18} height={6} rx={1} fill="#4299E1" opacity={0.4}/>
        <rect x={700} y={37} width={40} height={3} rx={1} fill="#48BB78" opacity={0.4}/>
        <rect x={700} y={43} width={30} height={3} rx={1} fill="#ECC94B" opacity={0.4}/>
        {/* Very clean — just a small plant */}
        <Plant cx={800} cy={210} size={8}/>
        <a href="/agents/dash" onMouseEnter={()=>setHovered('dash')} onMouseLeave={()=>setHovered(null)}>
          <AgentAvatar cx={730} cy={170} agent={a.dash} isHovered={hovered==='dash'}/>
        </a>
        <AgentLabel cx={740} cy={205} agent={a.dash}/>
        <WindowStrip x={690} y={12} count={3}/>

        {/* CONFERENCE ROOM — top right */}
        <rect x={829} y={12} width={220} height={248} rx={2} fill={F} filter="url(#rs)"/>
        <RoomLabel x={939} y={30} text="CONFERENCE ROOM" sub="Agent Handoffs"/>
        {/* Oval conference table */}
        <ellipse cx={939} cy={140} rx={55} ry={32} fill="#B8956A" stroke="#9C7A50" strokeWidth={1.5}/>
        {[0,45,90,135,180,225,270,315].map((ang,i) => {
          const rad=ang*Math.PI/180
          return <Chair key={i} cx={939+70*Math.cos(rad)} cy={140+45*Math.sin(rad)} r={7}/>
        })}
        <Whiteboard x={855} y={22} w={70}/>
        {/* TV screen */}
        <rect x={960} y={22} width={40} height={25} rx={2} fill="#1A1A2E" stroke="#2D3748" strokeWidth={0.8}/>
        <rect x={963} y={25} width={34} height={19} rx={1} fill="#4A90D9" opacity={0.3}/>
        <Plant cx={845} cy={230} size={11}/>
        <Plant cx={1030} cy={230} size={11}/>
        <WindowStrip x={845} y={12} count={5}/>

        {/* ================================================================
            BOTTOM ROW — BACK OFFICE + INFRASTRUCTURE
            ================================================================ */}

        {/* PIXEL — Web Designer: Drawing tablet, art on walls, creative, colorful */}
        <rect x={12} y={319} width={160} height={158} rx={2} fill={F} filter="url(#rs)"/>
        <Desk x={30} y={348} w={50} h={22}/>
        <Monitor x={42} y={351} w={20} h={12}/>
        <Chair cx={55} cy={386}/>
        <DrawingTablet x={95} y={352}/>
        {/* Art canvases on wall */}
        <rect x={25} y={325} width={18} height={14} rx={1} fill="#FEB2B2"/><rect x={48} y={325} width={18} height={14} rx={1} fill="#90CDF4"/>
        <rect x={71} y={325} width={18} height={14} rx={1} fill="#C6F6D5"/><rect x={94} y={325} width={18} height={14} rx={1} fill="#FEFCBF"/>
        <Plant cx={145} cy={440} size={9}/>
        <a href="/agents/pixel" onMouseEnter={()=>setHovered('pixel')} onMouseLeave={()=>setHovered(null)}>
          <AgentAvatar cx={90} cy={430} agent={a.pixel} isHovered={hovered==='pixel'}/>
        </a>
        <AgentLabel cx={90} cy={460} agent={a.pixel}/>

        {/* PRISM — Creative Producer: Camera, green screen backdrop, lights */}
        <rect x={178} y={319} width={160} height={158} rx={2} fill={F} filter="url(#rs)"/>
        <Desk x={200} y={348} w={46} h={22}/>
        <Monitor x={213} y={351} w={18} h={11}/>
        <Chair cx={223} cy={386}/>
        <Camera x={280} y={335}/>
        <RingLight cx={300} cy={370}/>
        {/* Green screen */}
        <rect x={265} y={395} width={55} height={5} rx={1} fill="#48BB78"/>
        <rect x={265} y={395} width={3} height={45} rx={1} fill="#38A169"/>
        <rect x={317} y={395} width={3} height={45} rx={1} fill="#38A169"/>
        <rect x={265} y={400} width={55} height={40} rx={0} fill="#68D391" opacity={0.3}/>
        <a href="/agents/prism" onMouseEnter={()=>setHovered('prism')} onMouseLeave={()=>setHovered(null)}>
          <AgentAvatar cx={240} cy={430} agent={a.prism} isHovered={hovered==='prism'}/>
        </a>
        <AgentLabel cx={240} cy={460} agent={a.prism}/>

        {/* ECHO — Social Media: Dual phones, ring light, trendy plants, bean bag */}
        <rect x={344} y={319} width={160} height={158} rx={2} fill={F} filter="url(#rs)"/>
        <Desk x={365} y={348} w={46} h={22}/>
        <Monitor x={378} y={351}/>
        {/* Phone on desk */}
        <rect x={400} y={355} width={7} height={12} rx={1.5} fill="#1A1A2E" stroke="#2D3748" strokeWidth={0.5}/>
        <Chair cx={388} cy={386}/>
        <RingLight cx={460} cy={360}/>
        {/* Bean bag */}
        <ellipse cx={470} cy={430} rx={18} ry={14} fill="#F687B3" opacity={0.6}/>
        <ellipse cx={470} cy={426} rx={14} ry={10} fill="#FBB6CE" opacity={0.6}/>
        <TallPlant cx={360} cy={435}/>
        <Plant cx={490} cy={450} size={8}/>
        <a href="/agents/echo" onMouseEnter={()=>setHovered('echo')} onMouseLeave={()=>setHovered(null)}>
          <AgentAvatar cx={420} cy={420} agent={a.echo} isHovered={hovered==='echo'}/>
        </a>
        <AgentLabel cx={420} cy={453} agent={a.echo}/>

        {/* SENTRY — QA: Spartan, clinical, no decorations, filing cabinet, checklist board */}
        <rect x={510} y={319} width={155} height={158} rx={2} fill={F} filter="url(#rs)"/>
        <Desk x={530} y={355} w={50} h={22}/>
        <Monitor x={545} y={358}/>
        <Chair cx={555} cy={392}/>
        <FilingCabinet x={625} y={340}/>
        <ShieldBadge x={535} y={325}/>
        {/* Checklist on wall */}
        <rect x={565} y={325} width={35} height={25} rx={1} fill="#FFFFF0" stroke="#ECC94B" strokeWidth={0.8}/>
        {[0,1,2,3].map(i => (
          <g key={i}><rect x={569} y={330+i*5} width={3} height={3} rx={0.5} fill={i<2?'#48BB78':'#E2E8F0'} stroke="#A0AEC0" strokeWidth={0.3}/>
          <line x1={575} y1={332+i*5} x2={593} y2={332+i*5} stroke="#CBD5E0" strokeWidth={0.5}/></g>
        ))}
        {/* No plants, no couch — spartan */}
        <a href="/agents/sentry" onMouseEnter={()=>setHovered('sentry')} onMouseLeave={()=>setHovered(null)}>
          <AgentAvatar cx={575} cy={435} agent={a.sentry} isHovered={hovered==='sentry'}/>
        </a>
        <AgentLabel cx={575} cy={460} agent={a.sentry}/>

        {/* SHELF — Store Manager: Shelves with products, boxes, inventory */}
        <rect x={12} y={483} width={160} height={165} rx={2} fill={F} filter="url(#rs)"/>
        <Desk x={30} y={515} w={46} h={22}/>
        <Monitor x={43} y={518}/>
        <Chair cx={53} cy={550}/>
        {/* Product shelves */}
        {[0,1,2].map(i => (
          <g key={i}>
            <rect x={105} y={500+i*18} width={50} height={12} rx={2} fill="#B8956A" stroke="#9C7A50" strokeWidth={0.8}/>
            {[0,1,2,3].map(j => (
              <rect key={j} x={110+j*12} y={502+i*18} width={8} height={8} rx={1}
                fill={['#F687B3','#63B3ED','#68D391','#F6AD55'][j]} opacity={0.6}/>
            ))}
          </g>
        ))}
        <PackageBoxes x={30} y={580}/>
        <a href="/agents/shelf" onMouseEnter={()=>setHovered('shelf')} onMouseLeave={()=>setHovered(null)}>
          <AgentAvatar cx={85} cy={600} agent={a.shelf} isHovered={hovered==='shelf'}/>
        </a>
        <AgentLabel cx={85} cy={630} agent={a.shelf}/>
        <WindowStrip x={30} y={H-10} count={3}/>

        {/* BREAK ROOM */}
        <rect x={178} y={483} width={220} height={165} rx={2} fill={F} filter="url(#rs)"/>
        <RoomLabel x={288} y={498} text="BREAK ROOM" sub="Recharge Zone"/>
        <circle cx={260} cy={565} r={20} fill="#B8956A" stroke="#9C7A50" strokeWidth={1.2}/>
        {[0,90,180,270].map((ang,i) => {
          const rad=ang*Math.PI/180
          return <Chair key={i} cx={260+30*Math.cos(rad)} cy={565+30*Math.sin(rad)} r={6.5}/>
        })}
        {/* Coffee machine */}
        <rect x={355} y={510} width={16} height={20} rx={2} fill="#4A5568" stroke="#2D3748" strokeWidth={0.8}/>
        <circle cx={363} cy={524} r={2.5} fill="#E53E3E" opacity={0.7}/>
        <Couch x={190} y={510} w={40} h={14} color="#805AD5"/>
        <Plant cx={375} cy={610} size={10}/>
        <WindowStrip x={200} y={H-10} count={5}/>

        {/* CORTEX — Orchestrator/COO: Big office, status boards, organized command post */}
        <rect x={404} y={483} width={260} height={165} rx={2} fill={F} filter="url(#rs)"/>
        <LDesk x={430} y={520} flip={true}/>
        <Monitor x={445} y={523} w={18} h={11}/><Monitor x={467} y={523} w={18} h={11}/>
        <Chair cx={455} cy={570} r={9}/>
        {/* Big status board */}
        <rect x={540} y={495} width={100} height={55} rx={3} fill="#EDF2F7" stroke="#CBD5E0" strokeWidth={1}/>
        <text x={590} y={508} textAnchor="middle" style={{fontSize:'6px',fill:'#718096',fontWeight:700,letterSpacing:'0.5px'}}>OPERATIONS BOARD</text>
        {[0,1,2,3].map(i => (
          <g key={i}>
            <rect x={548} y={514+i*9} width={8} height={6} rx={1} fill={['#48BB78','#48BB78','#ECC94B','#4299E1'][i]} opacity={0.6}/>
            <rect x={560} y={515+i*9} width={65} height={4} rx={1} fill="#E2E8F0"/>
          </g>
        ))}
        <TallPlant cx={420} cy={615}/>
        <Plant cx={645} cy={620} size={9}/>
        <Rug cx={500} cy={575} rx={40} ry={25} color="#C3DAFE"/>
        <a href="/agents/cortex" onMouseEnter={()=>setHovered('cortex')} onMouseLeave={()=>setHovered(null)}>
          <AgentAvatar cx={520} cy={600} agent={a.cortex} isHovered={hovered==='cortex'}/>
        </a>
        <AgentLabel cx={520} cy={630} agent={a.cortex}/>
        <WindowStrip x={420} y={H-10} count={6}/>

        {/* SERVER ROOM — Flux's domain */}
        <rect x={671} y={319} width={165} height={158} rx={2} fill="#EDEBE6" filter="url(#rs)"/>
        <RoomLabel x={753} y={336} text="SERVER ROOM" sub="Infrastructure"/>
        <ServerRack x={690} y={355}/><ServerRack x={715} y={355}/><ServerRack x={740} y={355}/><ServerRack x={765} y={355}/>
        {/* AC unit */}
        <rect x={800} y={360} width={18} height={28} rx={3} fill="#A0AEC0" stroke="#718096" strokeWidth={0.8}/>
        <text x={809} y={378} textAnchor="middle" style={{fontSize:'6px',fill:'#4A5568'}}>AC</text>
        {/* Cables on floor */}
        <path d="M700 400 Q720 410 740 400 Q760 390 780 400" fill="none" stroke="#4A5568" strokeWidth={1} opacity={0.3}/>
        <a href="/agents/flux" onMouseEnter={()=>setHovered('flux')} onMouseLeave={()=>setHovered(null)}>
          <AgentAvatar cx={730} cy={440} agent={a.flux} isHovered={hovered==='flux'}/>
        </a>
        <AgentLabel cx={730} cy={460} agent={a.flux}/>

        {/* LEDGER — Finance/CFO: Filing cabinets, safe, calculator, very professional */}
        <rect x={671} y={483} width={165} height={165} rx={2} fill={F} filter="url(#rs)"/>
        <Desk x={695} y={520} w={50} h={22}/>
        <Monitor x={710} y={523}/>
        <Chair cx={720} cy={558}/>
        <FilingCabinet x={780} y={500}/>
        <FilingCabinet x={805} y={500}/>
        <Safe x={790} y={600}/>
        {/* Calculator */}
        <rect x={750} y={525} width={12} height={16} rx={1} fill="#E2E8F0" stroke="#CBD5E0" strokeWidth={0.5}/>
        <rect x={752} y={527} width={8} height={4} rx={0.5} fill="#C6F6D5"/>
        {/* No decorations — professional */}
        <a href="/agents/ledger" onMouseEnter={()=>setHovered('ledger')} onMouseLeave={()=>setHovered(null)}>
          <AgentAvatar cx={730} cy={600} agent={a.ledger} isHovered={hovered==='ledger'}/>
        </a>
        <AgentLabel cx={730} cy={630} agent={a.ledger}/>
        <WindowStrip x={W-10} y={500} count={4} vertical={true}/>

        {/* Right side windows */}
        <WindowStrip x={W-10} y={40} count={5} vertical={true}/>
        <WindowStrip x={W-10} y={335} count={4} vertical={true}/>

        {/* Left side windows */}
        <WindowStrip x={10} y={335} count={3} vertical={true}/>
        <WindowStrip x={10} y={500} count={3} vertical={true}/>

        {/* LEGEND — bottom right */}
        <rect x={842} y={483} width={206} height={165} rx={2} fill={F} filter="url(#rs)"/>
        <text x={945} y={502} textAnchor="middle" style={{fontFamily:'var(--font-heading)',fontWeight:700,fontSize:'9px',fill:'#1A1A2E'}}>FLOOR LEGEND</text>
        <line x1={870} y1={508} x2={1020} y2={508} stroke="#E2E8F0" strokeWidth={0.5}/>
        <circle cx={870} cy={525} r={4} fill="#48BB78"/><text x={880} y={528} style={{fontSize:'8px',fill:'#4A5568'}}>Active / Working</text>
        <circle cx={870} cy={542} r={4} fill="#ECC94B"/><text x={880} y={545} style={{fontSize:'8px',fill:'#4A5568'}}>Paused</text>
        <circle cx={870} cy={559} r={4} fill="#A0AEC0"/><text x={880} y={562} style={{fontSize:'8px',fill:'#4A5568'}}>Idle / Offline</text>
        <rect x={866} y={572} width={8} height={8} rx={1} fill="#BEE3F8" opacity={0.8}/><text x={880} y={580} style={{fontSize:'8px',fill:'#4A5568'}}>Windows</text>
        <rect x={866} y={588} width={8} height={6} rx={1} fill="#D4A574"/><text x={880} y={594} style={{fontSize:'8px',fill:'#4A5568'}}>Desk / Furniture</text>
        <Plant cx={870} cy={610} size={6}/><text x={880} y={613} style={{fontSize:'8px',fill:'#4A5568'}}>Plant</text>
        <text x={945} y={638} textAnchor="middle" style={{fontSize:'6.5px',fill:'#CBD5E0',letterSpacing:'0.5px'}}>SMVP AUTO-OFFICE HQ v1.0</text>
      </svg>
    </div>
  )
}

function PipelineView() {
  const stages = ['Research', 'Outreach', 'Proposal', 'Closing', 'Delivery']
  return (
    <div className="card" style={{ padding: '24px' }}>
      <div className="card-header">
        <h3 className="card-title">Pipeline Overview</h3>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Drag tasks between stages</span>
      </div>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
        {stages.map(stage => (
          <div key={stage} style={{
            flex: '1', minWidth: '180px', background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)', padding: '16px',
          }}>
            <div style={{
              fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '13px',
              marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid var(--accent-blue)',
              display: 'flex', justifyContent: 'space-between',
            }}>
              {stage}
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>0</span>
            </div>
            <div className="empty-state" style={{ padding: '24px 12px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No tasks yet</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
