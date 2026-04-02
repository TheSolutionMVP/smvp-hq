'use client'
import { useState } from 'react'

const SECTIONS = [
  {
    id: 'quickstart',
    icon: '🚀',
    title: 'Quick Start',
    subtitle: 'Get up and running in 5 minutes',
    content: [
      {
        heading: 'Step 1: Open Your Dashboard',
        text: 'Your HQ is a live website hosted on Vercel. Open it from any device — PC, laptop, iPad, phone. Bookmark it. No installs needed.',
      },
      {
        heading: 'Step 2: Understand the Layout',
        text: 'Dashboard = live stats overview. Pipeline = your sales funnel. Streams = 5 revenue tracks. Agents = your AI team. Command = direct agent orders. Playbook = you are here.',
      },
      {
        heading: 'Step 3: Activate Your First Agent',
        text: 'Go to Command Center. Click "Activate Rex" to start a lead generation sweep. Copy the agent prompt from the Agents page into Claude or ChatGPT. Paste the results back into your Supabase tables.',
      },
      {
        heading: 'Step 4: Track Progress',
        text: 'All data flows into Supabase and shows up on your dashboard in real-time. Revenue, leads, pipeline deals, deliverables — everything updates live across all your devices.',
      },
    ],
  },
  {
    id: 'agents',
    icon: '🤖',
    title: 'Agent Playbook',
    subtitle: 'How to use each agent and when',
    content: [
      {
        heading: 'Rex — Research & Prospecting 🔍',
        text: 'USE WHEN: You need new leads or market data. Rex finds local businesses without websites, validates Etsy niches, researches competitors. OUTPUT: Lead list with business name, location, contact info, and website status. HANDOFF: Pass leads to Ace for outreach.',
      },
      {
        heading: 'Ace — Sales & Outreach 🤝',
        text: 'USE WHEN: You have leads ready for contact. Ace drafts cold emails, follow-up sequences, proposals, and tracks deal stages. OUTPUT: Email drafts, proposals, pipeline updates. HANDOFF: Closed deals go to Pixel for building.',
      },
      {
        heading: 'Pixel — Product Designer 🎨',
        text: 'USE WHEN: You need to build something visual. Client websites, Etsy product graphics, Canva templates, mockups. OUTPUT: Code, design files, or image prompts. HANDOFF: Finished products go to Flux for deployment.',
      },
      {
        heading: 'Nova — Content & Marketing ✍️',
        text: 'USE WHEN: You need words that sell. SEO listings, TikTok scripts, email sequences, social captions, pitch decks. OUTPUT: Ready-to-publish content. HANDOFF: Content goes to Flux for logging or Ace for sending.',
      },
      {
        heading: 'Flux — Operations & Delivery ⚙️',
        text: 'USE WHEN: Something needs to go live. Flux deploys to Vercel, pushes code to GitHub, records deliverables in Supabase, tracks delivery status. OUTPUT: Deployed products, logged records. HANDOFF: Completed work goes to Dash for revenue tracking.',
      },
      {
        heading: 'Dash — Analytics & Growth 📈',
        text: 'USE WHEN: You need the big picture. Weekly reports, revenue breakdowns, stream activation recommendations, growth analysis. OUTPUT: Insights and action items. HANDOFF: Routes recommendations to the correct agent.',
      },
    ],
  },
  {
    id: 'workflows',
    icon: '🔄',
    title: 'Standard Workflows',
    subtitle: 'Step-by-step playbooks for common operations',
    content: [
      {
        heading: 'Workflow: Land a New Web Design Client',
        text: '1. Rex → Find 10 local businesses without websites in target area\n2. Ace → Draft personalized cold emails for top 5 prospects\n3. YOU → Review & approve emails in Approval Queue\n4. Ace → Send emails, track responses in Pipeline\n5. Pixel → Build demo site for interested prospect\n6. Ace → Send proposal with demo link\n7. Flux → Deploy final site, log deliverable\n8. Dash → Record revenue, update stream progress',
      },
      {
        heading: 'Workflow: Launch an Etsy Digital Product',
        text: '1. Rex → Research trending niches, validate demand\n2. Pixel → Design the product (planner, template, printable)\n3. Nova → Write SEO-optimized listing title + description\n4. Flux → Upload to Etsy, log in deliverables\n5. Nova → Create social media posts to promote\n6. Dash → Track sales, recommend optimizations',
      },
      {
        heading: 'Workflow: Weekly CEO Brief',
        text: '1. Dash → Pull all data from Supabase tables\n2. Dash → Generate revenue report by stream\n3. Dash → Identify which stream is closest to $500/mo unlock\n4. Dash → Recommend top 3 actions for the week\n5. YOU → Review brief, adjust priorities, activate agents',
      },
    ],
  },
  {
    id: 'streams',
    icon: '💰',
    title: 'Revenue Stream Guide',
    subtitle: 'How each stream works and unlocks',
    content: [
      {
        heading: 'The $500 Rule',
        text: 'Each stream unlocks the next when it hits $500/mo. This prevents spreading too thin. Focus on one stream at a time until it is generating consistent revenue, then expand.',
      },
      {
        heading: 'Stream 1: Web Design ($500-$1,500/build)',
        text: 'STATUS: Active. Your bread and butter. Rex finds businesses, Ace pitches them, Pixel builds the site, Flux deploys. Target: 1-3 clients/month.',
      },
      {
        heading: 'Stream 2: Etsy Digital ($5-$50/product)',
        text: 'STATUS: Active. Passive income from digital downloads. Pixel designs, Nova writes listings, Flux uploads. Target: 20+ products generating $500/mo combined.',
      },
      {
        heading: 'Stream 3: Canva Templates ($10-$30/pack)',
        text: 'STATUS: Locked (unlocks when Stream 2 hits $500/mo). Social media kits, pitch decks, resume packs. Higher margins than Stream 2.',
      },
      {
        heading: 'Stream 4: Etsy Physical ($15-$40/item)',
        text: 'STATUS: Locked (unlocks when Stream 3 hits $500/mo). Print-on-demand via Printify. Mugs, shirts, totes. Zero inventory risk.',
      },
      {
        heading: 'Stream 5: TikTok Affiliate ($varies)',
        text: 'STATUS: Locked (unlocks when Stream 4 hits $500/mo). Video content + affiliate links. Highest scale potential — passive income engine.',
      },
    ],
  },
  {
    id: 'devices',
    icon: '📱',
    title: 'Multi-Device Setup',
    subtitle: 'Access HQ from any device, anywhere',
    content: [
      {
        heading: 'No Install Required',
        text: 'Your dashboard is a website hosted on Vercel. Open the URL on any browser — Chrome, Safari, Firefox — on any device. Data syncs in real-time via Supabase. What you see on your PC is the same as your phone.',
      },
      {
        heading: 'Bookmark It',
        text: 'On iPhone/iPad: Open in Safari → Share → Add to Home Screen. It will look and feel like a native app. On Android: Chrome → Menu → Add to Home Screen. On Desktop: Bookmark the URL or pin the tab.',
      },
      {
        heading: 'For Developers (Git Clone)',
        text: 'If you want to run a local copy or make code changes:\n\n  git clone https://github.com/TheSolutionMVP/smvp-hq.git\n  cd smvp-hq/dashboard\n  npm install\n  cp .env.example .env.local\n  # Add your Supabase URL and anon key to .env.local\n  npm run dev\n\nLocal copy runs at http://localhost:3000 and connects to the same Supabase database.',
      },
      {
        heading: 'Data is Always in Sync',
        text: 'All devices read/write from the same Supabase database. Approve a deal on your phone, it shows up on your PC instantly. No syncing, no conflicts, no delays.',
      },
    ],
  },
  {
    id: 'ideas',
    icon: '💡',
    title: 'Launch a New Idea',
    subtitle: 'Framework for evaluating and executing new revenue ideas',
    content: [
      {
        heading: 'The SMVP Idea Framework',
        text: 'Before launching anything new, run it through this filter:\n\n• SCALABLE — Can it grow without you doing more work?\n• MEASURABLE — Can you track revenue clearly?\n• VALIDATED — Is there proven demand?\n• PROFITABLE — Does it hit $500/mo within 90 days?',
      },
      {
        heading: 'Step 1: Research',
        text: 'Activate Rex with your idea. Ask Rex to validate demand, find competitors, estimate pricing, and identify your target customer. If Rex comes back with strong signals, proceed.',
      },
      {
        heading: 'Step 2: Build',
        text: 'Activate Pixel to build the product or MVP. Activate Nova to create the listing, landing page, or marketing copy. Keep it lean — ship fast, iterate later.',
      },
      {
        heading: 'Step 3: Sell',
        text: 'Activate Ace to draft outreach or set up the sales funnel. Activate Nova for social media promotion. Track everything in Pipeline.',
      },
      {
        heading: 'Step 4: Measure',
        text: 'Activate Dash after 2-4 weeks. Is it trending toward $500/mo? If yes, double down. If no, pivot or kill it. No emotional attachment — trust the data.',
      },
    ],
  },
]

