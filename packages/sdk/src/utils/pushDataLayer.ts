export type ImproveDataLayerEntry = {
	event: string
	improve: {
		test: string
		variant: string
		visitorId: string
	}
	/**
	 * Marks the entry as originating from Improve so platform-side dataLayer
	 * importers can ignore it (loop prevention).
	 */
	_improve: true
}

declare global {
	interface Window {
		dataLayer?: Record<string, unknown>[]
	}
}

/**
 * Mirror an analytic onto the GTM dataLayer (with experiment dimensions) so it
 * can drive Google Tag Manager / Google Ads conversions. No-op outside the
 * browser. Initializes window.dataLayer if GTM hasn't yet.
 */
export const pushDataLayer = (entry: ImproveDataLayerEntry) => {
	if (typeof window === 'undefined') return

	window.dataLayer = window.dataLayer || []
	window.dataLayer.push(entry)
}
