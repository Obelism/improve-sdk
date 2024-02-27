import { COOKIE_NAME_VISITOR } from './config/constants'
import { CONFIG_URL } from './config/urls'
import {
	Configuration,
	EnvironmentOption,
	ImproveArgs,
	TestState,
} from './types'
import { getRandomString } from './utils/getRandomString'
import { timeoutFetch } from './utils/timeoutFetch'

type ConfigFetch = {
	url: string
	timeout: number
}

export class BaseImproveSDK {
	organizationId = ''
	environment: EnvironmentOption = 'develop'

	#configFetch: ConfigFetch | null = null

	config: Configuration | null = null

	constructor({
		organizationId,
		environment,
		state,
		config,
		fetchTimeout,
	}: ImproveArgs) {
		this.organizationId = organizationId
		this.environment = environment
		const configState: TestState = state || 'active'

		if (config) {
			this.config = config
		} else {
			this.#configFetch = {
				url: [CONFIG_URL, organizationId, environment, configState].join('/'),
				timeout: fetchTimeout || 3000,
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
			this.#configFetch.timeout,
			this.#configFetch.url,
		)
		if (!res) {
			console.log('Configuration fetch timed-out')
			return
		}
		this.config = await res.json()
	}

	generateVisitorId = () => `visi_${getRandomString(26).toUpperCase()}`

	getVisitorCookieName = () => COOKIE_NAME_VISITOR
}
