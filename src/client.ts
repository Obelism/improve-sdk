import { Configuration, EnvironmentOption } from './types'
import { ParsedUserAgent, parseUserAgent } from './utils/parseUserAgent'
import { getVisitorMatchesAudience } from './utils/getVisitorMatchesAudience'
import { getRandomTestValue } from './utils/getRandomTestValue'
import { BaseImproveSDK } from './base'
import { getRandomString } from './utils/getRandomString'
import { getCookie, setCookie } from './utils/clientCookie'

type FetchConfigParams = {
	organizationId: string
	environment: EnvironmentOption
	timeout?: number
}

export type ImproveArgs = {
	config: Configuration | FetchConfigParams
	analyticsUrls: string
}

type Visitor = ParsedUserAgent & {
	[testSlug: string]: string
}

const COOKIE_NAME_VISITOR = 'visitorId'

export class ImproveClientSDK extends BaseImproveSDK {
	#visitor: Visitor | undefined

	#visitorId: string = ''

	setupVisitor = (userAgent: string) => {
		this.#visitorId =
			getCookie(COOKIE_NAME_VISITOR) ||
			`visi_${getRandomString(26).toUpperCase()}`

		const parsedUserAgent = parseUserAgent(userAgent)

		if (!parsedUserAgent) return null

		this.#visitor = parsedUserAgent

		setCookie(COOKIE_NAME_VISITOR, this.#visitorId)

		return this.#visitorId
	}

	getTestValue = (testSlug: string) => {
		if (!this.config) return null

		const testConfig = this.config.tests[testSlug]

		if (!testConfig) return null

		if (!this.#visitorId || !this.#visitor) return testConfig.defaultValue
		if (this.#visitor?.[testSlug]) return this.#visitor[testSlug]

		const visitorMatchesAudience = getVisitorMatchesAudience(
			this.config.audience[testConfig.audience],
			this.#visitor,
		)

		if (!visitorMatchesAudience) return testConfig.defaultValue

		const testValue =
			getCookie(testSlug) || getRandomTestValue(testConfig.options)

		if (!testValue) return null

		this.#visitor[testSlug] = testValue

		setCookie(testSlug, testValue)

		return testValue
	}
}
