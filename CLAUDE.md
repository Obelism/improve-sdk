# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Obelism Improve SDK — a TypeScript monorepo for an A/B testing and feature flag platform. Three publishable SDK packages (core, React, Next.js) plus shared configs and example apps.

## Commands

```bash
npm run build          # Build all packages (turbo)
npm run dev            # Watch mode for all packages
npm run lint           # Lint all packages (ESLint + type-check)
npm run test           # Run tests (vitest, watch mode)
npm run test:ci        # Run tests once (CI mode)
npm run format         # Prettier format all files
npm run clean          # Clean dist, node_modules, caches

# Single package
npx turbo run build --filter=@obelism/improve-sdk
npx turbo run test --filter=@obelism/improve-sdk-react

# Single test file
cd packages/sdk && npx vitest run src/utils/diff.test.ts

# Publish workflow
npm run changeset      # Create a changeset before publishing
npm run publish-packages  # Build, lint, test, then publish
```

## Architecture

### Package Dependency Chain

```
@obelism/improve-sdk (core)
  ├── ./server → ImproveServerSDK  (Node/edge server-side)
  ├── ./client → ImproveClientSDK  (browser, cookie-based visitor tracking)
  └── ./types  → shared types

@obelism/improve-sdk-react (depends on core)
  └── generateImproveProvider() → { ImproveProvider, useTestValue, useFlagValue, usePostAnalytic, useImproveStatus }

@obelism/improve-sdk-next (depends on core + react)
  └── generateImproveNextMiddleware() → Next.js middleware for server-side A/B test routing
```

### SDK Design Pattern

- `BaseImproveSDK` is the shared base class (config fetching, environment handling)
- `ImproveServerSDK` and `ImproveClientSDK` extend it for their respective runtimes
- React SDK uses a factory function (`generateImproveProvider`) that creates a Context + hooks bundle
- Next.js SDK generates middleware that handles bot detection, route matching, cookie management, and URL rewriting

### Backend API (https://improve.obelism.studio)

The SDK communicates with two endpoints (see `packages/sdk/src/config/urls.ts`):

- **Datafile/Config** `GET /config` — fetches the organization's configuration (tests, flags, audiences) for an environment. Server SDK authenticates with a `token`; client SDK uses `organizationId` + `environment`.
- **Analytics** `POST /api/log` — receives analytic events (e.g. page_view, conversion) tied to a test slug. Client SDK's `postAnalytic()` sends here; `setAnalyticsUrls()` can redirect to a proxy to avoid ad blockers.

### Domain Concepts

- **Tests** — A/B or multi-variant experiments with an allocation % (traffic exposed), split ratios per variant, audience targeting, and linked analytic events (start/metrics/conversion).
- **Feature Flags** — on/off or multi-value toggles with audience-based splits. Unlike tests, flags are for gradual rollouts with instant rollback.
- **Audiences** — visitor segments based on device, OS, browser, or pointer type. The SDK matches visitors via user-agent parsing.
- **Visitors** — identified by a generated ID stored in a cookie. Server SDK caches assignments in memory; client SDK caches in cookies (1-month TTL).
- **Analytics/Events** — conversion tracking events posted to the API, tied to test slugs. Conversion rate = visitors reaching the goal / total visitors.
- **Environments** — `develop`, `staging`, `production`. Each has its own config from the API.

### Vercel Edge Config Integration

Optional integration syncs the datafile to Vercel Edge Config (`@vercel/edge-config`) for edge-optimized middleware. The store is named `obelism_improve_{organisation}`. Only active tests/flags/audiences are synced; draft tests load directly from the API.

### Build & Bundling

- **bunchee** bundles SDK packages → dual ESM (.mjs) + CJS (.cjs) + .d.ts
- **tsup** bundles example apps (html, react)
- **Turbo** orchestrates cross-package builds with `dependsOn: ["^build"]`

## Code Style

- Prettier: single quotes, tabs, no semicolons, trailing commas
- ESLint with `@typescript-eslint`, `simple-import-sort`, `no-relative-import-paths`
- TypeScript strict mode enabled, `strictNullChecks: false`
- Pre-commit hook runs lint-staged (Prettier on staged files)

## Versioning & Publishing

Changesets manages versioning. Push to `main` triggers GitHub Actions which creates a release PR via changesets. Merging that PR auto-publishes to npm.
