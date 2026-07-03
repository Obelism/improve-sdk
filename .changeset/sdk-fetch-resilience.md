---
'@obelism/improve-sdk': minor
---

Harden config fetching and analytics against the backend's new rate-limiting, auth, and validation behavior:

- **Resilient config fetch**: retry transient failures (network, timeout, 5xx, 429) with exponential backoff + jitter, honoring a server `Retry-After`. Auth/validation rejections (403/404/400) fail fast. New `configRetries` option (default 2).
- **Typed errors**: config fetch now throws `ImproveFetchError` carrying `reason`, HTTP `status`, and `retryAfterMs`, instead of a single opaque "timed-out" message — so a bad token/origin is distinguishable from a transient failure.
- **Empty-config guard**: an empty `{}` response (unknown org/env) is normalized so `tests`/`flags`/`audience` are always present, fixing a `Cannot read properties of undefined` crash and failing open to defaults.
- **Analytics field caps**: `event` and `message` are truncated to the backend's 256-char limit so over-length values aren't silently dropped with a 400.
- **Reliable beacons**: analytics are sent with `keepalive` so conversions firing before a navigation aren't cancelled.
- **Rate-limit backoff**: after a 429 the client suspends analytics posting for a cooldown window (honoring `Retry-After`).
- **Edge caching**: new opt-in `configRevalidate` option, forwarded as `next: { revalidate }`, to reuse the datafile across requests now that the endpoint sends `Cache-Control: s-maxage`.
