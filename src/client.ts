import { ParsedUserAgent, parseUserAgent } from './utils/parseUserAgent'
import { getVisitorMatchesAudience } from './utils/getVisitorMatchesAudience'
import { getRandomTestValue } from './utils/getRandomTestValue'
import { BaseImproveSDK } from './base'
import { getRandomString } from './utils/getRandomString'
import { getCookie, setCookie } from './utils/clientCookie'
import { ANALYTICS_URL } from './config/urls'
import { getScreenSize } from './utils/getScreenSize'
import { EnvironmentOption } from './types'

type Visitor = ParsedUserAgent & {
	[testSlug: string]: string
}

export type CreateAnalytic = {
	organizationId: string
	environment: EnvironmentOption

	test_id: string
	test_value: string
	visitor_id: string

	pointer: string
	device: string
	screen: string
	browser: string
	os: string
	visitor: string

	event: string
	message: string
}

type TrackedAnalytics = {
	[TestSlug: string]: {
		[Event: string]: boolean
	}
}

const COOKIE_NAME_VISITOR = 'visitorId'

export class ImproveClientSDK extends BaseImproveSDK {
	#visitor: Visitor | undefined
	#visitorRecurring: boolean = false

	#visitorId: string = ''

	#analytics: TrackedAnalytics = {}

	setupVisitor = (userAgent: string) => {
		const cookieVisitorId = getCookie(COOKIE_NAME_VISITOR)
		this.#visitorRecurring = Boolean(cookieVisitorId)

		this.#visitorId =
			cookieVisitorId || `visi_${getRandomString(26).toUpperCase()}`

		const parsedUserAgent = parseUserAgent(userAgent)

		if (!parsedUserAgent) return null

		this.#visitor = parsedUserAgent

		setCookie(COOKIE_NAME_VISITOR, this.#visitorId)

		return this.#visitorId
	}

	getFeatureValue = (featureSlug: string) => {
		if (!this.config) return null

		const featureConfig = this.config.features[featureSlug]

		if (!featureConfig) return null

		if (!this.#visitorId || !this.#visitor) return featureConfig.options[0].slug
		if (this.#visitor?.[featureSlug]) return this.#visitor[featureSlug]

		const visitorMatchesAudience = getVisitorMatchesAudience(
			this.config.audience[featureConfig.audience],
			this.#visitor,
		)

		if (!visitorMatchesAudience) return featureConfig.options[0].slug

		const featureValue =
			getCookie(featureSlug) || getRandomTestValue(featureConfig.options)

		if (!featureValue) return null

		this.#visitor[featureSlug] = featureValue

		setCookie(featureSlug, featureValue)

		return featureValue
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

		if (
			testConfig.allocation < 100 &&
			Math.random() * 100 > testConfig.allocation
		) {
			this.#visitor[testSlug] = testConfig.defaultValue
			return this.#visitor?.[testSlug]
		}

		const testValue =
			getCookie(testSlug) || getRandomTestValue(testConfig.options)

		if (!testValue) return null

		this.#visitor[testSlug] = testValue

		setCookie(testSlug, testValue)

		return testValue
	}

	postAnalytic = (testSlug: string, event: string, message?: string) => {
		if (!this.config) return null

		const testConfig = this.config.tests[testSlug]

		if (!testConfig || !this.#visitor || this.#analytics?.[testSlug]?.[event])
			return null
		this.#analytics[testSlug] = this.#analytics[testSlug] || {}
		this.#analytics[testSlug][event] = true

		if (!this.#visitor?.[testSlug]) this.getTestValue(testSlug)

		const body: CreateAnalytic = {
			organizationId: this.organizationId,
			environment: this.environment,

			test_id: testConfig.id,
			test_value: this.#visitor[testSlug],
			visitor_id: this.#visitorId,
			pointer: this.#visitor.pointer,
			device: this.#visitor.device,
			screen: getScreenSize(),
			browser: this.#visitor.browser,
			os: this.#visitor.os,
			visitor: this.#visitorRecurring ? 'recurring' : 'new',
			event: event,
			message: message || '',
		}

		fetch(ANALYTICS_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		})
	}
}
