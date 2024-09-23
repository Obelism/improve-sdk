import { ParsedUserAgent, parseUserAgent } from './utils/parseUserAgent'
import { getVisitorMatchesAudience } from './utils/getVisitorMatchesAudience'
import { getRandomTestValue } from './utils/getRandomTestValue'
import { BaseImproveSDK } from './base'
import { getCookie, setCookie } from './utils/clientCookie'
import { ANALYTICS_PATH, BASE_URL } from './config/urls'
import { getScreenSize } from './utils/getScreenSize'
import { ImproveEnvironmentOption, ImproveSetupArgs } from './types'

type Visitor = ParsedUserAgent & {
	[testSlug: string]: string
}

export type CreateAnalytic = {
	organizationId: string
	environment: ImproveEnvironmentOption

	testId: string
	testValue: string
	visitorId: string

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

export class ImproveClientSDK extends BaseImproveSDK {
	#visitor: Visitor | undefined
	#visitorRecurring: boolean = false

	#visitorId: string = ''

	#analytics: TrackedAnalytics = {}

	#analyticsUrl = `${BASE_URL}${ANALYTICS_PATH}`

	fetchConfig = this._fetchConfig

	constructor(args: ImproveSetupArgs) {
		super(args)
		this.#analyticsUrl = `${this._baseUrl}${ANALYTICS_PATH}`
	}

	setupVisitor = (userAgent: string = window.navigator.userAgent) => {
		const cookieVisitorId = getCookie(this.getVisitorCookieName())
		const validCookieVisitorId =
			cookieVisitorId && this.validateVisitorId(cookieVisitorId)

		this.#visitorRecurring = validCookieVisitorId
		this.#visitorId = validCookieVisitorId
			? cookieVisitorId
			: this.generateVisitorId()

		const parsedUserAgent = parseUserAgent(userAgent)

		if (!parsedUserAgent) return null

		this.#visitor = parsedUserAgent

		setCookie(this.getVisitorCookieName(), this.#visitorId)

		return this.#visitorId
	}

	getFlagValue = (flagSlug: string) => {
		if (!this.config) return null

		const flagConfig = this.config.flags[flagSlug]

		if (!flagConfig || !flagConfig.options[0]) return null

		if (!this.#visitor) this.setupVisitor()
		if (!this.#visitorId || !this.#visitor) return flagConfig.options[0].slug
		if (this.#visitor?.[flagSlug]) return this.#visitor[flagSlug]

		const visitorMatchesAudience = getVisitorMatchesAudience(
			this.config.audience[flagConfig.audience],
			this.#visitor,
		)

		if (!visitorMatchesAudience) return flagConfig.options[0].slug

		const flagValue =
			getCookie(flagSlug) || getRandomTestValue(flagConfig.options)

		if (!flagValue) return null

		this.#visitor[flagSlug] = flagValue

		setCookie(flagSlug, flagValue)

		return flagValue
	}

	getTestValue = (testSlug: string) => {
		if (!this.config) return null

		const testConfig = this.config.tests[testSlug]

		if (!testConfig) return null

		if (!this.#visitor) this.setupVisitor()

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

		const cookieTestValue = getCookie(testSlug)
		const validCookieTestValue =
			cookieTestValue && this.validateTestValue(testSlug, cookieTestValue)
		const testValue = validCookieTestValue
			? cookieTestValue
			: getRandomTestValue(testConfig.options)

		if (!testValue) return null

		this.#visitor[testSlug] = testValue

		setCookie(testSlug, testValue)

		return testValue
	}

	setAnalyticsUrls = (url: string) => {
		this.#analyticsUrl = url
	}

	postAnalytic = (testSlug: string, event: string, message?: string) => {
		if (!this.config) return null

		const testConfig = this.config.tests[testSlug]

		if (!this.#visitor) this.setupVisitor()
		if (!testConfig || !this.#visitor || this.#analytics?.[testSlug]?.[event]) {
			return null
		}

		const testSlugAnalytics = this.#analytics[testSlug] || {}
		testSlugAnalytics[event] = true
		this.#analytics[testSlug] = testSlugAnalytics

		let testValue = this.#visitor?.[testSlug] || null
		if (!testValue) {
			testValue = this.getTestValue(testSlug) || null
		}

		if (!testValue) return

		const body: CreateAnalytic = {
			organizationId: this.organizationId,
			environment: this.environment,

			testId: testConfig.id,
			testValue: testValue,
			visitorId: this.#visitorId,
			pointer: this.#visitor.pointer,
			device: this.#visitor.device,
			screen: getScreenSize(),
			browser: this.#visitor.browser,
			os: this.#visitor.os,
			visitor: this.#visitorRecurring ? 'recurring' : 'new',
			event: event,
			message: message || '',
		}

		return fetch(this.#analyticsUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		})
	}
}
