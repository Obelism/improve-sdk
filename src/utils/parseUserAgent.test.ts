import { expect, test } from 'vitest'

import { parseUserAgent } from './parseUseragent'

test('Mac OS Safari', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
	)

	expect(outcome).toStrictEqual({
		pointer: 'fine',
		device: 'desktop',
		browser: 'safari',
		os: 'mac os',
	})
})

test('Mac OS Firefox', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.1; rv:121.0) Gecko/20100101 Firefox/121.0',
	)

	expect(outcome).toStrictEqual({
		pointer: 'fine',
		device: 'desktop',
		browser: 'firefox',
		os: 'mac os',
	})
})

test('Mac OS Chrome', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
	)

	expect(outcome).toStrictEqual({
		pointer: 'fine',
		device: 'desktop',
		browser: 'chrome',
		os: 'mac os',
	})
})

test('Mac OS Edge', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91',
	)

	expect(outcome).toStrictEqual({
		pointer: 'fine',
		device: 'desktop',
		browser: 'edge',
		os: 'mac os',
	})
})

test('Mac OS Vivaldi', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Vivaldi/6.5.3206.42',
	)

	expect(outcome).toStrictEqual({
		pointer: 'fine',
		device: 'desktop',
		browser: 'other',
		os: 'mac os',
	})
})

test('iOS Safari', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
	)

	expect(outcome).toStrictEqual({
		pointer: 'coarse',
		device: 'mobile',
		browser: 'safari',
		os: 'ios',
	})
})

test('iOS Chrome', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1',
	)

	expect(outcome).toStrictEqual({
		pointer: 'coarse',
		device: 'mobile',
		browser: 'chrome',
		os: 'ios',
	})
})

test('iOS Firefox', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/121.0 Mobile/15E148 Safari/605.1.15',
	)

	expect(outcome).toStrictEqual({
		pointer: 'coarse',
		device: 'mobile',
		browser: 'firefox',
		os: 'ios',
	})
})

test('Android Chrome', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (Linux; Android 14; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
	)

	expect(outcome).toStrictEqual({
		pointer: 'coarse',
		device: 'mobile',
		browser: 'chrome',
		os: 'android',
	})
})

test('Android Firefox', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (Android 14; Mobile; LG-M255; rv:121.0) Gecko/121.0 Firefox/121.0',
	)

	expect(outcome).toStrictEqual({
		pointer: 'coarse',
		device: 'mobile',
		browser: 'firefox',
		os: 'android',
	})
})

test('Windows Edge', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91',
	)

	expect(outcome).toStrictEqual({
		pointer: 'fine',
		device: 'desktop',
		browser: 'edge',
		os: 'windows',
	})
})

test('Windows IE', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
	)

	expect(outcome).toStrictEqual({
		pointer: 'fine',
		device: 'desktop',
		browser: 'ie',
		os: 'windows',
	})
})

test('Windows Chrome', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
	)

	expect(outcome).toStrictEqual({
		pointer: 'fine',
		device: 'desktop',
		browser: 'chrome',
		os: 'windows',
	})
})

test('Windows Firefox', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
	)

	expect(outcome).toStrictEqual({
		pointer: 'fine',
		device: 'desktop',
		browser: 'firefox',
		os: 'windows',
	})
})

test('Windows Vivaldi', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Vivaldi/6.5.3206.42',
	)

	expect(outcome).toStrictEqual({
		pointer: 'fine',
		device: 'desktop',
		browser: 'other',
		os: 'windows',
	})
})

test('ChromeOS Chrome', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (X11; CrOS aarch64 15359.58.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.134 Safari/537.36',
	)

	expect(outcome).toStrictEqual({
		pointer: 'fine',
		device: 'desktop',
		browser: 'chrome',
		os: 'unix',
	})
})

test('ChromeOS Armv7l', () => {
	const outcome = parseUserAgent(
		'Mozilla/5.0 (X11; CrOS aarch64 15359.58.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.134 Safari/537.36',
	)

	expect(outcome).toStrictEqual({
		pointer: 'fine',
		device: 'desktop',
		browser: 'chrome',
		os: 'unix',
	})
})

test('No arguments', () => {
	// @ts-expect-error Invalid params test
	const outcome = parseUserAgent()
	expect(outcome).toBe(null)
})
