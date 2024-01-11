import { CONFIG_URL } from './config/urls'
import { Configuration, EnvironmentOption } from './types'
import { timeoutFetch } from './utils/timeoutFetch'

type ConfigFetch = {
	url: string
	timeout: number
}

export type ImproveArgs = {
	organizationId: string
	environment: EnvironmentOption
	config?: Configuration
	fetchTimeout?: number
}

export class BaseImproveSDK {
	#configFetch: ConfigFetch | null = null

	config: Configuration | null = null

	constructor({
		organizationId,
		environment,
		config,
		fetchTimeout,
	}: ImproveArgs) {
		if (config) {
			this.config = config
		} else {
			this.#configFetch = {
				url: [CONFIG_URL, organizationId, environment].join('/'),
				timeout: fetchTimeout || 0,
			} as ConfigFetch
		}
	}

	fetchConfig = async () => {
		if (this.config) return

		if (!this.#configFetch) {
			console.log('No config fetch setup provided')
			return
		}

		const res = await timeoutFetch(
			this.#configFetch.timeout || 3000,
			this.#configFetch.url,
		)
		if (!res) {
			console.log('Configuration fetch timed-out')
			return
		}
		this.config = await res.json()
	}
}
