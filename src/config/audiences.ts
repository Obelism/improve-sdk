/**
 * @constant AUDIENCE_PARAMS
 * @description All posibile audience tracking options
 */
export const AUDIENCE_PARAMS = {
	//? Technical
	pointer: ['coarse', 'fine'],
	device: [
		'wearable',
		'mobile',
		'tablet',
		'console',
		'smarttv',
		'embedded',
		'desktop',
	],
	// screen: ['small', 'medium', 'large', 'xlarge'],
	browser: [
		'chrome',
		'safari',
		'firefox',
		'edge',
		'ie',
		'samsung internet',
		'social',
		'other',
	],
	os: ['mac os', 'ios', 'android', 'windows', 'unix'],
} as const

//? Generated types
export type AudienceParamKey = keyof typeof AUDIENCE_PARAMS

export type AudienceParamPointer = (typeof AUDIENCE_PARAMS.pointer)[number]

export type AudienceParamDevice = (typeof AUDIENCE_PARAMS.device)[number]

export type AudienceParamBrowser = (typeof AUDIENCE_PARAMS.browser)[number]

export type AudienceParamOs = (typeof AUDIENCE_PARAMS.os)[number]

export const AUDIENCE_PARAM_KEYS = Object.keys(
	AUDIENCE_PARAMS,
) as ReadonlyArray<AudienceParamKey>
