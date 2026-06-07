/**
 * report-status-alert.js
 *
 * Thin CI entry for PR-5b-ii alerting (coverage-excluded glue). Wires real
 * fs / env / fetch into runStatusAlert, then exits non-zero on a reconcile
 * failure so the (continue-on-error) workflow step shows red and writes a
 * step-summary note — visible, but never blocking the SVG build/commit.
 */
import { readFileSync, existsSync, appendFileSync } from 'node:fs'
import { runStatusAlert } from './services/alerting/runStatusAlert.js'
import { createGitHubIssues } from './services/alerting/githubIssues.js'

const manifestPath = 'dist/status-manifest.json'

const result = await runStatusAlert({
  readManifest: () =>
    existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : null,
  env: process.env,
  fetchImpl: fetch,
  logger: console,
  appendSummary: (text) => {
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text)
  },
  makeIssues: createGitHubIssues,
})

if (!result.ok) process.exit(1)
