# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive backend unit and integration test suite (approx. 400+ tests)
- User-configurable timezones for accurate date/time placeholders
- New "Discord" theme as a built-in option
- Draggable items/segments in the Configurator UI for chart data editing
- Interactive "Dynamic Placeholder Helper" in the TextContentEditor for easy placeholder insertion
- GitHub Issue Templates (bug_report.md, feature_request.md, showcase_submission.md)
- Contribution Guide (CONTRIBUTING.md)
- Integrated unit and integration tests into the GitHub Actions CI/CD pipeline

### Changed

- ConfigManager.svelte refactored into smaller, SRP-focused components (LocalConfigManager, GitHubSaveUIManager, etc.)
- Improved avatar handling in build-profile.js and AvatarSettingsEditor.svelte (URL prioritization, Base64 validation, local asset fallbacks)
- Enhanced OAuth flow management in previewServer.js (Spotify & GitHub)
- initConfigLoader.js now centralizes configuration loading logic for UI stores

### Fixed

- Critical bug where loading profileChatterConfig.json could reset UI state
- Resolved issues with WORK_START_DATE updates not reflecting in UI previews

[Unreleased]: https://github.com/dsj7419/ProfileChatter/compare/v1.0.2...HEAD
