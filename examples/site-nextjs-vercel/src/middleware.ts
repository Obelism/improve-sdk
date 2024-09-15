import { NextResponse, type NextRequest } from 'next/server'
import { get as getFromEdgeConfig } from '@vercel/edge-config'
import { type ImproveConfiguration } from '@obelism/improve-sdk/types'
import { ImproveServerSDK } from '@obelism/improve-sdk/server'
import { generateImproveNextMiddleware } from '@obelism/improve-sdk-next'

import { IMPROVE_CONFIG } from './app/improveConfig'

export const config = {
	matcher: '/',
}

const improveSdk = new ImproveServerSDK(IMPROVE_CONFIG)

const improveMiddlewareHandler = generateImproveNextMiddleware({
	improveSdk,
	serverABtests: [
		{
			slug: 'startpage-visual',
			routeHandler: '/',
			options: [
				{
					value: 'control',
					slug: '/',
				},
				{
					value: 'variation',
					slug: '/variation',
				},
			],
		},
	],
})

export const middleware = async (request: NextRequest) => {
	const config = await getFromEdgeConfig(IMPROVE_CONFIG.environment)
	if (!config) return NextResponse.next()

	improveSdk.loadConfig(config as ImproveConfiguration)
	return improveMiddlewareHandler(request)
}
