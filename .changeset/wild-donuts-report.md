---
'@obelism/improve-sdk': minor
---

`postAnalytic`'s per-session dedup now supports a `dedupeKey` payload field.

Previously `postAnalytic` deduped purely by event name, so any event fired more
than once per page/session under the same name (e.g. a GA4-style
`view_promotion` or `view_item_list` fired once per item/promotion) would only
actually send the first time — every later call silently no-op'd.

Passing `dedupeKey` scopes the dedup to `event` + `dedupeKey` instead, so the
same event name can fire once per distinct subject:

```ts
postAnalytic('view_promotion', {
	message: 'Hero',
	params: { type: 'Hero' },
	dedupeKey: 'Hero',
})
```

Omitting `dedupeKey` keeps the existing once-per-event-name-per-session
behavior, so this is non-breaking for existing callers (`page_view`,
`purchase`, `sign_up`, ...).
