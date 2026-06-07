/**
 * statusManifest.js
 *
 * PR-5b-i (observability). Turns DataService.lastSourceStatuses into a
 * machine-readable health manifest + a GitHub Actions step summary, so a green
 * build can no longer hide a configured source that quietly fell back.
 *
 * Classification (the axis that matters for alerting):
 *   - 'live'     — ok with data (configured + succeeded)
 *   - 'skip'     — ok({}) intentional skip (disabled/unconfigured) → NEVER alerts
 *   - 'fallback' — default served but a failure occurred → alerts
 *   - 'error'    — no usable value → alerts
 *
 * 'skip' vs 'live' is only knowable where the value exists, so classifySource()
 * is applied at the DataService capture seam; the raw value is never carried
 * into the manifest (it only ever holds normalized, log-safe errors).
 */

const HIGH_SIGNAL_STATUSES = new Set([401, 403, 429])
const FAILURE = new Set(['fallback', 'error'])

const ICON = { live: '✅', skip: '⏭️', fallback: '⚠️', error: '⛔' }

function hasData(value) {
  return value != null && typeof value === 'object' && Object.keys(value).length > 0
}

/**
 * Label a single discriminated source result. Called at capture time (value in
 * scope) so an intentional ok({}) skip is distinguishable from live ok(data).
 * @param {{ status?: string, value?: unknown } | null | undefined} result
 * @returns {'live'|'skip'|'fallback'|'error'}
 */
export function classifySource(result) {
  if (!result || typeof result.status !== 'string') return 'error'
  if (result.status === 'ok') return hasData(result.value) ? 'live' : 'skip'
  if (result.status === 'fallback') return 'fallback'
  return 'error'
}

function isHighSignal(classification, error) {
  return FAILURE.has(classification) && HIGH_SIGNAL_STATUSES.has(error?.status)
}

/**
 * Build the machine-readable status manifest from the per-source statuses
 * DataService records (each already classified at capture).
 * @param {Array<{source:string,status:string,classification:string,error:object|null}>} statuses
 * @param {{ generatedAt?: number }} [opts]
 */
export function buildStatusManifest(statuses = [], { generatedAt = Date.now() } = {}) {
  const sources = statuses.map((entry) => ({
    source: entry.source,
    classification: entry.classification,
    status: entry.status,
    highSignal: isHighSignal(entry.classification, entry.error),
    error: entry.error ?? null,
  }))

  const countOf = (c) => sources.filter((s) => s.classification === c).length
  const summary = {
    total: sources.length,
    live: countOf('live'),
    skip: countOf('skip'),
    fallback: countOf('fallback'),
    error: countOf('error'),
    highSignal: sources.filter((s) => s.highSignal).length,
    alerting: sources.some((s) => FAILURE.has(s.classification)),
  }

  return { generatedAt, sources, summary }
}

function noteFor(source) {
  if (!source.error) return ''
  const base = source.error.status ? `HTTP ${source.error.status}` : source.error.message
  return source.highSignal ? `${base} (auth/rate-limit, high-signal)` : base
}

/**
 * Render the manifest as GitHub Actions step-summary markdown.
 * @param {ReturnType<typeof buildStatusManifest>} manifest
 * @returns {string}
 */
export function renderStepSummary(manifest) {
  const { sources, summary } = manifest

  const rows = sources
    .map((s) => `| ${s.source} | ${ICON[s.classification]} ${s.classification} | ${noteFor(s)} |`)
    .join('\n')

  const headline = summary.alerting
    ? `⚠️ ${summary.fallback + summary.error} configured source(s) failing` +
      (summary.highSignal ? ` — ${summary.highSignal} high-signal (auth/rate-limit)` : '')
    : '✅ All configured sources healthy — no alert'

  return [
    '## ProfileChatter source status',
    '',
    '| Source | Status | Note |',
    '| --- | --- | --- |',
    rows,
    '',
    `**${summary.total} sources** — ${summary.live} live, ${summary.skip} skip, ` +
      `${summary.fallback} fallback, ${summary.error} error.`,
    '',
    headline,
    '',
  ].join('\n')
}

/**
 * Build the manifest, write it as machine-readable JSON, and (in CI) append the
 * markdown step summary. fs writers are injected so build-profile.js stays thin
 * glue and this is unit-testable without touching disk.
 * @param {Array} statuses - DataService.lastSourceStatuses
 * @param {{ generatedAt?: number, manifestPath: string, stepSummaryPath?: string,
 *           writeFile: (p:string,c:string)=>void, appendFile: (p:string,c:string)=>void }} opts
 * @returns {ReturnType<typeof buildStatusManifest>}
 */
export function emitStatusManifest(statuses, opts) {
  const { generatedAt, manifestPath, stepSummaryPath, writeFile, appendFile } = opts
  const manifest = buildStatusManifest(statuses, { generatedAt })
  writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  if (stepSummaryPath) appendFile(stepSummaryPath, `${renderStepSummary(manifest)}\n`)
  return manifest
}
