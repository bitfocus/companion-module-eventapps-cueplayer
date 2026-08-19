import type { CompanionVariableDefinitions, CompanionVariableValue } from '@companion-module/base'
import type CuePlayerInstance from './main.js'
import { fmtClock } from './state.js'

// Some variable ids are generated per cue / per jingle, so the schema is an open
// map rather than a fixed list of keys.
export type VariablesSchema = Record<string, CompanionVariableValue>

export function buildVariables(self: CuePlayerInstance): CompanionVariableDefinitions<VariablesSchema> {
	const defs: CompanionVariableDefinitions<VariablesSchema> = {
		connection: { name: 'Connection state' },
		playing: { name: 'Player is playing (0/1)' },
		mode: { name: 'Playback mode' },
		master_db: { name: 'Master gain (dB)' },
		current_name: { name: 'Current cue name' },
		current_desc: { name: 'Current cue description' },
		current_elapsed: { name: 'Current cue elapsed (m:ss)' },
		current_remaining: { name: 'Current cue remaining (m:ss)' },
		current_total: { name: 'Current cue total (m:ss)' },
	}
	for (const j of self.state.jingles) {
		defs[`jingle_${j.id}_name`] = { name: `Jingle name: ${j.name}` }
		defs[`jingle_${j.id}_rem`] = { name: `Jingle remaining m:ss: ${j.name}` }
		defs[`jingle_${j.id}_playing`] = { name: `Jingle playing 0/1: ${j.name}` }
	}
	for (const c of self.state.cues) {
		defs[`cue_${c.id}_name`] = { name: `Cue name: ${c.name}` }
	}
	return defs
}

export function variableValues(self: CuePlayerInstance): Partial<VariablesSchema> {
	const s = self.state
	const v: Partial<VariablesSchema> = {
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
