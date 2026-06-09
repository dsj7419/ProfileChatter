# Architecture

A short map of how ProfileChatter is put together, for contributors and maintainers. For setup and usage, see the [README](README.md).

## Overview

ProfileChatter has two halves:

- **The generator** (`src/`, Node + ESM) — the unattended part that runs in GitHub Actions. It fetches live data, renders the animated SVG, and writes it to `dist/profile-chat.svg`. This is the load‑bearing product path.
- **The Configurator** (`configurator-ui/`, Svelte + Vite) — a local, no‑code editor for messages, themes, avatars, and charts. It exports `profileChatterConfig.json` and ships a small local preview/OAuth server (`configurator-ui/server/`). It never runs in CI.

## Build pipeline

```
main.js / build-profile.js
  → ProfileChatter.generateChatSVG()
      → DataService.getDynamicData()        // orchestrates all data sources in parallel
          → services/data_sources/*.js      // each returns a discriminated result
          → services/utils/httpClient.js    // shared fetch (timeout + retry, fail-fast 4xx)
      → services/TimelineBuilder.js          // chatData + config → TimelineItem[]
      → rendering/SvgRenderer.js             // timeline → animated SVG markup
  → dist/profile-chat.svg
```

`.github/workflows/main.yml` runs this on a 6‑hour cron (and on relevant pushes), then commits the updated SVG back to the repo. `verify.yml` is the always‑on required check (lint + tests + Configurator build) on every PR.

## Reliability spine

The product promise is "set it once and your profile keeps talking," so the data layer's first job is to **never hide a failure**:

- **`services/utils/httpClient.js`** — `fetchJson`: per‑attempt timeout, bounded retry/backoff for transient errors, fail‑fast on auth/config 4xx, normalized `HttpError`. `fetchImpl`/`sleep` are injectable for tests.
- **`services/utils/sourceResult.js`** — the discriminated result each source returns: `ok` / `fallback` / `error`. An intentional skip (a disabled/unconfigured integration) is `ok({})`.
- **`services/DataService.js`** — fetches all sources in parallel, unwraps values for rendering, and records per‑source health on `lastSourceStatuses` (reset each run, so a failed run can't leak prior health).
- **`services/utils/statusManifest.js`** — classifies each source as **live / skip / fallback / error**, builds the machine‑readable manifest (`dist/status-manifest.json`) and the GitHub Actions step summary. Flags `401/403/429` as high‑signal.
- **`services/alerting/`** — reconciles a single GitHub issue from the manifest: opens/updates while a configured source fails, comments and closes on recovery. The issue itself is the durable state (no committed counter); intentional skips never alert. Runs as a non‑PR‑gated, `continue-on-error` step so an Issues‑API hiccup never blocks the SVG build.

## Configuration hierarchy

Highest precedence wins:

1. **`profileChatterConfig.json`** — exported by the Configurator UI; wins for the sections it contains.
2. **`src/config/config.js`** — base defaults (themes, layout, profile, integration toggles).
3. **`data/chatData.json`** — default chat messages when no config supplies a `chatMessages` array.

## Security posture

- **Preview server** (`configurator-ui/server/`) — binds to loopback by default, requires a server‑issued session token on state‑changing endpoints, and enforces strict CORS, a CSRF custom‑header requirement, payload schema validation, and a repo/path allow‑list on GitHub writes.
- **Secrets** — all integrations are optional; tokens live in `.env` (local) or repository secrets (CI). The status manifest only ever carries normalized errors — never tokens, headers, or raw values.
- **Commit‑back tokens** — the build commits the SVG using the owner PAT on the protected `main`, and falls back to the default `GITHUB_TOKEN` on forks (which have no branch protection), so a fresh fork works without a custom commit secret.

## Testing & CI

- **TDD** is the default: tests assert behavior through public APIs, not implementation.
- `npm run verify` mirrors CI: ESLint + `vitest run --coverage` + the Configurator build.
- The required `verify` check runs on every PR with coverage floors (statements 85 / branches 80 / functions 95 / lines 85). `main.yml` does the unattended build/commit and is path‑filtered to source/data.

## Repo layout

```
src/
  ProfileChatter.js, main.js, build-profile.js   # entry + orchestration
  services/
    DataService.js                               # source orchestration
    data_sources/                                # the 7 sources
    utils/        httpClient, sourceResult, statusManifest
    alerting/     reconciler + GitHub adapter
    auth/         OAuth services (GitHub, Spotify) + base
  rendering/      SvgRenderer + components + animation engines
  models/, config/, utils/
configurator-ui/  Svelte editor + local server
.github/workflows/  main.yml (build/commit), verify.yml (required gate)
tests/unit/         the test suite
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). New backend code is TDD‑first and must keep `verify` green; new data sources should return discriminated results so they flow through the manifest/alerting layer automatically.
