/**
 * runStatusAlert.js
 *
 * Orchestrates PR-5b-ii alerting between the emitted manifest and GitHub Issues.
 * Kept separate from the thin entry script (src/report-status-alert.js) so every
 * branch — missing manifest, no credentials, reconcile, and API failure — is
 * unit-tested with injected deps (no fs/network/process here).
 *
 * Alerting is a monitoring sidecar, NOT the product delivery path: a GitHub
 * Issues API failure is reported loudly (::error:: annotation + step-summary
 * note) and returned as { ok: false } so the caller can mark the step failed,
 * but it never throws — the SVG build/commit must not be blocked by it.
 */
import { reconcileStatusAlert } from './statusAlertReconciler.js'

/**
 * @param {{
 *   readManifest: () => object | null,
 *   env: Record<string, string | undefined>,
 *   fetchImpl: typeof fetch,
 *   logger: { log: (m: string) => void, error: (m: string) => void },
 *   appendSummary: (text: string) => void,
 *   makeIssues: (cfg: { repo: string, token: string, fetchImpl: typeof fetch }) => object,
 * }} deps
 * @returns {Promise<{ ok: boolean, action?: string, issue?: number, reason?: string, error?: string }>}
 */
export async function runStatusAlert(deps) {
  const { readManifest, env, fetchImpl, logger, appendSummary, makeIssues } = deps

  const manifest = readManifest()
  if (!manifest) {
    logger.log('Status alert: no manifest found — nothing to reconcile.')
    return { ok: true, action: 'none', reason: 'no-manifest' }
  }

  const repo = env.GITHUB_REPOSITORY
  const token = env.GITHUB_TOKEN
  if (!repo || !token) {
    logger.log('Status alert: no GitHub token/repo — skipping reconciliation.')
    return { ok: true, action: 'none', reason: 'no-credentials' }
  }

  try {
    const issues = makeIssues({ repo, token, fetchImpl })
    const result = await reconcileStatusAlert(manifest, issues)
    logger.log(
      `Status alert reconciliation: ${result.action}${result.issue ? ` (#${result.issue})` : ''}`
    )
    return { ok: true, ...result }
  } catch (err) {
    // Visible but non-blocking: loud annotation + step-summary note, no throw.
    logger.error(`::error::Status alert reconciliation failed: ${err.message}`)
    appendSummary(`\n> ⚠️ **Status alert reconciliation failed:** ${err.message}\n`)
    return { ok: false, error: err.message }
  }
}
