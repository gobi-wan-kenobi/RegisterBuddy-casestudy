export type RoomFlags = {
  readerCapable?: boolean
  scribeCapable?: boolean
  spillover?: boolean
  closed?: boolean
}

export type Room = {
  id: string
  name: string
  seats: number
  flags: RoomFlags
}

export type TimeBlock = {
  id: string
  label: string
  day: string
}

export type Cell = {
  roomId: string
  blockId: string
  exams: number
  reader: number
  scribe: number
  status: 'ok' | 'tight' | 'over' | 'closed' | 'empty'
}

export type Alert = {
  id: string
  severity: 'shortfall' | 'underuse'
  title: string
  when: string
  gap: string
  why: string[]
  suggestion: string
  suggestionDetail: string
}

export const SITE = {
  director: 'Jordan',
  name: 'Midwestern State University Testing Center',
  surge: 'Fall Finals',
  range: 'Dec 9–13',
}

export const TIME_BLOCKS: TimeBlock[] = [
  { id: 'mon-am', label: 'Mon 9–11', day: 'Mon' },
  { id: 'mon-pm', label: 'Mon 1–3', day: 'Mon' },
  { id: 'tue-am', label: 'Tue 9–11', day: 'Tue' },
  { id: 'tue-pm', label: 'Tue 1–3', day: 'Tue' },
  { id: 'wed-am', label: 'Wed 9–11', day: 'Wed' },
  { id: 'wed-pm', label: 'Wed 1–3', day: 'Wed' },
  { id: 'thu-am', label: 'Thu 9–11', day: 'Thu' },
  { id: 'thu-pm', label: 'Thu 1–3', day: 'Thu' },
  { id: 'fri-am', label: 'Fri 9–11', day: 'Fri' },
  { id: 'fri-pm', label: 'Fri 1–3', day: 'Fri' },
]

export const INITIAL_ROOMS: Room[] = [
  { id: 'pec1', name: 'PEC 1', seats: 12, flags: {} },
  { id: 'pec2', name: 'PEC 2', seats: 12, flags: {} },
  { id: 'pec3', name: 'PEC 3', seats: 8, flags: { readerCapable: true } },
  { id: 'lakeside1', name: 'Lakeside 1', seats: 6, flags: { readerCapable: true, scribeCapable: true } },
  { id: 'bermuda', name: 'Bermuda Triangle', seats: 4, flags: { spillover: true } },
  { id: 'music', name: 'Music Closet', seats: 4, flags: { spillover: true, readerCapable: true, closed: true } },
]

export const STAFF = {
  proctors: 6,
  studentWorkers: 4,
  readerQualified: 2,
  hours: 'Standard 8:30–4:50 · Extended available Thu–Fri',
}

export const PROJECTION = [
  { day: 'Mon', value: 62 },
  { day: 'Tue', value: 71 },
  { day: 'Wed', value: 78 },
  { day: 'Thu', value: 94 },
  { day: 'Fri', value: 55 },
]

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'reader-thu',
    severity: 'shortfall',
    title: 'Short on reader-capable capacity',
    when: 'Thu 1:00–3:00pm',
    gap: 'Need 4 reader seats · Plan has 2',
    why: [
      'Bookings with reader accommodation up vs last three finals',
      'Only PEC 3 + Lakeside 1 marked reader-capable in the open plan',
      'Historical Thursday afternoon peak (projection strip)',
    ],
    suggestion: 'Open Music Closet as spillover (reader-capable) 1–3pm',
    suggestionDetail: 'Adds 4 reader-capable seats for Thu 1–3. Does not auto-notify staff until you confirm.',
  },
  {
    id: 'under-fri',
    severity: 'underuse',
    title: 'Spillover under-utilized',
    when: 'Fri 9:00–11:00am',
    gap: 'Bermuda Triangle planned open · projected demand low',
    why: [
      'Friday AM historically light after Thursday peak',
      'Current bookings for Fri AM well below seat inventory',
      'Student-worker overtime may be avoidable',
    ],
    suggestion: 'Keep Bermuda Triangle closed Fri AM unless late bookings arrive',
    suggestionDetail: 'Frees 1 student worker block. Review again Wednesday before finals.',
  },
]

function cell(
  roomId: string,
  blockId: string,
  exams: number,
  reader: number,
  scribe: number,
  status: Cell['status'],
): Cell {
  return { roomId, blockId, exams, reader, scribe, status }
}

/** Baseline plan: Music Closet closed; Thu PM reader-capable tight/over on open rooms */
export function buildInitialCells(rooms: Room[]): Cell[] {
  const cells: Cell[] = []
  for (const room of rooms) {
    for (const block of TIME_BLOCKS) {
      if (room.flags.closed) {
        cells.push(cell(room.id, block.id, 0, 0, 0, 'closed'))
        continue
      }
      // Default light load
      let exams = 4
      let reader = 0
      let scribe = 0
      let status: Cell['status'] = 'ok'

      if (block.id === 'thu-pm') {
        if (room.id === 'pec3') {
          exams = 8
          reader = 2
          status = 'over'
        } else if (room.id === 'lakeside1') {
          exams = 6
          reader = 0
          scribe = 1
          status = 'tight'
        } else if (room.id === 'pec1' || room.id === 'pec2') {
          exams = 11
          status = 'tight'
        } else if (room.id === 'bermuda') {
          exams = 3
          status = 'ok'
        }
      } else if (block.id === 'thu-am') {
        exams = room.seats > 8 ? 9 : 5
        status = exams >= room.seats - 1 ? 'tight' : 'ok'
      } else if (block.id === 'fri-am' && room.id === 'bermuda') {
        exams = 1
        status = 'ok'
      } else if (block.day === 'Wed' || block.day === 'Tue') {
        exams = Math.min(room.seats - 2, 8)
      }

      cells.push(cell(room.id, block.id, exams, reader, scribe, status))
    }
  }
  return cells
}
