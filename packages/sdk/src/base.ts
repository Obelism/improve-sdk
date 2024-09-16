import { COOKIE_NAME_VISITOR } from './config/constants'
import { CONFIG_URL } from './config/urls'
import {
	ImproveConfiguration,
	ImproveEnvironmentOption,
	ImproveSetupArgs,
	ImproveTestState,
} from './types'
import { getRandomString } from './utils/getRandomString'
import { timeoutFetch } from './utils/timeoutFetch'

type ConfigFetch = {
	url: string
	timeout: number
}

export class BaseImproveSDK {
	organizationId = ''
	environment: ImproveEnvironmentOption = 'develop'

	#configFetch: ConfigFetch | null = null

	config: ImproveConfiguration | null = null

	constructor({
		organizationId,
		environment,
		state,
		config,
		fetchTimeout,
	}: ImproveSetupArgs) {
		this.organizationId = organizationId
		this.environment = environment
		const configState: ImproveTestState = state || 'active'

		if (config) {
			this.config = config
		} else {
			this.#configFetch = {
				url: [CONFIG_URL, organizationId, environment, configState].join('/'),
				timeout: fetchTimeout || 3000,
			} as ConfigFetch
		}
	}

	fetchConfig = async (config?: RequestInit) => {
		if (this.config) return

		if (!this.#configFetch) throw new Error('No config fetch setup provided')

		const res = await timeoutFetch(
			this.#configFetch.timeout,
			this.#configFetch.url,
			config,
		)
		if (!res || !res.ok) throw new Error('Configuration fetch timed-out')

		this.config = await res.json()
	}

	loadConfig = (config: ImproveConfiguration) => {
		this.config = config
	}

	generateVisitorId = () => `visi_${getRandomString(26).toUpperCase()}`

	getVisitorCookieName = () => COOKIE_NAME_VISITOR

	validateTestValue = (testName: string, testValue: string) => {
		if (!this.config)
			throw new Error(
				'Config is required before validating, either use `.fetchConfig()`, .loadConfig(config) or provide it during setup',
			)

		const testConfig = this.config.tests[testName]

		if (!testConfig) throw new Error(`No config found for ${testName}`)

		return Boolean(
			testConfig.options.find((option) => option.slug === testValue),
		)
	}
}
