import { useMemo, useState } from 'react'
import './App.css'
import {
  INITIAL_ALERTS,
  INITIAL_ROOMS,
  PROJECTION,
  SITE,
  STAFF,
  TIME_BLOCKS,
  buildInitialCells,
  type Alert,
  type Cell,
  type Room,
} from './data'

type Tab = 'overview' | 'board' | 'inventory' | 'export' | 'roadmap'
type DismissReason = 'Wrong' | 'Already knew' | 'Not actionable' | "Don't trust"

const DISMISS_REASONS: DismissReason[] = [
  'Wrong',
  'Already knew',
  'Not actionable',
  "Don't trust",
]

export default function App() {
  const [tab, setTab] = useState<Tab>('overview')
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS)
  const [cells, setCells] = useState<Cell[]>(() => buildInitialCells(INITIAL_ROOMS))
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS)
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [dismissMode, setDismissMode] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [appliedReaderFix, setAppliedReaderFix] = useState(false)

  const activeAlert = alerts.find((a) => a.id === activeAlertId) ?? null
  const maxProj = Math.max(...PROJECTION.map((p) => p.value))

  const planStatus = useMemo(() => {
    if (alerts.some((a) => a.severity === 'shortfall')) return 'At risk'
    return 'Feasible'
  }, [alerts])

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2800)
  }

  const openAlert = (id: string) => {
    setActiveAlertId(id)
    setConfirming(false)
    setDismissMode(false)
  }

  const closePanel = () => {
    setActiveAlertId(null)
    setConfirming(false)
    setDismissMode(false)
  }

  const applyReaderFix = () => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === 'music' ? { ...r, flags: { ...r.flags, closed: false } } : r,
      ),
    )
    setCells((prev) =>
      prev.map((c) => {
        if (c.roomId !== 'music') return c
        if (c.blockId === 'thu-pm') {
          return {
            ...c,
            exams: 4,
            reader: 4,
            status: 'ok',
          }
        }
        return { ...c, status: 'empty', exams: 0, reader: 0, scribe: 0 }
      }),
    )
    // Ease pressure on PEC 3 thu-pm
    setCells((prev) =>
      prev.map((c) =>
        c.roomId === 'pec3' && c.blockId === 'thu-pm'
          ? { ...c, exams: 6, reader: 1, status: 'ok' }
          : c,
      ),
    )
    setAlerts((prev) => prev.filter((a) => a.id !== 'reader-thu'))
    setAppliedReaderFix(true)
    closePanel()
    setTab('board')
    showToast('Plan updated — Music Closet open Thu 1–3 (reader-capable). Staff not notified until you send.')
  }

  const dismissAlert = (reason: DismissReason) => {
    if (!activeAlert) return
    setAlerts((prev) => prev.filter((a) => a.id !== activeAlert.id))
    closePanel()
    showToast(`Alert dismissed (${reason}) — logged for CS review`)
  }

  const exportCsv = () => {
    const header = ['room', 'block', 'exams', 'reader', 'scribe', 'status']
    const lines = [header.join(',')]
    for (const c of cells) {
      const room = rooms.find((r) => r.id === c.roomId)?.name ?? c.roomId
      const block = TIME_BLOCKS.find((b) => b.id === c.blockId)?.label ?? c.blockId
      lines.push([room, block, c.exams, c.reader, c.scribe, c.status].join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'surge-plan-summary.csv'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Downloaded (mock) — surge-plan-summary.csv')
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">RB</span>
          <div>
            <div className="product">RegisterBuddy — Surge Planning</div>
            <div className="meta">
              {SITE.name} · {SITE.surge} · {SITE.range}
            </div>
          </div>
        </div>
        <div className="persona">Signed in as {SITE.director} · Director</div>
      </header>

      <nav className="tabs">
        {(
          [
            ['overview', 'Overview'],
            ['board', 'Plan board'],
            ['inventory', 'Inventory'],
            ['export', 'Export'],
            ['roadmap', 'Roadmap'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? 'tab active' : 'tab'}
            onClick={() => setTab(id)}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === 'overview' && (
          <Overview
            planStatus={planStatus}
            alerts={alerts}
            maxProj={maxProj}
            appliedReaderFix={appliedReaderFix}
            onReview={openAlert}
          />
        )}
        {tab === 'board' && <PlanBoard rooms={rooms} cells={cells} />}
        {tab === 'inventory' && <Inventory rooms={rooms} />}
        {tab === 'export' && (
          <ExportPanel onExport={exportCsv} appliedReaderFix={appliedReaderFix} />
        )}
        {tab === 'roadmap' && <Roadmap />}
      </main>

      {activeAlert && (
        <aside className="drawer" role="dialog" aria-label="Alert detail">
          <div className="drawer-head">
            <span className={`pill ${activeAlert.severity}`}>
              {activeAlert.severity === 'shortfall' ? 'Shortfall' : 'Under-use'}
            </span>
            <button type="button" className="icon-btn" onClick={closePanel} aria-label="Close">
              ×
            </button>
          </div>
          <h2>{activeAlert.title}</h2>
          <p className="when">{activeAlert.when}</p>
          <p className="gap">{activeAlert.gap}</p>

          <h3>Why</h3>
          <ul className="why">
            {activeAlert.why.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>

          <h3>Suggested action</h3>
          <div className="suggestion">
            <strong>{activeAlert.suggestion}</strong>
            <p>{activeAlert.suggestionDetail}</p>
          </div>

          {!confirming && !dismissMode && (
            <div className="actions">
              <button type="button" className="btn primary" onClick={() => setConfirming(true)}>
                Accept suggestion
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => showToast('Edit is mocked — adjust on Plan board in a full build')}
              >
                Edit
              </button>
              <button type="button" className="btn ghost" onClick={() => setDismissMode(true)}>
                Dismiss
              </button>
            </div>
          )}

          {confirming && (
            <div className="confirm-box">
              <p>
                <strong>Apply to plan?</strong> This updates the surge plan only. It does{' '}
                <em>not</em> auto-notify staff until you confirm a send later.
              </p>
              <div className="actions">
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => {
                    if (activeAlert?.id === 'reader-thu') applyReaderFix()
                    else {
                      setAlerts((prev) => prev.filter((a) => a.id !== activeAlert?.id))
                      closePanel()
                      showToast('Suggestion applied to plan (mock) — staff not notified yet')
                    }
                  }}
                >
                  Apply to plan
                </button>
                <button type="button" className="btn ghost" onClick={() => setConfirming(false)}>
                  Back
                </button>
              </div>
            </div>
          )}

          {dismissMode && (
            <div className="dismiss-box">
              <p>Why dismiss? (logged for CS)</p>
              <div className="chips">
                {DISMISS_REASONS.map((r) => (
                  <button key={r} type="button" className="chip" onClick={() => dismissAlert(r)}>
                    {r}
                  </button>
                ))}
              </div>
              <button type="button" className="btn ghost" onClick={() => setDismissMode(false)}>
                Back
              </button>
            </div>
          )}
        </aside>
      )}

      {activeAlert && <div className="backdrop" onClick={closePanel} />}

      {toast && <div className="toast">{toast}</div>}

      <footer className="foot">
        Mock prototype for Beacon PM case study — not production · No real student data
      </footer>
    </div>
  )
}

function Overview({
  planStatus,
  alerts,
  maxProj,
  appliedReaderFix,
  onReview,
}: {
  planStatus: string
  alerts: Alert[]
  maxProj: number
  appliedReaderFix: boolean
  onReview: (id: string) => void
}) {
  return (
    <div className="overview">
      <section className="cards">
        <div className="card">
          <div className="label">Peak day load</div>
          <div className="value">Thu · 94</div>
          <div className="sub">Index vs typical week</div>
        </div>
        <div className="card">
          <div className="label">Accommodation-short blocks</div>
          <div className="value">{appliedReaderFix ? '0' : '1'}</div>
          <div className="sub">{appliedReaderFix ? 'Reader gap resolved' : 'Thu 1–3 reader seats'}</div>
        </div>
        <div className="card">
          <div className="label">Plan status</div>
          <div className={`value status ${planStatus === 'At risk' ? 'risk' : 'ok'}`}>
            {appliedReaderFix && alerts.length === 0 ? 'Feasible' : planStatus}
          </div>
          <div className="sub">Human confirm required for ADA changes</div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          Projection input
          <span className="hint">Based on last 3 finals + current bookings</span>
        </div>
        <div className="proj">
          {PROJECTION.map((p) => (
            <div key={p.day} className="proj-col">
              <div className="bar-wrap">
                <div
                  className={`bar ${p.day === 'Thu' ? 'peak' : ''}`}
                  style={{ height: `${(p.value / maxProj) * 100}%` }}
                />
              </div>
              <div className="day">{p.day}</div>
              <div className="num">{p.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          Alerts
          <span className="hint">{alerts.length} open</span>
        </div>
        {alerts.length === 0 ? (
          <p className="empty">No open alerts — plan looks feasible for this mock window.</p>
        ) : (
          <ul className="alert-list">
            {alerts.map((a) => (
              <li key={a.id} className={`alert-row ${a.severity}`}>
                <div>
                  <div className="alert-title">{a.title}</div>
                  <div className="alert-meta">
                    {a.when} · {a.gap}
                  </div>
                </div>
                <button type="button" className="btn primary sm" onClick={() => onReview(a.id)}>
                  Review
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function PlanBoard({ rooms, cells }: { rooms: Room[]; cells: Cell[] }) {
  const getCell = (roomId: string, blockId: string) =>
    cells.find((c) => c.roomId === roomId && c.blockId === blockId)

  return (
    <div className="board-wrap">
      <div className="legend">
        <span>
          <i className="swatch ok" /> OK
        </span>
        <span>
          <i className="swatch tight" /> Tight
        </span>
        <span>
          <i className="swatch over" /> Over
        </span>
        <span>
          <i className="swatch closed" /> Closed
        </span>
        <span className="tag">Reader</span>
        <span className="tag">Scribe</span>
        <span className="tag spill">Spillover</span>
      </div>
      <div className="board-scroll">
        <table className="board">
          <thead>
            <tr>
              <th>Room</th>
              {TIME_BLOCKS.map((b) => (
                <th key={b.id} className={b.id === 'thu-pm' ? 'highlight' : ''}>
                  {b.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <th>
                  <div className="room-name">{room.name}</div>
                  <div className="room-flags">
                    {room.flags.readerCapable && <span className="tag">Reader</span>}
                    {room.flags.scribeCapable && <span className="tag">Scribe</span>}
                    {room.flags.spillover && <span className="tag spill">Spillover</span>}
                    <span className="seats">{room.seats} seats</span>
                  </div>
                </th>
                {TIME_BLOCKS.map((b) => {
                  const c = getCell(room.id, b.id)
                  if (!c) return <td key={b.id} />
                  return (
                    <td key={b.id} className={`cell ${c.status}`}>
                      {c.status === 'closed' ? (
                        <span className="muted">Closed</span>
                      ) : c.status === 'empty' && c.exams === 0 ? (
                        <span className="muted">—</span>
                      ) : (
                        <>
                          <div className="exams">
                            {c.exams} exams
                            {c.reader > 0 ? ` · ${c.reader} reader` : ''}
                            {c.scribe > 0 ? ` · ${c.scribe} scribe` : ''}
                          </div>
                        </>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">
        Aggregates only (no student names). 2-hour blocks for the prototype — production would use
        your 10-minute stagger grid.
      </p>
    </div>
  )
}

function Inventory({ rooms }: { rooms: Room[] }) {
  return (
    <div className="inventory">
      <section className="panel">
        <div className="panel-title">Rooms</div>
        <table className="inv-table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Seats</th>
              <th>Flags</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.seats}</td>
                <td>
                  {r.flags.readerCapable && <span className="tag">Reader</span>}
                  {r.flags.scribeCapable && <span className="tag">Scribe</span>}
                  {r.flags.spillover && <span className="tag spill">Spillover</span>}
                  {!r.flags.readerCapable &&
                    !r.flags.scribeCapable &&
                    !r.flags.spillover &&
                    '—'}
                </td>
                <td>{r.flags.closed ? 'Closed in plan' : 'Open'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="panel">
        <div className="panel-title">Staff pools</div>
        <ul className="staff">
          <li>
            <strong>{STAFF.proctors}</strong> proctors
          </li>
          <li>
            <strong>{STAFF.studentWorkers}</strong> student workers
          </li>
          <li>
            <strong>{STAFF.readerQualified}</strong> reader-qualified
          </li>
          <li className="hours">{STAFF.hours}</li>
        </ul>
      </section>
    </div>
  )
}

function ExportPanel({
  onExport,
  appliedReaderFix,
}: {
  onExport: () => void
  appliedReaderFix: boolean
}) {
  return (
    <div className="panel export">
      <div className="panel-title">Export plan summary</div>
      <p>
        v1 keeps exports so teams can migrate off Excel gradually. This downloads a CSV of the
        current room × block plan (mock).
      </p>
      <p className="sub">
        Current plan: {appliedReaderFix ? 'Music Closet open Thu 1–3 (reader fix applied)' : 'Music Closet closed · reader shortfall alert open'}
      </p>
      <button type="button" className="btn primary" onClick={onExport}>
        Export plan summary (CSV)
      </button>
    </div>
  )
}

function Roadmap() {
  const phases = [
    {
      id: '0',
      title: 'Phase 0 — Validate',
      status: 'Gate',
      intent: 'CEO feature request → pressure-test real pain + retention/growth path',
      ships: 'Discovery, named-account evidence, go/no-go (not a product ship)',
      success: [
        'Winning problem letter (exports vs forecast vs allocation vs day-of vs budget)',
        'Commercial path: retention risk and/or Essentials/expand lever',
      ],
      kill: 'No commercial path → defer; day-of/budget-only → separate thin bet',
    },
    {
      id: '1',
      title: 'Phase 1 — Finals Pack',
      status: 'Learn cheap',
      intent: 'Is value mostly getting data out of RB?',
      ships: 'Surge exports, saved views, Excel/Google template, optional dean snapshot',
      success: [
        '↓ ≥30% time to assemble finals plan pack',
        '↓ “can’t get data” CS tickets in partner cohort',
        'Track % still needing heavy custom Excel',
      ],
      kill: 'Pack alone satisfies + no deeper commercial story → stop before AI service',
    },
    {
      id: '2',
      title: 'Phase 2 — Projection + alerts',
      status: 'In this prototype',
      intent: 'Does trusted early visibility change decisions? (CEO-shaped, trust-first)',
      ships: 'Inventory, rules/seasonality projection, over/under alerts, Why, confirm',
      success: [
        'Alert action rate clears partner floor',
        '↓ planning hours vs Phase 1 baseline',
        '↓ over/under incidents (or proxies)',
      ],
      kill: 'Ignored alerts, trust collapse, or no behavior change',
    },
    {
      id: '3',
      title: 'Phase 3 — Allocation workspace',
      status: 'In this prototype',
      intent: 'Does placing constrained resources retire Excel?',
      ships: 'Plan board, accommodation constraints, suggested remedies + confirm, export escape',
      success: [
        'Primary plan lives in RB for design partners',
        '↑ feasible plans before week-of',
        '↓ accommodation shortfalls; ↓ planning exports',
      ],
      kill: 'Excel still canonical; ADA trust incidents; no keep/expand narrative',
    },
    {
      id: '4',
      title: 'Phase 4 — Optimize + Capacity Pro',
      status: 'Only if lift',
      intent: 'ML/monetization only after baseline earns trust',
      ships: 'Models that beat Phase 2 baseline, multi-site, paid ladder',
      success: [
        'Measured lift vs rules baseline',
        'Paid attach / NDR evidence',
        'No regression on trust counters',
      ],
      kill: 'No lift over baseline → stay on Phase 2–3; no showcase ML',
    },
  ]

  return (
    <div className="roadmap">
      <section className="panel">
        <div className="panel-title">Phased plan</div>
        <p className="roadmap-lead">
          CEO ask = feature request to pressure-test. Each phase has success metrics and a kill
          gate before we add surface area. This UI demos Phase 2–3; written plan still requires
          Phase 0–1 gates first.
        </p>
        <div className="phase-flow">
          {['0 Validate', '1 Finals Pack', '2 Alerts', '3 Allocation', '4 Optimize'].map((s, i) => (
            <span key={s} className="phase-chip">
              {i > 0 && <span className="phase-arrow">→</span>}
              {s}
            </span>
          ))}
        </div>
      </section>
      {phases.map((p) => (
        <section key={p.id} className={`panel phase-card phase-${p.id}`}>
          <div className="phase-head">
            <h3>{p.title}</h3>
            <span className="phase-status">{p.status}</span>
          </div>
          <p className="phase-intent">{p.intent}</p>
          <div className="phase-grid">
            <div>
              <div className="phase-label">Ships</div>
              <p>{p.ships}</p>
            </div>
            <div>
              <div className="phase-label">Success metrics</div>
              <ul>
                {p.success.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="phase-label">Kill / pivot</div>
              <p>{p.kill}</p>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

