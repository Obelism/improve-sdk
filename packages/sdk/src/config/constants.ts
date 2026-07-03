export const COOKIE_NAME_VISITOR = 'visitorId'

export const VISITOR_ID_PREFIX = 'visi'

export const VISITOR_ID_LENGTH = 26

export const VISITOR_ID_SEPARATOR = '_'

/** Default number of retries for a failed config fetch (network / 5xx / 429). */
export const CONFIG_RETRY_COUNT = 2

/** Base delay for config-fetch backoff, in ms. */
export const CONFIG_RETRY_BASE_DELAY_MS = 300

/** Upper bound for a single config-fetch backoff wait, in ms. */
export const CONFIG_RETRY_MAX_DELAY_MS = 3000

/**
 * Max length of a single analytic string field. The backend rejects any
 * field longer than this (varchar(256)) with a 400, so the client caps
 * developer-controlled values (event, message) to avoid silently dropping
 * the event.
 */
export const MAX_ANALYTIC_FIELD_LENGTH = 256

/**
 * How long to stop sending analytics after the backend returns 429 (usage
 * limit / rate limit) without a `Retry-After`. Avoids hammering an org that is
 * already over its quota.
 */
export const ANALYTIC_RATE_LIMIT_COOLDOWN_MS = 60_000
