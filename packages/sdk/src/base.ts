import {
	COOKIE_NAME_VISITOR,
	VISITOR_ID_LENGTH,
	VISITOR_ID_PREFIX,
	VISITOR_ID_SEPARATOR,
} from './config/constants'
import { CONFIG_PATH, BASE_URL } from './config/urls'
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
	organizationId: string
	environment: ImproveEnvironmentOption = 'develop'
	state: ImproveTestState

	#configFetch: ConfigFetch | null = null

	config: ImproveConfiguration | null = null

	_baseUrl: undefined | string

	constructor({
		organizationId,
		environment,
		state,
		config,
		fetchTimeout,
		baseUrl,
	}: ImproveSetupArgs) {
		this.organizationId = organizationId
		this.environment = environment
		this.state = state
		this._baseUrl = baseUrl || BASE_URL

		if (config) {
			this.config = config
		} else {
			this.#configFetch = {
				url: [
					`${this._baseUrl}${CONFIG_PATH}`,
					this.organizationId,
					this.environment,
					this.state || 'active',
				].join('/'),
				timeout: fetchTimeout || 3000,
			}
		}
	}

	_fetchConfig = async (config?: RequestInit) => {
		if (this.config) return

		if (!this.#configFetch) throw new Error('No config fetch setup provided')

		const res = await timeoutFetch(
			this.#configFetch.timeout,
			this.#configFetch.url,
			config,
		)
		if (!res || !res.ok) throw new Error('Configuration fetch timed-out')

		this.config = await res.json()
		return this.config
	}

	loadConfig = (config: ImproveConfiguration) => {
		this.config = config
	}

	generateVisitorId = () => {
		return [
			VISITOR_ID_PREFIX,
			getRandomString(VISITOR_ID_LENGTH).toUpperCase(),
		].join(VISITOR_ID_SEPARATOR)
	}

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

	validateVisitorId = (possibleVisitorId: string) => {
		const visitorIdParts = possibleVisitorId.split(VISITOR_ID_SEPARATOR)
		if (visitorIdParts.length !== 2) return false
		const [key, value] = visitorIdParts as [string, string]
		return key === VISITOR_ID_PREFIX && value.length === VISITOR_ID_LENGTH
	}
}
