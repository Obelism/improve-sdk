---
'@obelism/improve-sdk': major
'@obelism/improve-sdk-react': major
'@obelism/improve-sdk-next': major
---

Decouple analytics events from tests (test-independent event stream + exposures).

**Breaking.** Attribution moves from write time to read time. Events are now
recorded once per visitor, test-independently, and the server attributes them to
whichever tests/flags the visitor was exposed to. This enables sharing events
across tests/flags, flag analytics, and an org-wide event overview.

- **`postAnalytic` is now global**: the signature drops the leading `testSlug`
  argument — `postAnalytic(event, payload?)` instead of
  `postAnalytic(testSlug, event, payload?)`. An event is emitted once per
  page/session (deduped by event name) and carries no test/variant.
- **`usePostAnalytic()` takes no arguments** and returns
  `(event, payload?) => …`. Update call sites from
  `usePostAnalytic(slug)` → `usePostAnalytic()`.
- **Automatic exposure beacons**: `getTestValue` / `getFlagValue` now emit an
  exposure beacon the first time they resolve a non-holdout variant for a
  visitor (audience-excluded and allocation-holdout visitors are not exposed).
  This is what the server joins against to attribute events, so **a visitor must
  read their variant (`useTestValue` / `getTestValue`) for their events to
  count** — the old implicit "first tracked event = exposure" behavior is gone.
- **Beacon contract**: `POST /api/log` bodies are now discriminated by
  `type: 'event' | 'exposure'`; the event body no longer includes
  `testId`/`testValue`. Requires the matching server release (hard cutover — old
  beacons are rejected).
- The mirrored GTM dataLayer entry's `improve` object no longer includes
  `test` / `variant`, only `visitorId`.
