import { afterEach, expect, test } from 'vitest'

import { ImproveDataLayerEntry, pushDataLayer } from './pushDataLayer'

const setWindow = (value: unknown) => {
	;(globalThis as { window?: unknown }).window = value
}

afterEach(() => {
	delete (globalThis as { window?: unknown }).window
})

const entry: ImproveDataLayerEntry = {
	event: 'pageLoad',
	improve: { test: 'hero', variant: 'b', visitorId: 'visi_X' },
	_improve: true,
}

test('initializes the dataLayer and pushes the entry', () => {
	setWindow({})

	pushDataLayer(entry)

	expect((globalThis as { window: Window }).window.dataLayer).toEqual([entry])
})

test('appends when GTM already created the dataLayer', () => {
	setWindow({ dataLayer: [{ event: 'gtm.js' }] })

	pushDataLayer(entry)

	const { dataLayer } = (globalThis as { window: Window }).window
	expect(dataLayer).toHaveLength(2)
	expect(dataLayer?.[1]).toEqual(entry)
})

test('is a no-op without a window (server-side)', () => {
	expect(() => pushDataLayer(entry)).not.toThrow()
})
