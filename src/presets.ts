import { combineRgb, type CompanionPresetDefinitions } from '@companion-module/base'
import type { CuePlayerInstance } from './main.js'

const WHITE = combineRgb(255, 255, 255)
const BLACK = combineRgb(0, 0, 0)
const DARK = combineRgb(20, 22, 30)
const GREEN = combineRgb(0, 160, 70)
const RED = combineRgb(180, 40, 40)
const AMBER = combineRgb(224, 164, 74)
const BLUE = combineRgb(40, 90, 200)

const CENTER = 'center:center' as const

export function buildPresets(self: CuePlayerInstance): CompanionPresetDefinitions {
  const L = self.label
  const presets: CompanionPresetDefinitions = {}

  presets['player_go'] = {
    type: 'button', category: 'Player', name: 'GO',
    style: { text: 'GO', size: '24', color: WHITE, bgcolor: GREEN, alignment: CENTER },
    steps: [{ down: [{ actionId: 'player_go', options: {} }], up: [] }], feedbacks: [],
  }
  presets['player_stop'] = {
    type: 'button', category: 'Player', name: 'STOP',
    style: { text: 'STOP', size: '24', color: WHITE, bgcolor: RED, alignment: CENTER },
    steps: [{ down: [{ actionId: 'player_stop', options: {} }], up: [] }], feedbacks: [],
  }
  presets['player_panic'] = {
    type: 'button', category: 'Player', name: 'PANIC',
    style: { text: 'PANIC', size: '18', color: WHITE, bgcolor: RED, alignment: CENTER },
    steps: [{ down: [{ actionId: 'player_panic', options: {} }], up: [] }], feedbacks: [],
  }
  presets['player_mode'] = {
    type: 'button', category: 'Player', name: 'Mode (cycle)',
    style: { text: `MODE\n$(${L}:mode)`, size: '14', color: WHITE, bgcolor: DARK, alignment: CENTER },
    steps: [{ down: [{ actionId: 'player_mode', options: {} }], up: [] }], feedbacks: [],
  }
  presets['player_now'] = {
    type: 'button', category: 'Player', name: 'Now playing (label + centred countdown)',
    style: { text: `$(${L}:current_name)`, size: 'auto', color: WHITE, bgcolor: DARK, alignment: CENTER },
    steps: [{ down: [{ actionId: 'player_stop', options: {} }], up: [] }],
    feedbacks: [{ feedbackId: 'player_countdown', options: {} }],
  }
  presets['page_player'] = {
    type: 'button', category: 'Player', name: 'Show Player page',
    style: { text: 'PLAYER', size: '14', color: WHITE, bgcolor: BLUE, alignment: CENTER },
    steps: [{ down: [{ actionId: 'page', options: { to: 'player' } }], up: [] }], feedbacks: [],
  }
  presets['player_repeat'] = {
    type: 'button', category: 'Player', name: 'Repeat all (toggle)',
    style: { text: 'REPEAT\nALL', size: '14', color: WHITE, bgcolor: DARK, alignment: CENTER },
    steps: [{ down: [{ actionId: 'player_repeat', options: {} }], up: [] }],
    feedbacks: [{ feedbackId: 'repeat_on', options: {}, style: { bgcolor: GREEN } }],
  }
  presets['player_movenext'] = {
    type: 'button', category: 'Player', name: 'Auto move next (toggle)',
    style: { text: 'AUTO\nNEXT', size: '14', color: WHITE, bgcolor: DARK, alignment: CENTER },
    steps: [{ down: [{ actionId: 'player_movenext', options: {} }], up: [] }],
    feedbacks: [{ feedbackId: 'movenext_on', options: {}, style: { bgcolor: GREEN } }],
  }
  presets['player_duck'] = {
    type: 'button', category: 'Player', name: 'Ducking (toggle)',
    style: { text: 'DUCK', size: '18', color: WHITE, bgcolor: DARK, alignment: CENTER },
    steps: [{ down: [{ actionId: 'player_duck', options: {} }], up: [] }],
    feedbacks: [{ feedbackId: 'duck_on', options: {}, style: { bgcolor: GREEN } }],
  }
  presets['page_jingles'] = {
    type: 'button', category: 'Jingles', name: 'Show Jingles page',
    style: { text: 'JINGLES', size: '14', color: BLACK, bgcolor: AMBER, alignment: CENTER },
    steps: [{ down: [{ actionId: 'page', options: { to: 'jingles' } }], up: [] }], feedbacks: [],
  }
  presets['jingle_stopall'] = {
    type: 'button', category: 'Jingles', name: 'STOP ALL jingles',
    style: { text: 'STOP\nALL', size: '18', color: WHITE, bgcolor: RED, alignment: CENTER },
    steps: [{ down: [{ actionId: 'jingle_stopall', options: {} }], up: [] }], feedbacks: [],
  }

  // per-jingle: label = note/description (auto-fit, centred); while playing -> big centred countdown
  for (const j of self.state.jingles) {
    presets['jingle_' + j.id] = {
      type: 'button', category: 'Jingles', name: j.name,
      style: { text: j.note || j.name, size: 'auto', color: WHITE, bgcolor: DARK, alignment: CENTER },
      steps: [{ down: [{ actionId: 'jingle_toggle', options: { id: j.id } }], up: [] }],
      feedbacks: [
        { feedbackId: 'jingle_playing', options: { id: j.id }, style: { bgcolor: GREEN } },
        { feedbackId: 'jingle_countdown', options: { id: j.id } },
      ],
    }
  }

  // per-cue: label = description (auto-fit, centred); while it is the playing cue -> big centred countdown
  for (const c of self.state.cues) {
    presets['cue_' + c.id] = {
      type: 'button', category: 'Cues (Player)', name: c.name,
      style: { text: c.desc || c.name, size: 'auto', color: WHITE, bgcolor: DARK, alignment: CENTER },
      steps: [{ down: [{ actionId: 'cue_go', options: { id: c.id } }], up: [] }],
      feedbacks: [
        { feedbackId: 'cue_playing', options: { id: c.id }, style: { bgcolor: GREEN } },
        { feedbackId: 'cue_countdown', options: { id: c.id } },
      ],
    }
  }

  return presets
}
