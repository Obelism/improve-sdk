import { ImproveServerSDK } from '@obelism/improve-sdk/server'
import { NextURL } from 'next/dist/server/web/next-url'
import type { NextRequest } from 'next/server'
import { NextResponse, userAgent } from 'next/server'

import { extendedBotCheck } from './extendedBotCheck'
import { matchesRoute } from './matchesRoute'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export type OptionConfig = { value: string; slug: string }

export type ServerABTestConfig = {
	slug: string
	routeHandler: string
	formatSlug?: (url: NextURL, matchingOption: OptionConfig) => NextURL
	options: OptionConfig[]
}

export const generateImproveNextMiddleware = (args: {
	improveSdk: ImproveServerSDK
	serverABtests: ServerABTestConfig[]
	options?: {
		visitorId?: ResponseCookie
		testValue?: ResponseCookie
	}
}) => {
	return (request: NextRequest) => {
		const visitorCookieName = args.improveSdk.getVisitorCookieName()

		const cookieVisitorId = request.cookies.get(visitorCookieName)?.value
		const validCookieVisitorId =
			cookieVisitorId && args.improveSdk.validateVisitorId(cookieVisitorId)
		const visitorId = validCookieVisitorId
			? cookieVisitorId
			: args.improveSdk.generateVisitorId()

		const { ua = '', isBot = false } = userAgent(request)

		if (isBot || extendedBotCheck(ua)) return NextResponse.next()

		const serverABTestConfig = args.serverABtests.find((route) =>
			matchesRoute(route.routeHandler, request.nextUrl.pathname),
		)

		if (!serverABTestConfig) return NextResponse.next()

		const basePath = serverABTestConfig.options.at(0)?.value

		if (!basePath) return NextResponse.next()

		const validateValue = (value: string | null | undefined) => {
			return value &&
				args.improveSdk.validateTestValue(serverABTestConfig.slug, value)
				? value
				: null
		}

		const testValue =
			validateValue(
				request.nextUrl.searchParams.get(serverABTestConfig.slug),
			) ||
			validateValue(request.cookies.get(serverABTestConfig.slug)?.value) ||
			args.improveSdk.getTestValue(serverABTestConfig.slug, visitorId, ua)

		const testMatchOption = serverABTestConfig.options.find(
			(option) => option.value === testValue,
		)

		if (testMatchOption && testMatchOption.value !== basePath) {
			const url = request.nextUrl.clone()

			url.pathname = serverABTestConfig?.formatSlug
				? serverABTestConfig?.formatSlug(url, testMatchOption)?.pathname
				: testMatchOption.slug

			const response = NextResponse.rewrite(url)

			response.cookies.set(visitorCookieName, visitorId)
			response.cookies.set(serverABTestConfig.slug, testMatchOption.value)

			return response
		}

		const response = NextResponse.next()

		response.cookies.set(visitorCookieName, visitorId, {
			maxAge: 60 * 60 * 24 * 7,
			...args.options?.visitorId,
		})
		response.cookies.set(serverABTestConfig.slug, testValue, {
			maxAge: 60 * 60 * 24 * 7,
			...args.options?.testValue,
		})

		return response
	}
}
