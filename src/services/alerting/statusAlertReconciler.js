/**
 * statusAlertReconciler.js
 *
 * PR-5b-ii (alerting). Reconciles a single, stable GitHub issue against the
 * status manifest so a *configured* source failure is surfaced loudly and
 * recovery clears it — without issue spam and without any persisted counter.
 *
 *   alerting + no open issue   → create one (carries a hidden marker)
 *   alerting + open issue      → comment "still failing" on it (no duplicate)
 *   healthy  + open issue      → comment "recovered", then close it (audit trail)
 *   healthy  + no open issue   → do nothing
 *
 * Intentional ok({}) skips never set manifest.summary.alerting, so they never
 * alarm. Pure logic over an injected `issues` port (findOpenAlert/create/
 * comment/close) so every path is deterministically unit-tested.
 */
import { renderStepSummary } from '../utils/statusManifest.js'

// Hidden HTML-comment marker used to find the one managed issue idempotently.
export const ALERT_MARKER = '<!-- profilechatter:status-alert:v1 -->'

const failingSources = (manifest) =>
  manifest.sources.filter((s) => s.classification === 'fallback' || s.classification === 'error')

const isoOf = (ms) => new Date(ms).toISOString()

const highSignalSuffix = (manifest) =>
  manifest.summary.highSignal
    ? ` (${manifest.summary.highSignal} high-signal — auth/rate-limit)`
    : ''

function alertTitle(manifest) {
  const n = manifest.summary.fallback + manifest.summary.error
  return `⚠️ ProfileChatter: ${n} data source(s) failing`
}

export function renderAlertBody(manifest) {
  return [
    ALERT_MARKER,
    '## ProfileChatter source alert',
    '',
    `As of \`${isoOf(manifest.generatedAt)}\`, one or more **configured** sources are failing.`,
    'Intentional skips (disabled/unconfigured integrations) are not counted.' +
      highSignalSuffix(manifest),
    '',
    renderStepSummary(manifest),
    '---',
    '_Auto-managed: this issue updates on continued failure and closes on recovery._',
    '',
  ].join('\n')
}

export function renderContinuingComment(manifest) {
  const names = failingSources(manifest)
    .map((s) => s.source)
    .join(', ')
  return `Still failing as of \`${isoOf(manifest.generatedAt)}\` — ${names}.${highSignalSuffix(manifest)}`
}

export function renderRecoveryComment(manifest) {
  return `✅ Recovered — all configured sources healthy as of \`${isoOf(manifest.generatedAt)}\`. Closing this alert.`
}

/**
 * @param {ReturnType<import('../utils/statusManifest.js').buildStatusManifest>} manifest
 * @param {{ findOpenAlert(marker:string):Promise<{number:number,body:string}|null>,
 *           create(arg:{title:string,body:string}):Promise<{number:number}>,
 *           comment(number:number, body:string):Promise<void>,
 *           close(number:number):Promise<void> }} issues
 * @returns {Promise<{action:'created'|'updated'|'resolved'|'none', issue?:number}>}
 */
export async function reconcileStatusAlert(manifest, issues) {
  const existing = await issues.findOpenAlert(ALERT_MARKER)

  if (manifest.summary.alerting) {
    if (existing) {
      await issues.comment(existing.number, renderContinuingComment(manifest))
      return { action: 'updated', issue: existing.number }
    }
    const created = await issues.create({
      title: alertTitle(manifest),
      body: renderAlertBody(manifest),
    })
    return { action: 'created', issue: created.number }
  }

  if (existing) {
    await issues.comment(existing.number, renderRecoveryComment(manifest))
    await issues.close(existing.number)
    return { action: 'resolved', issue: existing.number }
  }

  return { action: 'none' }
}
