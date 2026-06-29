---
'@obelism/improve-sdk': major
---

Require ua-parser-js v2 as a peer dependency (was v1). The SDK now imports
the named `{ UAParser }` export, matching ua-parser-js v2 which removed the
default export. Consumers must upgrade ua-parser-js to v2.
