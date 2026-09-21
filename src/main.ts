import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { getConfigFields, type CuePlayerConfig } from './config.js'
import { CueApi } from './api.js'
import { emptyState, listSignature, type CueState } from './state.js'
import { buildActions, type ActionsSchema } from './actions.js'
import { buildFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { buildVariables, variableValues, type VariablesSchema } from './variables.js'
import { buildPresets } from './presets.js'
import { UpgradeScripts } from './upgrades.js'

export type CuePlayerSchema = {
	config: CuePlayerConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export { UpgradeScripts }

export default class CuePlayerInstance extends InstanceBase<CuePlayerSchema> {
	config: CuePlayerConfig = { host: '', port: 8770, token: '', poll: 250, warnSec: 20, dangerSec: 10 }
	api: CueApi = new CueApi('', 8770, '')
	state: CueState = emptyState()
	online = false

	private timer: NodeJS.Timeout | undefined
	private sig = ''
	private failed = false

	async init(config: CuePlayerConfig): Promise<void> {
		this.applyConfig(config)
	}

	async destroy(): Promise<void> {
		this.stopPolling()
	}

	async configUpdated(config: CuePlayerConfig): Promise<void> {
		this.applyConfig(config)
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return getConfigFields()
	}

	// Shared by init() and configUpdated(): reset connection state, then either
	// start polling (host is set) or stop it entirely and report BadConfig once.
	// Polling resumes from configUpdated() as soon as the config becomes valid.
	private applyConfig(config: CuePlayerConfig): void {
		this.config = config
		this.api = new CueApi(config.host, config.port, config.token)
		this.online = false
		this.failed = false
		this.sig = ''
		this.rebuildDefinitions()
		this.stopPolling()
		if (!config.host) {
			this.updateStatus(InstanceStatus.BadConfig, 'Set the CuePlayer IP address')
			return
		}
		this.updateStatus(InstanceStatus.Connecting)
		const iv = Math.max(100, Number(this.config.poll) || 250)
		this.timer = setInterval(() => void this.poll(), iv)
		void this.poll()
	}

	private stopPolling(): void {
		if (this.timer) clearInterval(this.timer)
		this.timer = undefined
	}

	rebuildDefinitions(): void {
		this.setActionDefinitions(buildActions(this))
		this.setFeedbackDefinitions(buildFeedbacks(this))
		this.setVariableDefinitions(buildVariables(this))
		const { structure, presets } = buildPresets(this)
		this.setPresetDefinitions(structure, presets)
	}

	private async poll(): Promise<void> {
		try {
			this.state = await this.api.fetchState()
			this.failed = false
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
			this.checkAllFeedbacks()
		} catch (e) {
			// Report the failure only on the transition, not on every poll tick,
			// so an unreachable host does not spam the log. Variables and
			// feedbacks are refreshed on the same transition, so the
			// 'connection' variable reads offline even when the host is
			// unreachable from the very first poll.
			if (!this.failed) {
				this.failed = true
				this.online = false
				this.updateStatus(InstanceStatus.ConnectionFailure, String((e as Error).message))
				this.setVariableValues(variableValues(this))
				this.checkAllFeedbacks()
			}
		}
	}

	// fire-and-forget command, then a quick optimistic refresh
	send(path: string): void {
		this.api.cmd(path).catch(() => {})
		setTimeout(() => void this.poll(), 90)
	}
}
