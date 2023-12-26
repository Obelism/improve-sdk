import { Configuration, EnvironmentOption } from './types'
import { ParsedUserAgent, parseUserAgent } from './utils/parseUserAgent'
import { getVisitorMatchesAudience } from './utils/getVisitorMatchesAudience'
import { getRandomTestValue } from './utils/getRandomTestValue'
import { BaseImproveSDK } from './base'
import { getRandomString } from './utils/getRandomString'

type FetchConfigParams = {
	organizationId: string
	environment: EnvironmentOption
	timeout?: number
}

export type ImproveArgs = {
	config: Configuration | FetchConfigParams
	analyticsUrls: string
}

type Visitors = {
	[visitorId: string]: {
		[userAgent: string]: ParsedUserAgent & {
			[testSlug: string]: string
		}
	}
}

export class ImproveServerSDK extends BaseImproveSDK {
	#visitors: Visitors = {}

	generateVisitorId = () => `visi_${getRandomString(26).toUpperCase()}`

	getTestConfig = (testSlug: string) => {
		if (!this.config) return null
		return this.config.tests[testSlug]
	}

	getTestValue = (testSlug: string, visitorId: string, userAgent: string) => {
		const testConfig = this.getTestConfig(testSlug)

		if (!testConfig || !this.config) return null

		if (!visitorId) return testConfig.defaultValue

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

		if (Math.random() * 100 > testConfig.allocation) {
			this.#visitors[visitorId][userAgent][testSlug] = testConfig.defaultValue
			return this.#visitors[visitorId][userAgent][testSlug]
		}

		const testValue = getRandomTestValue(testConfig.options)

		if (!testValue) return null

		this.#visitors[visitorId][userAgent][testSlug] = testValue
		return testValue
	}
}
