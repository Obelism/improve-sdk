import { Configuration, EnvironmentOption } from './types'
import { timeoutFetch } from './utils/timeoutFetch'

type FetchConfigParams = {
	organizationId: string
	environment: EnvironmentOption
	timeout?: number
}

type ConfigFetch = {
	url: string
	timeout?: number
}

export type ImproveArgs = {
	config: FetchConfigParams | Configuration
	analyticsUrls: string
}

const BASE_URL = 'https://improve.obelism.studio'
const CONFIG_URL = `${BASE_URL}/config`
const ANALYTICS_URL = `${BASE_URL}/api/log`

export class BaseImproveSDK {
	#configFetch: ConfigFetch | null = null

	config: Configuration | null = null

	constructor({ config, analyticsUrls }: ImproveArgs) {
		if (!config) throw new Error('Config is required')

		// @ts-expect-error Checking what type config is
		if (typeof config.organizationId === 'string') {
			config = config as FetchConfigParams
			this.#configFetch = {
				url: [CONFIG_URL, config.organizationId, config.environment].join('/'),
				timeout: config?.timeout || undefined,
			} as ConfigFetch
		} else {
			this.config = config as Configuration
		}

		if (!analyticsUrls) throw new Error('An "analyticsUrls" is required')
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

	postAnalytic = () => {
		fetch(ANALYTICS_URL, {
			method: 'POST',
		})
	}
}
