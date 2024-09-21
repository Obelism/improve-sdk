import { ParsedUserAgent, parseUserAgent } from './utils/parseUserAgent'
import { getVisitorMatchesAudience } from './utils/getVisitorMatchesAudience'
import { getRandomTestValue } from './utils/getRandomTestValue'
import { BaseImproveSDK } from './base'
import { ImproveSetupArgs } from './types'

type Visitors = {
	[visitorId: string]: {
		[userAgent: string]: ParsedUserAgent & {
			[testSlug: string]: string
		}
	}
}

type ImproveServerSetupArgs = ImproveSetupArgs & {
	token: string
}

export class ImproveServerSDK extends BaseImproveSDK {
	#visitors: Visitors = {}
	#token: string

	constructor({ token, ...args }: ImproveServerSetupArgs) {
		super(args)
		this.#token = token
	}

	fetchConfig = async (config?: RequestInit) => {
		return this._fetchConfig({
			...config,
			headers: {
				...config?.headers,
				token: this.#token,
			},
		})
	}

	getFlagConfig = (flagSlug: string) => this.config?.flags?.[flagSlug]

	getTestConfig = (testSlug: string) => this.config?.tests?.[testSlug]

	getFlagValue = (flagSlug: string, visitorId: string, userAgent: string) => {
		const flagConfig = this.getFlagConfig(flagSlug)

		if (!flagConfig || !this.config) return null
		if (!visitorId) return flagConfig.options[0].slug

		if (this.#visitors?.[visitorId]?.[userAgent]?.[flagSlug]) {
			return this.#visitors[visitorId][userAgent][flagSlug]
		}

		this.#visitors[visitorId] = this.#visitors[visitorId] || {}
		this.#visitors[visitorId][userAgent] =
			this.#visitors[visitorId][userAgent] || parseUserAgent(userAgent)

		const visitorMatchesAudience = getVisitorMatchesAudience(
			this.config.audience[flagConfig.audience],
			this.#visitors[visitorId][userAgent],
		)

		if (!visitorMatchesAudience) return flagConfig.options[0].slug

		const flagValue = getRandomTestValue(flagConfig.options)

		if (!flagValue) return null

		this.#visitors[visitorId][userAgent][flagSlug] = flagValue
		return flagValue
	}

	getTestValue = (testSlug: string, visitorId: string, userAgent: string) => {
		const testConfig = this.getTestConfig(testSlug)

		if (!testConfig || !this.config) return null

		if (!visitorId || !userAgent) return testConfig.defaultValue

		if (this.#visitors?.[visitorId]?.[userAgent]?.[testSlug]) {
			return this.#visitors[visitorId][userAgent][testSlug]
		}

		this.#visitors[visitorId] = this.#visitors[visitorId] || {}
		this.#visitors[visitorId][userAgent] =
			this.#visitors[visitorId][userAgent] || parseUserAgent(userAgent)

		const visitorMatchesAudience = getVisitorMatchesAudience(
			this.config.audience[testConfig.audience],
			this.#visitors[visitorId][userAgent],
		)

		if (!visitorMatchesAudience) return testConfig.defaultValue

		if (
			testConfig.allocation < 100 &&
			Math.random() * 100 > testConfig.allocation
		) {
			this.#visitors[visitorId][userAgent][testSlug] = testConfig.defaultValue
			return this.#visitors[visitorId][userAgent][testSlug]
		}

		const testValue = getRandomTestValue(testConfig.options)

		if (!testValue) return null

		this.#visitors[visitorId][userAgent][testSlug] = testValue
		return testValue
	}
}
