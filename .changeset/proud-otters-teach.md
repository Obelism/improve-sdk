---
'@obelism/improve-sdk': major
---

`postAnalytic`'s `message` field is replaced by a required `scope` positional
argument.

Previously the second half of an event's identity (`message`) was optional
free text — in practice used inconsistently across integrations (a URL path
on one event, a button label on another, often left empty). `scope` makes
that second dimension mandatory and structured: a short, stable identifier
for where/what the event refers to, always present, not display text.

```ts
// Before
postAnalytic('button_click', {
	message: 'Sign in',
	params: { label: 'Sign in' },
})

// After
postAnalytic('button_click', 'homepage_hero_login', {
	params: { label: 'Sign in' },
})
```

The plain-string shorthand (`postAnalytic(event, 'some message')`) is removed
— the shorthand for the common case is now simply passing `scope` directly:
`postAnalytic('page_view', 'homepage')`.

`ImproveEvents`' `start`/`metrics`/`conversion` fields change from bare event
names to `{ event, scope }` pairs (`ImproveEventRef`) to match. `funnel`, and
exposure tracking (`getTestValue`/`getFlagValue`), are unaffected.
