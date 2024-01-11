import { ParsedUserAgent, parseUserAgent } from './utils/parseUserAgent'
import { getVisitorMatchesAudience } from './utils/getVisitorMatchesAudience'
import { getRandomTestValue } from './utils/getRandomTestValue'
import { BaseImproveSDK } from './base'
import { getRandomString } from './utils/getRandomString'

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

	getFeatureConfig = (featureSlug: string) =>
		this.config?.features?.[featureSlug]

	getTestConfig = (testSlug: string) => this.config?.tests?.[testSlug]

	getFeatureValue = (
		featureSlug: string,
		visitorId: string,
		userAgent: string,
	) => {
		const featureConfig = this.getFeatureConfig(featureSlug)

		if (!featureConfig || !this.config) return null
		if (!visitorId) return featureConfig.defaultValue

		if (this.#visitors?.[visitorId]?.[userAgent]?.[featureSlug]) {
			return this.#visitors[visitorId][userAgent][featureSlug]
		}

		this.#visitors[visitorId] = this.#visitors[visitorId] || {}
		this.#visitors[visitorId][userAgent] =
			this.#visitors[visitorId][userAgent] || parseUserAgent(userAgent)

		const visitorMatchesAudience = getVisitorMatchesAudience(
			this.config.audience[featureConfig.audience],
			this.#visitors[visitorId][userAgent],
		)

		if (!visitorMatchesAudience) return featureConfig.defaultValue

		const featureValue = getRandomTestValue(featureConfig.options)

		if (!featureValue) return null

		this.#visitors[visitorId][userAgent][featureSlug] = featureValue
		return featureValue
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
