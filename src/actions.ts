import type { CompanionActionDefinitions } from '@companion-module/base'
import type CuePlayerInstance from './main.js'
import { cueLabel, jingleLabel } from './state.js'

type NoOptions = Record<string, never>
type ItemOptions = { id: string }

export type ActionsSchema = {
	player_go: { options: NoOptions }
	player_stop: { options: NoOptions }
	player_panic: { options: NoOptions }
	player_mode: { options: NoOptions }
	player_repeat: { options: NoOptions }
	player_movenext: { options: NoOptions }
	player_duck: { options: NoOptions }
	player_master: { options: { db: number } }
	page: { options: { to: 'player' | 'jingles' } }
	cue_go: { options: ItemOptions }
	jingle_toggle: { options: ItemOptions }
	jingle_play: { options: ItemOptions }
	jingle_stop: { options: ItemOptions }
	jingle_stopall: { options: NoOptions }
}

export function buildActions(self: CuePlayerInstance): CompanionActionDefinitions<ActionsSchema> {
	const cueChoices = self.state.cues.map((c) => ({ id: c.id, label: cueLabel(c) }))
	const jingleChoices = self.state.jingles.map((j) => ({ id: j.id, label: jingleLabel(j) }))
	const firstCue = cueChoices[0]?.id ?? ''
	const firstJingle = jingleChoices[0]?.id ?? ''

	return {
		player_go: { name: 'Player: GO', options: [], callback: () => self.send('/go') },
		player_stop: { name: 'Player: STOP', options: [], callback: () => self.send('/stop') },
		player_panic: { name: 'Player: PANIC', options: [], callback: () => self.send('/panic') },
		player_mode: { name: 'Player: cycle mode', options: [], callback: () => self.send('/mode') },

		player_repeat: { name: 'Player: toggle Repeat all', options: [], callback: () => self.send('/repeat') },
		player_movenext: { name: 'Player: toggle Auto move next', options: [], callback: () => self.send('/movenext') },
		player_duck: { name: 'Player: toggle Ducking', options: [], callback: () => self.send('/duck') },

		player_master: {
			name: 'Player: set master (dB)',
			options: [{ type: 'number', id: 'db', label: 'dB', default: 0, min: -60, max: 0 }],
			callback: (a) => self.send(`/master?db=${Number(a.options.db)}`),
		},

		page: {
			name: 'Switch page (Player/Jingles)',
			options: [
				{
					type: 'dropdown',
					id: 'to',
					label: 'Page',
					default: 'player',
					choices: [
						{ id: 'player', label: 'Player' },
						{ id: 'jingles', label: 'Jingles' },
					],
				},
			],
			callback: (a) => self.send(`/page?to=${a.options.to}`),
		},

		cue_go: {
			name: 'Player: play cue (by name)',
			options: [{ type: 'dropdown', id: 'id', label: 'Cue', default: firstCue, choices: cueChoices }],
			callback: (a) => self.send(`/cue/go?id=${a.options.id}`),
		},

		jingle_toggle: {
			name: 'Jingle: play/stop (toggle)',
			options: [{ type: 'dropdown', id: 'id', label: 'Jingle', default: firstJingle, choices: jingleChoices }],
			callback: (a) => self.send(`/jingle/toggle?id=${a.options.id}`),
		},
		jingle_play: {
			name: 'Jingle: play',
			options: [{ type: 'dropdown', id: 'id', label: 'Jingle', default: firstJingle, choices: jingleChoices }],
			callback: (a) => self.send(`/jingle/play?id=${a.options.id}`),
		},
		jingle_stop: {
			name: 'Jingle: stop',
			options: [{ type: 'dropdown', id: 'id', label: 'Jingle', default: firstJingle, choices: jingleChoices }],
			callback: (a) => self.send(`/jingle/stop?id=${a.options.id}`),
		},
		jingle_stopall: { name: 'Jingle: STOP ALL', options: [], callback: () => self.send('/jingle/stopall') },
	}
}
