import { type NextRequest } from 'next/server'
import { ImproveServerSDK } from '@obelism/improve-sdk/server'
import { generateImproveNextMiddleware } from '@obelism/improve-sdk-next'

import { IMPROVE_CONFIG } from './app/improveConfig'

export const config = {
	matcher: '/',
}

const improveSdk = new ImproveServerSDK({
	...IMPROVE_CONFIG,
	token: 'bumhUt-7rycke-jabvix',
})

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
	await improveSdk.fetchConfig()
	return improveMiddlewareHandler(request)
}
