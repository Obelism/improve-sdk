import { ParsedUserAgent, parseUserAgent } from './utils/parseUserAgent'
import { getVisitorMatchesAudience } from './utils/getVisitorMatchesAudience'
import { getRandomTestValue } from './utils/getRandomTestValue'
import { BaseImproveSDK } from './base'
import { getCookie, setCookie } from './utils/clientCookie'
import {
	ANALYTIC_RATE_LIMIT_COOLDOWN_MS,
	MAX_ANALYTIC_BODY_BYTES,
	MAX_ANALYTIC_FIELD_LENGTH,
	MAX_CURRENCY_FIELD_LENGTH,
} from './config/constants'
import { ANALYTICS_PATH, BASE_URL } from './config/urls'
import { getScreenSize } from './utils/getScreenSize'
import { isSnakeCaseEventName } from './utils/isSnakeCaseEventName'
import { pushDataLayer, resetDataLayerEcommerce } from './utils/pushDataLayer'
import { parseRetryAfterMs } from './utils/retry'
import { truncate } from './utils/truncate'
import {
	ImproveAnalyticPayload,
	ImproveEnvironmentOption,
	ImproveEventName,
	ImproveSetupArgs,
} from './types'

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

	/** GA4-aligned numeric value aggregated into revenue / AOV per variant. */
	value?: number
	/** ISO 4217 currency for `value`. */
	currency?: string
	/** Extra event params stored as JSON (e.g. a GA4 `ecommerce` object). */
	params?: Record<string, unknown>
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

	// Epoch ms until which analytics posting is suspended after a 429.
	#rateLimitedUntil: number = 0

	// Event names already warned about, so the snake_case nudge fires once per
	// offending name instead of on every call.
	#warnedEventNames = new Set<string>()

	#analyticsUrl = `${BASE_URL}${ANALYTICS_PATH}`

	#dataLayerEnabled: boolean = true

	fetchConfig = this._fetchConfig

	constructor(args: ImproveSetupArgs) {
		super(args)
		this.#analyticsUrl = `${this._baseUrl}${ANALYTICS_PATH}`
		this.#dataLayerEnabled = args.dataLayer ?? true
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

	postAnalytic = (
		testSlug: string,
		event: ImproveEventName,
		// Accepts a structured payload, or a plain string as shorthand for the
		// `message`. Backwards compatible with the previous `message?: string`.
		payload?: ImproveAnalyticPayload | string,
	) => {
		if (!this.config) return null

		// GTM reserves the `gtm.*` namespace for its own events; never emit into
		// it, or the mirrored dataLayer entry would collide with GTM internals.
		if (event.startsWith('gtm.')) return null

		// Nudge developers toward the snake_case / GA4 naming convention. Warn
		// once per offending name so it's noticeable without spamming the console;
		// silence entirely with the `disableWarnings` setup option.
		if (!isSnakeCaseEventName(event) && !this.#warnedEventNames.has(event)) {
			this.#warnedEventNames.add(event)
			this._warn(
				`Event name "${event}" isn't snake_case. Prefer GA4-style names ` +
					`like "add_to_cart" or "purchase" so your events line up with ` +
					`GA4 / Google Tag Manager. Pass \`disableWarnings: true\` at setup ` +
					`to silence this.`,
			)
		}

		// Suspended after a 429: skip sending, but don't mark the event as
		// tracked, so it can still fire once the cooldown elapses.
		if (Date.now() < this.#rateLimitedUntil) return null

		const { value, currency, message, params }: ImproveAnalyticPayload =
			typeof payload === 'string' ? { message: payload } : (payload ?? {})
		const hasValue = typeof value === 'number' && Number.isFinite(value)
		// The backend requires `params` to be a plain (non-array) object and 400s
		// the whole event otherwise — drop an invalid value rather than lose the
		// event.
		const validParams =
			params && typeof params === 'object' && !Array.isArray(params)
				? params
				: undefined

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
			// Cap developer-controlled fields to the backend's varchar(256) limit;
			// an over-length value is otherwise rejected with a 400 and the event
			// is lost.
			event: truncate(event, MAX_ANALYTIC_FIELD_LENGTH),
			message: truncate(message || '', MAX_ANALYTIC_FIELD_LENGTH),
			...(hasValue ? { value } : {}),
			...(currency
				? { currency: truncate(currency, MAX_CURRENCY_FIELD_LENGTH) }
				: {}),
			...(validParams ? { params: validParams } : {}),
		}

		if (this.#dataLayerEnabled) {
			// Clear any prior ecommerce object first so its keys don't bleed into
			// this event (GTM/GA4 best practice).
			if (validParams && 'ecommerce' in validParams) resetDataLayerEcommerce()

			pushDataLayer({
				event,
				improve: {
					test: testSlug,
					variant: testValue,
					visitorId: this.#visitorId,
				},
				...(hasValue ? { value } : {}),
				...(currency ? { currency } : {}),
				// Spread custom params (incl. a GA4 `ecommerce` object) to the top
				// level so GA4/GTM tags can read them directly.
				...(validParams ?? {}),
				_improve: true,
			})
		}

		// Serialize once so we can both measure and send the same bytes.
		const serializedBody = JSON.stringify(body)

		// The backend rejects bodies over 8KB with a 413 — realistically only an
		// oversized `params` (e.g. a large GA4 `ecommerce.items` array) gets there.
		// Warn so the dropped event isn't silent; still attempt the send in case
		// the server limit differs.
		if (
			typeof TextEncoder !== 'undefined' &&
			new TextEncoder().encode(serializedBody).length > MAX_ANALYTIC_BODY_BYTES
		) {
			this._warn(
				`Analytic for "${event}" exceeds the ${MAX_ANALYTIC_BODY_BYTES}-byte ` +
					`limit and will be rejected by the server — trim the \`params\` payload.`,
			)
		}

		// `keepalive` lets the beacon outlive the page: conversion events are
		// often fired immediately before a navigation/unload, and a normal fetch
		// would be cancelled with the document. The 8KB body cap is well within
		// the browser's 64KB keepalive budget.
		const request = fetch(this.#analyticsUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: serializedBody,
			keepalive: true,
		})

		// Back off when the org hits its usage/rate limit. Honor a server
		// Retry-After when present, otherwise use a fixed cooldown.
		request
			.then((res) => {
				if (res?.status === 429) {
					const retryAfterMs = parseRetryAfterMs(res.headers.get('Retry-After'))
					this.#rateLimitedUntil =
						Date.now() + (retryAfterMs ?? ANALYTIC_RATE_LIMIT_COOLDOWN_MS)
				}
			})
			.catch(() => {})

		return request
	}
}
