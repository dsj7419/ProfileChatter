/**
 * githubRepoService.js
 * Extended GitHub repository service.
 * - Lists writable repos
 * - Detects whether a file already exists
 * - Creates or updates profileChatterConfig.json in a branch
 */
import oauthRegistry from './auth/oauthRegistry.js';

const API_BASE_URL = 'https://api.github.com';

/* ---------- internal utils ---------- */
async function getFetch() {
  // node <18 compatibility
  if (typeof fetch === 'function') return fetch;
  const { default: nodeFetch } = await import('node-fetch');
  return nodeFetch;
}

function headers(accessToken) {
  return {
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${accessToken}`,
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

/* ---------- public API ---------- */

/**
 * Return repositories the user can push to.
 * @param {string} accessToken - GitHub OAuth access token
 * @returns {Promise<Array<Object>>} Array of repository objects with write access
 */
export async function getUserWritableRepositories(accessToken) {
  if (!accessToken) throw new Error('GitHub access token is required');

  const fetchImpl = await getFetch();
  const allRepos = [];
  let page = 1;

  // paginate through all repositories
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const url = `${API_BASE_URL}/user/repos?type=owner,collaborator&per_page=100&page=${page}`;
    const res = await fetchImpl(url, { headers: headers(accessToken) });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`GitHub API error: ${res.status} - ${errorText}`);
    }

    const batch = await res.json();
    allRepos.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }

  // Filter and transform to the needed format
  return allRepos
    .filter(r => r.permissions?.push)
    .map(r => ({
      name: r.name,
      owner: r.owner.login,
      fullName: r.full_name,
      defaultBranch: r.default_branch,
      permissions: { push: true },
      description: r.description,
      isProfileChatterFork: /profilechatter/i.test(r.name) ||
                           r.description?.toLowerCase().includes('profilechatter') ||
                           (r.fork && r.source?.full_name === 'dsj7419/ProfileChatter')
    }));
}

/**
 * Check whether a file exists in a branch and return its SHA (needed for updates).
 * @param {string} accessToken - GitHub OAuth access token
 * @param {string} owner - Repository owner username
 * @param {string} repo - Repository name
 * @param {string} path - File path within the repository
 * @param {string} branch - Branch name (defaults to 'main')
 * @returns {Promise<Object>} Object containing { exists: boolean, sha: string|null }
 */
export async function checkFileExists(accessToken, owner, repo, path, branch = 'main') {
  const fetchImpl = await getFetch();
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`;

  const res = await fetchImpl(url, { headers: headers(accessToken) });

  if (res.status === 404) return { exists: false, sha: null };
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return { exists: true, sha: data.sha };
}

/**
 * Create or update a file via the contents API.
 * @param {string} accessToken - GitHub OAuth access token
 * @param {string} owner - Repository owner username
 * @param {string} repo - Repository name
 * @param {string} path - File path within the repository
 * @param {string} content - File content (as a string, will be Base64 encoded)
 * @param {string} commitMessage - Commit message
 * @param {string} branch - Branch name (defaults to 'main')
 * @param {string|null} currentSha - Current file SHA (required for updates, null for new files)
 * @returns {Promise<Object>} GitHub API response with commit info
 */
export async function saveFileToRepo(
  accessToken,
  owner,
  repo,
  path,
  content,
  commitMessage,
  branch = 'main',
  currentSha = null 
) {
  const fetchImpl = await getFetch();
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
  const base64String = Buffer.from(content).toString('base64');

  const body = {
    message: commitMessage,
    content: base64String,
    branch
  };
  if (currentSha) body.sha = currentSha;

  const res = await fetchImpl(url, {
    method: 'PUT',
    headers: {
      ...headers(accessToken),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to commit file: ${res.status} - ${text}`);
  }

  const data = await res.json();
  return {
    commitUrl: data.commit?.html_url ?? null,
    content: data.content
  };
}

/**
 * Convenience wrapper to list writable repositories for the currently authenticated user
 * @returns {Promise<Array<Object>>} Array of repository objects with write access
 */
export async function getWritableRepositoriesForCurrentUser() {
  try {
    const githubService = oauthRegistry.getProvider('github');
    const accessToken = await githubService.getAccessToken();
    return getUserWritableRepositories(accessToken);
  } catch (error) {
    throw new Error(`Failed to get user repositories: ${error.message}`);
  }
}