// Shape of GET /state returned by CuePlayer (see RemoteControlServer / buildStateJson).

export interface CueEntry {
  id: string
  i: number
  name: string
  desc: string
  durMs: number
  loop: boolean
}

export interface JingleEntry {
  id: string
  name: string
  note: string
  loop: boolean
  playing: boolean
  remainingMs: number
}

export interface CueState {
  playing: boolean
  mode: string
  masterDb: number
  elapsedMs: number
  totalMs: number
  remainingMs: number
  currentId: string
  currentName: string
  currentDesc: string
  currentRow: number
  nextRow: number
  repeatAll: boolean
  moveNextAuto: boolean
  duckEnabled: boolean
  cues: CueEntry[]
  jingles: JingleEntry[]
}

export function emptyState(): CueState {
  return {
    playing: false,
    mode: 'auto',
    masterDb: 0,
    elapsedMs: 0,
    totalMs: 0,
    remainingMs: 0,
    currentId: '',
    currentName: '',
    currentDesc: '',
    currentRow: -1,
    nextRow: -1,
    repeatAll: false,
    moveNextAuto: false,
    duckEnabled: false,
    cues: [],
    jingles: [],
  }
}

// Signature of the cue/jingle LISTS (ids + labels). When it changes we rebuild
// dropdown choices, per-item variables and presets.
export function listSignature(s: CueState): string {
  return JSON.stringify([
    s.cues.map((c) => [c.id, c.name, c.desc]),
    s.jingles.map((j) => [j.id, j.name]),
  ])
}

// milliseconds -> "m:ss"
export function fmtClock(ms: number): string {
  if (!isFinite(ms) || ms < 0) ms = 0
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return m + ':' + String(s).padStart(2, '0')
}

export function cueLabel(c: CueEntry): string {
  return c.desc ? `${c.name} — ${c.desc}` : c.name
}

export function jingleLabel(j: JingleEntry): string {
  return j.note ? `${j.name} — ${j.note}` : j.name
}
