import { Configuration } from 'config'
import { ParsedUserAgent, parseUserAgent } from './utils/parseUserAgent'
import { timeoutFetch } from './utils/timeoutFetch'
import { getVisitorMatchesAudience } from './utils/getVisitorMatchesAudience'
import { getRandomTestValue } from './utils/getRandomTestValue'
import { getRandomString } from './utils/getRandomString'

type ConfigFetch = {
	url: string
	timeout?: number
}

export type ImproveArgs = {
	config: Configuration | ConfigFetch
	analyticsUrls: string
}

type Visitors = {
	[visitorId: string]: {
		[userAgent: string]: ParsedUserAgent & {
			[testSlug: string]: string
		}
	}
}

export class ImproveSDK {
	#configFetch: ConfigFetch | null = null
	#config: Configuration | null = null

	#visitors: Visitors = {}

	constructor({ config, analyticsUrls }: ImproveArgs) {
		if (!config) throw new Error('Config is required')

		// @ts-expect-error Checking what type config is
		if (typeof config.url === 'string') {
			this.#configFetch = config as ConfigFetch
		} else {
			this.#config = config as Configuration
		}

		if (!analyticsUrls) throw new Error('An "analyticsUrls" is required')
	}

	fetchConfig = async () => {
		if (this.#config) return

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
		this.#config = await res.json()
	}

	generateVisitorId = () => `visi_${getRandomString(26).toUpperCase()}`

	getTestValue = (visitorId: string, userAgent: string, testSlug: string) => {
		if (!this.#config) return null

		if (this.#visitors?.[visitorId]?.[userAgent]?.[testSlug]) {
			return this.#visitors[visitorId][userAgent][testSlug]
		}

		this.#visitors[visitorId] = this.#visitors[visitorId] || {}
		this.#visitors[visitorId][userAgent] =
			this.#visitors[visitorId][userAgent] || parseUserAgent(userAgent)

		const testConfig = this.#config.tests.find(({ slug }) => slug === testSlug)

		if (!testConfig) return null

		const audience = this.#config.audience[testConfig.audience]

		const visitorMatchesAudience = getVisitorMatchesAudience(
			audience,
			this.#visitors[visitorId][userAgent],
		)

		if (!visitorMatchesAudience) return testConfig.defaultValue

		const testValue = getRandomTestValue(testConfig.options)

		if (!testValue) return null

		this.#visitors[visitorId][userAgent][testSlug] = testValue
		return testValue
	}
}
