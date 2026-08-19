import { combineRgb, type CompanionFeedbackDefinitions } from '@companion-module/base'
import type CuePlayerInstance from './main.js'
import { cueLabel, jingleLabel, fmtClock } from './state.js'

const AMBER = combineRgb(255, 176, 0)
const RED = combineRgb(255, 64, 64)
const WHITE = combineRgb(255, 255, 255)
const GREEN = combineRgb(0, 140, 60)

// Big, centred countdown text that overrides the button label while playing.
const COUNTDOWN_SIZE = 22

type NoOptions = Record<string, never>
type ItemOptions = { id: string }

export type FeedbacksSchema = {
	jingle_playing: { type: 'boolean'; options: ItemOptions }
	jingle_countdown: { type: 'advanced'; options: ItemOptions }
	cue_playing: { type: 'boolean'; options: ItemOptions }
	cue_countdown: { type: 'advanced'; options: ItemOptions }
	repeat_on: { type: 'boolean'; options: NoOptions }
	movenext_on: { type: 'boolean'; options: NoOptions }
	duck_on: { type: 'boolean'; options: NoOptions }
	player_countdown: { type: 'advanced'; options: NoOptions }
}

export function buildFeedbacks(self: CuePlayerInstance): CompanionFeedbackDefinitions<FeedbacksSchema> {
	const cueChoices = self.state.cues.map((c) => ({ id: c.id, label: cueLabel(c) }))
	const jingleChoices = self.state.jingles.map((j) => ({ id: j.id, label: jingleLabel(j) }))
	const firstCue = cueChoices[0]?.id ?? ''
	const firstJingle = jingleChoices[0]?.id ?? ''

	const remColor = (remainingMs: number): number => {
		const sec = remainingMs / 1000
		if (sec <= self.config.dangerSec) return RED
		if (sec <= self.config.warnSec) return AMBER
		return WHITE
	}
	const countdown = (remainingMs: number) => ({
		text: '-' + fmtClock(remainingMs),
		size: COUNTDOWN_SIZE,
		alignment: 'center:center' as const,
		color: remColor(remainingMs),
	})

	return {
		jingle_playing: {
			type: 'boolean',
			name: 'Jingle is playing (green background)',
			defaultStyle: { bgcolor: GREEN },
			options: [{ type: 'dropdown', id: 'id', label: 'Jingle', default: firstJingle, choices: jingleChoices }],
			callback: (fb) => {
				const j = self.state.jingles.find((x) => x.id === fb.options.id)
				return !!j?.playing
			},
		},
		jingle_countdown: {
			type: 'advanced',
			name: 'Jingle countdown (centred, amber/red) - overrides label while playing',
			options: [{ type: 'dropdown', id: 'id', label: 'Jingle', default: firstJingle, choices: jingleChoices }],
			callback: (fb) => {
				const j = self.state.jingles.find((x) => x.id === fb.options.id)
				if (!j || !j.playing) return {}
				return countdown(j.remainingMs)
			},
		},
		cue_playing: {
			type: 'boolean',
			name: 'Cue is the one playing (green background)',
			defaultStyle: { bgcolor: GREEN },
			options: [{ type: 'dropdown', id: 'id', label: 'Cue', default: firstCue, choices: cueChoices }],
			callback: (fb) => self.state.playing && self.state.currentId === fb.options.id,
		},
		cue_countdown: {
			type: 'advanced',
			name: 'Cue countdown (centred, amber/red) - while it is the playing cue',
			options: [{ type: 'dropdown', id: 'id', label: 'Cue', default: firstCue, choices: cueChoices }],
			callback: (fb) => {
				if (!self.state.playing || self.state.currentId !== fb.options.id) return {}
				return countdown(self.state.remainingMs)
			},
		},
		repeat_on: {
			type: 'boolean',
			name: 'Repeat all is ON (green background)',
			defaultStyle: { bgcolor: GREEN },
			options: [],
			callback: () => !!self.state.repeatAll,
		},
		movenext_on: {
			type: 'boolean',
			name: 'Auto move next is ON (green background)',
			defaultStyle: { bgcolor: GREEN },
			options: [],
			callback: () => !!self.state.moveNextAuto,
		},
		duck_on: {
			type: 'boolean',
			name: 'Ducking is ON (green background)',
			defaultStyle: { bgcolor: GREEN },
			options: [],
			callback: () => !!self.state.duckEnabled,
		},
		player_countdown: {
			type: 'advanced',
			name: 'Player countdown (centred, amber/red) - current cue',
			options: [],
			callback: () => {
				if (!self.state.playing) return {}
				return countdown(self.state.remainingMs)
			},
		},
	}
}
