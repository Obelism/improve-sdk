---
'@obelism/improve-sdk': minor
'@obelism/improve-sdk-react': minor
---

Rich analytics payloads and GA4 / GTM event-name alignment.

- **Structured `postAnalytic` payload**: the third argument now accepts a `{ value, currency, message, params }` object (GA4-style) in addition to the previous plain `message` string, which still works as a shorthand for `{ message }`. Pass a `value` (with `currency`) on your conversion event to unlock **revenue and average order value per variant**; `params` (e.g. a GA4 `ecommerce` object) is stored and mirrored to the GTM dataLayer.
- **GTM dataLayer ecommerce**: `value`, `currency`, and any `params` ride along on the mirrored dataLayer entry, and passing a GA4 `ecommerce` object first pushes `{ ecommerce: null }` to clear the previous one (GA4-recommended reset).
- **Event-name conventions**: new `ImproveEventName` / `ImproveRecommendedEventName` types offer the GA4 recommended names (`add_to_cart`, `purchase`, …) as autocomplete while still accepting any string. `postAnalytic` warns in development (once per name) when an event isn't `snake_case`; silence all SDK warnings with the new `disableWarnings` setup option. Event names in the reserved `gtm.*` namespace are ignored.
- **Contract hardening**: `currency` is capped to the backend's 8-char limit, an invalid (non-object / array) `params` is dropped instead of failing the whole event, and an over-8KB payload warns before the backend would reject it — so a large `params` doesn't silently lose the event.
- **Config types**: `ImproveEvents` gains an optional `funnel` (ordered funnel steps) to match the datafile.
- The React `usePostAnalytic` hook accepts the same structured payload and `ImproveEventName` typing.
