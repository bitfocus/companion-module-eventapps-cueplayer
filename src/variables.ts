import type { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import type { CuePlayerInstance } from './main.js'
import { fmtClock } from './state.js'

export function buildVariables(self: CuePlayerInstance): CompanionVariableDefinition[] {
  const defs: CompanionVariableDefinition[] = [
    { variableId: 'connection', name: 'Connection state' },
    { variableId: 'playing', name: 'Player is playing (0/1)' },
    { variableId: 'mode', name: 'Playback mode' },
    { variableId: 'master_db', name: 'Master gain (dB)' },
    { variableId: 'current_name', name: 'Current cue name' },
    { variableId: 'current_desc', name: 'Current cue description' },
    { variableId: 'current_elapsed', name: 'Current cue elapsed (m:ss)' },
    { variableId: 'current_remaining', name: 'Current cue remaining (m:ss)' },
    { variableId: 'current_total', name: 'Current cue total (m:ss)' },
  ]
  for (const j of self.state.jingles) {
    defs.push({ variableId: `jingle_${j.id}_name`, name: `Jingle name: ${j.name}` })
    defs.push({ variableId: `jingle_${j.id}_rem`, name: `Jingle remaining m:ss: ${j.name}` })
    defs.push({ variableId: `jingle_${j.id}_playing`, name: `Jingle playing 0/1: ${j.name}` })
  }
  for (const c of self.state.cues) {
    defs.push({ variableId: `cue_${c.id}_name`, name: `Cue name: ${c.name}` })
  }
  return defs
}

export function variableValues(self: CuePlayerInstance): CompanionVariableValues {
  const s = self.state
  const v: CompanionVariableValues = {
    connection: self.online ? 'OK' : 'offline',
    playing: s.playing ? 1 : 0,
    mode: s.mode,
    master_db: (s.masterDb ?? 0).toFixed(1),
    current_name: s.playing ? s.currentName : '',
    current_desc: s.playing ? s.currentDesc : '',
    current_elapsed: fmtClock(s.elapsedMs),
    current_remaining: fmtClock(s.remainingMs),
    current_total: fmtClock(s.totalMs),
  }
  for (const j of s.jingles) {
    v[`jingle_${j.id}_name`] = j.name
    v[`jingle_${j.id}_rem`] = j.playing ? fmtClock(j.remainingMs) : ''
    v[`jingle_${j.id}_playing`] = j.playing ? 1 : 0
  }
  for (const c of s.cues) {
    v[`cue_${c.id}_name`] = c.name
  }
  return v
}
