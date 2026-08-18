import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface CuePlayerConfig {
  host: string
  port: number
  token: string
  poll: number
  warnSec: number
  dangerSec: number
}

export function getConfigFields(): SomeCompanionConfigField[] {
  return [
    {
      type: 'static-text',
      id: 'info',
      width: 12,
      label: 'CuePlayer',
      value:
        'Enable "Vzdálené ovládání" in CuePlayer (Settings → Vzdálené ovládání). ' +
        'The token is optional — leave it blank unless you turned on "Vyžadovat token".',
    },
    { type: 'textinput', id: 'host', label: 'CuePlayer IP', width: 6, default: '', regex: Regex.IP },
    { type: 'number', id: 'port', label: 'Port', width: 6, default: 8770, min: 1, max: 65535 },
    { type: 'textinput', id: 'token', label: 'Token (optional)', width: 12, default: '' },
    { type: 'number', id: 'poll', label: 'Poll interval (ms)', width: 4, default: 250, min: 100, max: 2000 },
    { type: 'number', id: 'warnSec', label: 'Amber text under (s)', width: 4, default: 20, min: 0, max: 600 },
    { type: 'number', id: 'dangerSec', label: 'Red text under (s)', width: 4, default: 10, min: 0, max: 600 },
  ]
}
