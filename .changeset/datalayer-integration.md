---
'@obelism/improve-sdk': minor
---

Add GTM / Google Ads dataLayer integration. The client SDK's `postAnalytic` now mirrors each event onto `window.dataLayer` with experiment dimensions (`improve: { test, variant, visitorId }`, tagged `_improve` for loop prevention), so events can drive Google Tag Manager / Google Ads conversions. Enabled by default; opt out with `dataLayer: false` in the setup args.
