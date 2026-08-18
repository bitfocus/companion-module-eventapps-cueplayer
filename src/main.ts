import {
  InstanceBase,
  InstanceStatus,
  runEntrypoint,
  type SomeCompanionConfigField,
} from '@companion-module/base'
import { getConfigFields, type CuePlayerConfig } from './config.js'
import { CueApi } from './api.js'
import { emptyState, listSignature, type CueState } from './state.js'
import { buildActions } from './actions.js'
import { buildFeedbacks } from './feedbacks.js'
import { buildVariables, variableValues } from './variables.js'
import { buildPresets } from './presets.js'

export class CuePlayerInstance extends InstanceBase<CuePlayerConfig> {
  config: CuePlayerConfig = { host: '', port: 8770, token: '', poll: 250, warnSec: 20, dangerSec: 10 }
  api: CueApi = new CueApi('', 8770, '')
  state: CueState = emptyState()
  online = false

  private timer: NodeJS.Timeout | undefined
  private sig = ''

  async init(config: CuePlayerConfig): Promise<void> {
    this.config = config
    this.api = new CueApi(config.host, config.port, config.token)
    this.rebuildDefinitions()
    this.updateStatus(InstanceStatus.Connecting)
    this.restartPolling()
  }

  async destroy(): Promise<void> {
    if (this.timer) clearInterval(this.timer)
    this.timer = undefined
  }

  async configUpdated(config: CuePlayerConfig): Promise<void> {
    this.config = config
    this.api = new CueApi(config.host, config.port, config.token)
    this.online = false
    this.sig = ''
    this.rebuildDefinitions()
    this.restartPolling()
  }

  getConfigFields(): SomeCompanionConfigField[] {
    return getConfigFields()
  }

  rebuildDefinitions(): void {
    this.setActionDefinitions(buildActions(this))
    this.setFeedbackDefinitions(buildFeedbacks(this))
    this.setVariableDefinitions(buildVariables(this))
    this.setPresetDefinitions(buildPresets(this))
  }

  private restartPolling(): void {
    if (this.timer) clearInterval(this.timer)
    const iv = Math.max(100, Number(this.config.poll) || 250)
    this.timer = setInterval(() => void this.poll(), iv)
    void this.poll()
  }

  private async poll(): Promise<void> {
    if (!this.config.host) {
      this.updateStatus(InstanceStatus.BadConfig, 'Set the CuePlayer IP address')
      return
    }
    try {
      this.state = await this.api.fetchState()
      if (!this.online) {
        this.online = true
        this.updateStatus(InstanceStatus.Ok)
      }
      const sig = listSignature(this.state)
      if (sig !== this.sig) {
        this.sig = sig
        this.rebuildDefinitions() // cue/jingle list changed -> refresh dropdowns/presets/variables
      }
      this.setVariableValues(variableValues(this))
      this.checkFeedbacks()
    } catch (e) {
      this.online = false
      this.updateStatus(InstanceStatus.ConnectionFailure, String((e as Error).message))
      this.setVariableValues(variableValues(this))
    }
  }

  // fire-and-forget command, then a quick optimistic refresh
  send(path: string): void {
    this.api.cmd(path).catch(() => {})
    setTimeout(() => void this.poll(), 90)
  }
}

runEntrypoint(CuePlayerInstance, [])
