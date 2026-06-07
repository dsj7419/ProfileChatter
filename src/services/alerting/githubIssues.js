/**
 * githubIssues.js
 *
 * Thin GitHub REST adapter implementing the `issues` port the reconciler needs
 * (findOpenAlert / create / comment / close). `fetchImpl` is injected so the
 * request contract is unit-tested without any live network call. Failures throw
 * with the HTTP status so the workflow step fails loudly rather than silently.
 */

/**
 * @param {{ repo: string, token: string, fetchImpl: typeof fetch }} cfg
 *   repo is "owner/name"; token needs issues:write.
 */
export function createGitHubIssues({ repo, token, fetchImpl }) {
  const base = `https://api.github.com/repos/${repo}`
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'profilechatter-status-bot',
  }

  async function call(url, init, what) {
    const res = await fetchImpl(url, { headers, ...init })
    if (!res.ok) throw new Error(`GitHub ${what} failed: HTTP ${res.status}`)
    return res
  }

  return {
    async findOpenAlert(marker) {
      const res = await call(`${base}/issues?state=open&per_page=100`, {}, 'list issues')
      const issues = await res.json()
      const found = issues.find(
        (i) => !i.pull_request && typeof i.body === 'string' && i.body.includes(marker)
      )
      return found ? { number: found.number, body: found.body } : null
    },

    async create({ title, body }) {
      const res = await call(
        `${base}/issues`,
        { method: 'POST', body: JSON.stringify({ title, body }) },
        'create issue'
      )
      const json = await res.json()
      return { number: json.number }
    },

    async comment(number, body) {
      await call(
        `${base}/issues/${number}/comments`,
        { method: 'POST', body: JSON.stringify({ body }) },
        'comment'
      )
    },

    async close(number) {
      await call(
        `${base}/issues/${number}`,
        { method: 'PATCH', body: JSON.stringify({ state: 'closed' }) },
        'close issue'
      )
    },
  }
}
