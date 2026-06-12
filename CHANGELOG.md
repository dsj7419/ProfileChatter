# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-06-12

### Added

- Comprehensive backend unit and integration test suite (approx. 400+ tests)
- User-configurable timezones for accurate date/time placeholders
- New "Discord" theme as a built-in option
- Draggable items/segments in the Configurator UI for chart data editing
- Interactive "Dynamic Placeholder Helper" in the TextContentEditor for easy placeholder insertion
- GitHub Issue Templates (bug_report.md, feature_request.md, showcase_submission.md)
- Contribution Guide (CONTRIBUTING.md)
- Integrated unit and integration tests into the GitHub Actions CI/CD pipeline
- Reliability spine: every data source returns a discriminated result (ok / skip / fallback / error) so a green build can not silently show stale or fabricated data
- Status manifest: machine-readable `dist/status-manifest.json` plus a GitHub Actions step summary classifying each source as live / skip / fallback / error
- Self-healing alerting: a single GitHub issue auto-opens on a configured-source failure and closes on recovery (no spam, no committed state)
- Honest GitHub contribution count via the GraphQL API (replaces the previous fabricated estimate)
- Adaptive light/dark contrast: status text (Delivered/Read) and visitor bubble/text plus visitor-side chart surfaces now adapt to the viewer color scheme across iOS, Android, and Discord
- Release-readiness docs: Troubleshooting, "Safe & reliable by design", ARCHITECTURE.md, and a success-first README funnel
- README visual proof: a six-image theme gallery (light + dark) and refreshed Configurator screenshots
- Fork-flow commit fallback: forks without the owner PAT auto-commit via `github.token`

### Changed

- ConfigManager.svelte refactored into smaller, SRP-focused components (LocalConfigManager, GitHubSaveUIManager, etc.)
- Improved avatar handling in build-profile.js and AvatarSettingsEditor.svelte (URL prioritization, Base64 validation, local asset fallbacks)
- Enhanced OAuth flow management in previewServer.js (Spotify & GitHub)
- initConfigLoader.js now centralizes configuration loading logic for UI stores
- Weather integration is now OFF by default (AccuWeather is trial/paid); opt in with a key
- Unconfigured Spotify and GitHub-OAuth are treated as intentional skips, never fallbacks or false alarms

### Fixed

- Critical bug where loading profileChatterConfig.json could reset UI state
- Resolved issues with WORK_START_DATE updates not reflecting in UI previews
- Spotify-skip copy now reads naturally when Spotify is unconfigured (no more "jamming to Not currently listening to music. right now")
- Status text (Delivered/Read) was invisible (white-on-white) in light mode; it now adapts per color scheme
- Visitor bubbles glared as light slabs in dark mode (iOS/Android) and appeared as dark blobs in light mode (Discord); they now adapt

[Unreleased]: https://github.com/dsj7419/ProfileChatter/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/dsj7419/ProfileChatter/compare/v1.0.2...v1.1.0
