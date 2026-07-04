---
'@obelism/improve-sdk': minor
'@obelism/improve-sdk-react': minor
'@obelism/improve-sdk-next': minor
---

Country audience targeting (SSR/edge).

- Audiences can now target `country` (ISO 3166-1 alpha-2). Coarse geo is derived
  from the request server-side — the browser can't determine it from the user
  agent — so country targeting resolves during **SSR / middleware bucketing**.
- `ImproveServerSDK.getTestValue` / `getFlagValue` accept an optional
  `geo: { country }` argument, merged into the visitor before audience matching.
- The Next middleware reads `x-vercel-ip-country` (falling back to Cloudflare's
  `cf-ipcountry`) and passes it into bucketing automatically.
- `ParsedUserAgent` gains an optional `country`; `AUDIENCE_PARAMS` gains a
  `country` key so audiences can carry it.

**Behavior change:** the client SDK now trusts a valid existing assignment cookie
_before_ re-evaluating audience/allocation in `getTestValue` / `getFlagValue`.
This makes an already-bucketed visitor sticky (and lets the browser honor a
country-targeted variant that middleware assigned server-side, recording its
exposure). Previously a returning visitor was re-checked against the audience on
every call.
