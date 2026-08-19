import { combineRgb, type CompanionPresetDefinitions, type CompanionPresetSection } from '@companion-module/base'
import type CuePlayerInstance from './main.js'
import type { CuePlayerSchema } from './main.js'

const WHITE = combineRgb(255, 255, 255)
const BLACK = combineRgb(0, 0, 0)
const DARK = combineRgb(20, 22, 30)
const GREEN = combineRgb(0, 160, 70)
const RED = combineRgb(180, 40, 40)
const AMBER = combineRgb(224, 164, 74)
const BLUE = combineRgb(40, 90, 200)

const CENTER = 'center:center' as const

export interface CuePlayerPresets {
	structure: CompanionPresetSection<CuePlayerSchema>[]
	presets: CompanionPresetDefinitions<CuePlayerSchema>
}

export function buildPresets(self: CuePlayerInstance): CuePlayerPresets {
	const L = self.label
	const presets: CompanionPresetDefinitions<CuePlayerSchema> = {}

	presets['player_go'] = {
		type: 'simple',
		name: 'GO',
		style: { text: 'GO', size: '24', color: WHITE, bgcolor: GREEN, alignment: CENTER },
		steps: [{ down: [{ actionId: 'player_go', options: {} }], up: [] }],
		feedbacks: [],
	}
	presets['player_stop'] = {
		type: 'simple',
		name: 'STOP',
		style: { text: 'STOP', size: '24', color: WHITE, bgcolor: RED, alignment: CENTER },
		steps: [{ down: [{ actionId: 'player_stop', options: {} }], up: [] }],
		feedbacks: [],
	}
	presets['player_panic'] = {
		type: 'simple',
		name: 'PANIC',
		style: { text: 'PANIC', size: '18', color: WHITE, bgcolor: RED, alignment: CENTER },
		steps: [{ down: [{ actionId: 'player_panic', options: {} }], up: [] }],
		feedbacks: [],
	}
	presets['player_mode'] = {
		type: 'simple',
		name: 'Mode (cycle)',
		style: { text: `MODE\n$(${L}:mode)`, size: '14', color: WHITE, bgcolor: DARK, alignment: CENTER },
		steps: [{ down: [{ actionId: 'player_mode', options: {} }], up: [] }],
		feedbacks: [],
	}
	presets['player_now'] = {
		type: 'simple',
		name: 'Now playing (label + centred countdown)',
		style: { text: `$(${L}:current_name)`, size: 'auto', color: WHITE, bgcolor: DARK, alignment: CENTER },
		steps: [{ down: [{ actionId: 'player_stop', options: {} }], up: [] }],
		feedbacks: [{ feedbackId: 'player_countdown', options: {} }],
	}
	presets['page_player'] = {
		type: 'simple',
		name: 'Show Player page',
		style: { text: 'PLAYER', size: '14', color: WHITE, bgcolor: BLUE, alignment: CENTER },
		steps: [{ down: [{ actionId: 'page', options: { to: 'player' } }], up: [] }],
		feedbacks: [],
	}
	presets['player_repeat'] = {
		type: 'simple',
		name: 'Repeat all (toggle)',
		style: { text: 'REPEAT\nALL', size: '14', color: WHITE, bgcolor: DARK, alignment: CENTER },
		steps: [{ down: [{ actionId: 'player_repeat', options: {} }], up: [] }],
		feedbacks: [{ feedbackId: 'repeat_on', options: {}, style: { bgcolor: GREEN } }],
	}
	presets['player_movenext'] = {
		type: 'simple',
		name: 'Auto move next (toggle)',
		style: { text: 'AUTO\nNEXT', size: '14', color: WHITE, bgcolor: DARK, alignment: CENTER },
		steps: [{ down: [{ actionId: 'player_movenext', options: {} }], up: [] }],
		feedbacks: [{ feedbackId: 'movenext_on', options: {}, style: { bgcolor: GREEN } }],
	}
	presets['player_duck'] = {
		type: 'simple',
		name: 'Ducking (toggle)',
		style: { text: 'DUCK', size: '18', color: WHITE, bgcolor: DARK, alignment: CENTER },
		steps: [{ down: [{ actionId: 'player_duck', options: {} }], up: [] }],
		feedbacks: [{ feedbackId: 'duck_on', options: {}, style: { bgcolor: GREEN } }],
	}
	presets['page_jingles'] = {
		type: 'simple',
		name: 'Show Jingles page',
		style: { text: 'JINGLES', size: '14', color: BLACK, bgcolor: AMBER, alignment: CENTER },
		steps: [{ down: [{ actionId: 'page', options: { to: 'jingles' } }], up: [] }],
		feedbacks: [],
	}
	presets['jingle_stopall'] = {
		type: 'simple',
		name: 'STOP ALL jingles',
		style: { text: 'STOP\nALL', size: '18', color: WHITE, bgcolor: RED, alignment: CENTER },
		steps: [{ down: [{ actionId: 'jingle_stopall', options: {} }], up: [] }],
		feedbacks: [],
	}

	// per-jingle: label = note/description (auto-fit, centred); while playing -> big centred countdown
	const jinglePresetIds: string[] = []
	for (const j of self.state.jingles) {
		const id = 'jingle_' + j.id
		jinglePresetIds.push(id)
		presets[id] = {
			type: 'simple',
			name: j.name,
			style: { text: j.note || j.name, size: 'auto', color: WHITE, bgcolor: DARK, alignment: CENTER },
			steps: [{ down: [{ actionId: 'jingle_toggle', options: { id: j.id } }], up: [] }],
			feedbacks: [
				{ feedbackId: 'jingle_playing', options: { id: j.id }, style: { bgcolor: GREEN } },
				{ feedbackId: 'jingle_countdown', options: { id: j.id } },
			],
		}
	}

	// per-cue: label = description (auto-fit, centred); while it is the playing cue -> big centred countdown
	const cuePresetIds: string[] = []
	for (const c of self.state.cues) {
		const id = 'cue_' + c.id
		cuePresetIds.push(id)
		presets[id] = {
			type: 'simple',
			name: c.name,
			style: { text: c.desc || c.name, size: 'auto', color: WHITE, bgcolor: DARK, alignment: CENTER },
			steps: [{ down: [{ actionId: 'cue_go', options: { id: c.id } }], up: [] }],
			feedbacks: [
				{ feedbackId: 'cue_playing', options: { id: c.id }, style: { bgcolor: GREEN } },
				{ feedbackId: 'cue_countdown', options: { id: c.id } },
			],
		}
	}

	const structure: CompanionPresetSection<CuePlayerSchema>[] = [
		{
			id: 'player',
			name: 'Player',
			definitions: [
				'player_go',
				'player_stop',
				'player_panic',
				'player_mode',
				'player_now',
				'page_player',
				'player_repeat',
				'player_movenext',
				'player_duck',
			],
		},
		{
			id: 'jingles',
			name: 'Jingles',
			definitions: ['page_jingles', 'jingle_stopall', ...jinglePresetIds],
		},
		{
			id: 'cues',
			name: 'Cues (Player)',
			definitions: cuePresetIds,
		},
	]

	return { structure, presets }
}