export default function PlaybookPage() {
  const [activeSection, setActiveSection] = useState('quickstart')
  const [expandedItems, setExpandedItems] = useState({})

  const currentSection = SECTIONS.find(s => s.id === activeSection)

  function toggleItem(index) {
    setExpandedItems(prev => ({
      ...prev,
      [activeSection + '-' + index]: !prev[activeSection + '-' + index]
    }))
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Playbook</h1>
        <p className="page-subtitle">Your operating manual — how to run SMVP Auto-Office like a CEO</p>
      </div>

      {/* Section Nav */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {SECTIONS.map(section => (
          <button
            key={section.id}
            className={`btn ${activeSection === section.id ? 'btn-primary' : 'btn-skip'}`}
            onClick={() => setActiveSection(section.id)}
            style={{ fontSize: '13px' }}
          >
            {section.icon} {section.title}
          </button>
        ))}
      </div>

      {/* Active Section */}
      {currentSection && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ fontSize: '18px' }}>
                {currentSection.icon} {currentSection.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {currentSection.subtitle}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentSection.content.map((item, i) => {
              const isExpanded = expandedItems[activeSection + '-' + i]
              return (
                <div
                  key={i}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                  }}
                  onClick={() => toggleItem(i)}
                >
                  <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{item.heading}</span>
                    <span style={{
                      fontSize: '18px',
                      color: 'var(--text-muted)',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s ease',
                    }}>
                      ▾
                    </span>
                  </div>
                  {isExpanded && (
                    <div style={{
                      padding: '0 20px 16px 20px',
                      fontSize: '13px',
                      lineHeight: '1.8',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-line',
                    }}>
                      {item.text}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
