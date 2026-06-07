/**
 * previewServer.js
 *
 * A robust server for ProfileChatter SVG generation and OAuth integration.
 * Handles API endpoints, authentication flows, and SVG preview generation.
 */
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { existsSync, writeFileSync } from 'node:fs'
import { parse as parseUrl } from 'node:url'
import { promises as fs } from 'node:fs'

// Import the config for the API endpoint
import { config } from '../../src/config/config.js'

// Import OAuth Registry for handling all providers
import oauthRegistry from '../../src/services/auth/oauthRegistry.js'

// Import GitHub repository service functions
import {
  getUserWritableRepositories,
  checkFileExists,
  saveFileToRepo,
} from '../../src/services/githubRepoService.js'

// Network-exposure policy (bind host, debug gating) — pure + unit-tested
import { resolveBindHost, isExternalBind, isDebugEndpointEnabled } from './serverConfig.js'

// Constants
const PORT = 3001
// Default to loopback; LAN exposure is opt-in only (see serverConfig.js).
const HOST = resolveBindHost(process.env)
const FRONTEND_URL = 'http://127.0.0.1:5173'
const FIVE_MINUTES_SEC = 5 * 60
const FIVE_MINUTES_MS = FIVE_MINUTES_SEC * 1000

// Set up paths for importing ProfileChatter
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '../..')
const profileChatterPath = join(projectRoot, 'src', 'ProfileChatter.js')

// Define a consistent helper function for configuration file path
function getConfigPath() {
  return join(projectRoot, 'profileChatterConfig.json')
}

// State store for managing OAuth state parameters securely
const stateStore = {
  states: new Map(),

  add(state) {
    this.states.set(state, Date.now() + FIVE_MINUTES_MS)
    setTimeout(() => this.cleanup(), FIVE_MINUTES_MS)
  },

  verify(state) {
    if (!this.states.has(state)) return false

    const expiresAt = this.states.get(state)
    const isValid = Date.now() < expiresAt
    this.states.delete(state)
    return isValid
  },

  cleanup() {
    const now = Date.now()
    for (const [state, expiresAt] of this.states.entries()) {
      if (now >= expiresAt) this.states.delete(state)
    }
  },
}

// Initialize logger
const logger = {
  info: (...args) => console.log(`[${new Date().toISOString()}]`, ...args),
  error: (...args) => console.error(`[${new Date().toISOString()}] ERROR:`, ...args),
  warn: (...args) => console.warn(`[${new Date().toISOString()}] WARNING:`, ...args),
  debug: (...args) => console.log(`[${new Date().toISOString()}] DEBUG:`, ...args),
}

// Utility functions
function parseCookies(cookieString = '') {
  const cookies = {}
  if (!cookieString) return cookies

  cookieString.split(';').forEach((cookie) => {
    const parts = cookie.split('=')
    if (parts.length >= 2) {
      const key = parts[0].trim()
      const value = decodeURIComponent(parts[1].trim())
      cookies[key] = value
    }
  })
  return cookies
}

function logRequest(req) {
  logger.info(`${req.method} ${req.url}`)

  const headersToLog = {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
    origin: req.headers['origin'],
    referer: req.headers['referer'],
  }

  logger.debug('Headers:', headersToLog)
}

async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk.toString()
    })

    req.on('end', () => {
      try {
        const data = JSON.parse(body)
        resolve(data)
      } catch (error) {
        reject(new Error(`Invalid JSON: ${error.message}`))
      }
    })

    req.on('error', (error) => {
      reject(error)
    })
  })
}

// Load and initialize SVG generator
logger.info('Initializing server...')
logger.debug('Current directory:', process.cwd())
logger.debug('Script directory:', __dirname)
logger.debug('Project root:', projectRoot)
logger.debug('Looking for ProfileChatter.js at:', profileChatterPath)

if (!existsSync(profileChatterPath)) {
  logger.error(`File not found at ${profileChatterPath}`)
  process.exit(1)
}

// Import the main ProfileChatter SVG generator
let generateChatSVG
try {
  const profileChatterUrl = `file://${profileChatterPath.replace(/\\/g, '/')}`
  logger.debug('Loading module from URL:', profileChatterUrl)

  const profileChatterModule = await import(profileChatterUrl)
  generateChatSVG = profileChatterModule.generateChatSVG
  logger.info('Successfully imported generateChatSVG function')
} catch (error) {
  logger.error('Error importing ProfileChatter module:', error)
  process.exit(1)
}

// Route handlers
const routes = {
  // Home page with server status
  async handleHomePage(req, res) {
    logger.info('Serving homepage')
    res.setHeader('Content-Type', 'text/html')

    // Get OAuth status for all providers
    const oauthStatus = oauthRegistry.getAuthenticationStatus()
    let statusHtml = ''

    for (const [provider, status] of Object.entries(oauthStatus)) {
      const color = status.authenticated ? 'green' : 'red'
      const icon = status.authenticated ? '✅' : '❌'
      const text = status.authenticated
        ? `${provider} is authenticated`
        : `${provider} is not authenticated`
      const link = status.authenticated
        ? ''
        : ` <a href="/auth/${provider}">Connect ${provider}</a>`

      statusHtml += `<p style="color:${color}">${icon} ${text}${link}</p>`
    }

    res.end(`
      <html>
        <head>
          <title>ProfileChatter Preview Server</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; padding: 20px; max-width: 800px; margin: 0 auto; }
            code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
            .card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>ProfileChatter Preview Server</h1>
          <div class="card">
            <h2>Server Status</h2>
            <p>Server is running on port ${PORT}</p>
            <h3>Connected Services</h3>
            ${statusHtml}
          </div>
          
          <div class="card">
            <h2>Available Endpoints</h2>
            <ul>
              <li><code>POST /generate-preview</code> - Generate SVG preview from configuration</li>
              <li><code>GET /api/initial-config-data</code> - Get initial configuration data</li>
              <li><code>POST /api/save-local-config</code> - Save configuration to local filesystem</li>
              <li><code>GET /auth/{provider}</code> - Initiate OAuth flow for a provider</li>
              <li><code>GET /callback</code> - OAuth callback (used by providers)</li>
              <li><code>GET /oauth-status</code> - Check all OAuth authentication statuses</li>
              <li><code>GET /api/github/user-repos</code> - Get user's writable GitHub repositories</li>
              <li><code>POST /api/github/save-config</code> - Save configuration to GitHub repository</li>
            </ul>
          </div>
          
          <div class="card">
            <h2>Testing with cURL</h2>
            <pre>curl -X POST -H "Content-Type: application/json" -d '{"profile":{"NAME":"Test User"},"activeTheme":"ios","chatMessages":[{"id":"1","sender":"me","text":"Hello"}]}' http://127.0.0.1:${PORT}/generate-preview</pre>
          </div>
        </body>
      </html>
    `)
  },

  // Start OAuth authorization flow
  async handleOAuthAuthorization(req, res, path) {
    const providerName = path.substring(6) // extract provider name from path
    logger.info(`Handling OAuth authorization for provider: ${providerName}`)

    if (!providerName) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Provider name is required' }))
      return
    }

    try {
      const provider = oauthRegistry.getProvider(providerName)
      const authUrl = provider.getAuthorizationUrl()

      // Extract the state parameter from the URL
      const authUrlObj = new URL(authUrl)
      const state = authUrlObj.searchParams.get('state')

      if (!state) {
        throw new Error('OAuth state parameter missing from authorization URL')
      }

      logger.info(`Redirecting to ${providerName} authorization URL with state: ${state}`)

      // Store the state in memory instead of cookies
      stateStore.add(state)

      res.statusCode = 302
      res.setHeader('Location', authUrl)
      res.end()
    } catch (error) {
      logger.error(`Error initiating ${providerName} authorization:`, error)
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: error.message }))
    }
  },

  // Handle OAuth callback
  async handleOAuthCallback(req, res, query) {
    logger.info('Handling OAuth callback')

    const { code, state, error: oauthError } = query

    // Handle OAuth error response
    if (oauthError) {
      logger.error('OAuth error:', oauthError)
      res.statusCode = 400
      res.setHeader('Content-Type', 'text/html')
      res.end(`
        <html>
          <head><title>Authentication Failed</title></head>
          <body>
            <h1>Authentication Failed</h1>
            <p>Error: ${oauthError}</p>
            <p>Description: ${query.error_description || 'No description provided'}</p>
            <p><a href="${FRONTEND_URL}">Return to application</a></p>
          </body>
        </html>
      `)
      return
    }

    // Verify the state parameter using the state store
    if (!state || !stateStore.verify(state)) {
      logger.error('Invalid or expired state parameter')
      logger.debug('State from query:', state)
      res.statusCode = 400
      res.setHeader('Content-Type', 'text/html')
      res.end(`
        <html>
          <head><title>Authentication Failed</title></head>
          <body>
            <h1>Authentication Failed</h1>
            <p>Invalid state parameter. This may be due to an expired session or potential security issue.</p>
            <p><a href="${FRONTEND_URL}">Return to application</a></p>
          </body>
        </html>
      `)
      return
    }

    // Ensure authorization code is present
    if (!code) {
      logger.error('No authorization code provided in callback')
      res.statusCode = 400
      res.setHeader('Content-Type', 'text/html')
      res.end(`
        <html>
          <head><title>Authentication Failed</title></head>
          <body>
            <h1>Authentication Failed</h1>
            <p>No authorization code was provided.</p>
            <p><a href="${FRONTEND_URL}">Return to application</a></p>
          </body>
        </html>
      `)
      return
    }

    // Determine which provider to use
    let provider
    let providerName

    try {
      // If state is provided, use it to determine the provider
      providerName = oauthRegistry.getProviderFromState(state).providerName
      provider = oauthRegistry.getProviderFromState(state)
      logger.info(`Provider determined from state: ${providerName}`)

      // Exchange code for tokens
      await provider.exchangeCodeForTokens(code)
      logger.info(`Successfully authenticated with ${providerName}`)

      // Send success response
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html')
      res.end(`
        <html>
          <head>
            <title>Authentication Successful</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto; text-align: center; }
              .success { color: green; }
              .button { display: inline-block; background: #1DB954; color: white; padding: 10px 20px; border-radius: 30px; text-decoration: none; margin-top: 20px; }
            </style>
            <meta http-equiv="refresh" content="3;url=${FRONTEND_URL}" />
          </head>
          <body>
            <h1 class="success">Authentication Successful!</h1>
            <p>Your ${providerName} account has been connected successfully.</p>
            <p>You will be redirected to the application in 3 seconds...</p>
            <a href="${FRONTEND_URL}" class="button">Return to Application</a>
          </body>
        </html>
      `)
    } catch (error) {
      logger.error('Error during OAuth callback:', error)

      // Determine provider name for the error message
      providerName = providerName || 'service'

      res.statusCode = 500
      res.setHeader('Content-Type', 'text/html')
      res.end(`
        <html>
          <head><title>Authentication Failed</title></head>
          <body>
            <h1>Authentication Failed</h1>
            <p>Error: ${error.message}</p>
            <p><a href="/auth/${providerName.toLowerCase()}">Try again</a> or <a href="${FRONTEND_URL}">return to application</a></p>
          </body>
        </html>
      `)
    }
  },

  // OAuth status endpoint
  async handleOAuthStatus(req, res) {
    logger.info('Handling GET request to /oauth-status')

    const status = oauthRegistry.getAuthenticationStatus()

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(status))
  },

  // Configuration data API
  async handleConfigData(req, res) {
    logger.info('Handling GET request to /api/initial-config-data')

    // Get the path to the config file
    const configFilePath = getConfigPath()

    try {
      // Check if the config file exists
      if (existsSync(configFilePath)) {
        try {
          // Read and parse the saved configuration
          const fileContent = await fs.readFile(configFilePath, 'utf8')
          const savedConfig = JSON.parse(fileContent)

          logger.info(`Loaded saved configuration from ${configFilePath}`)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
          res.setHeader('Pragma', 'no-cache')
          res.end(JSON.stringify(savedConfig))
          return
        } catch (readErr) {
          logger.warn(`Corrupt JSON in ${configFilePath}:`, readErr.message)
          // Falls through to default config
        }
      } else {
        logger.info(`No saved config found at ${configFilePath}, using defaults`)
      }

      // Return a minimal valid configuration structure that will pass validation
      const emptyConfig = {
        profile: {
          NAME: 'Your Name',
          PROFESSION: 'Your Profession',
          LOCATION: 'Your City',
          COMPANY: 'Your Company',
          GITHUB_USERNAME: 'your_github',
          TIMEZONE: 'UTC',
        },
        chatMessages: [],
        activeTheme: config.activeTheme,
        avatars: config.avatars,
        themes: config.themes,
        fontOptions: config.fontOptions,
        layout: config.layout,
      }

      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.setHeader('Pragma', 'no-cache')
      res.end(JSON.stringify(emptyConfig))

      logger.info('Default config data sent due to missing or invalid saved config')
    } catch (error) {
      logger.error('Error handling configuration request:', error)

      // Fall back to defaults in case of any other error
      const emptyConfig = {
        profile: {
          NAME: 'Your Name',
          PROFESSION: 'Your Profession',
          LOCATION: 'Your City',
          COMPANY: 'Your Company',
          GITHUB_USERNAME: 'your_github',
          TIMEZONE: 'UTC',
        },
        chatMessages: [],
        activeTheme: config.activeTheme,
      }

      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.setHeader('Pragma', 'no-cache')
      res.end(JSON.stringify(emptyConfig))

      logger.info('Default config data sent due to error')
    }
  },

  // SVG generation endpoint
  async handleSvgGeneration(req, res) {
    logger.info('Handling POST request to /generate-preview')

    try {
      const configData = await parseJsonBody(req)
      logger.debug('Parsed JSON data with keys:', Object.keys(configData))

      if (
        !configData.profile ||
        !configData.activeTheme ||
        !Array.isArray(configData.chatMessages)
      ) {
        logger.error('Invalid configuration data received')
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(
          JSON.stringify({
            error:
              'Invalid configuration data. Must include profile, activeTheme, and chatMessages array.',
            received: {
              hasProfile: !!configData.profile,
              activeTheme: configData.activeTheme,
              chatMessagesIsArray: Array.isArray(configData.chatMessages),
              chatMessagesLength: Array.isArray(configData.chatMessages)
                ? configData.chatMessages.length
                : 'N/A',
            },
          })
        )
        return
      }

      // Extract work start date from the received profile
      const workStartDate = configData.profile.WORK_START_DATE
      const workStartObj = workStartDate ? { ...workStartDate } : null
      delete configData.profile.WORK_START_DATE // Remove from profile since it's handled separately

      // Prepare custom context for SVG generation
      const customContext = {
        profile: configData.profile,
        activeTheme: configData.activeTheme,
        chatMessages: configData.chatMessages,
        workStartDate: workStartObj
          ? new Date(workStartObj.year, workStartObj.month - 1, workStartObj.day)
          : null,
        avatars: configData.avatars,
        themeOverrides: configData.themeOverrides || null,
        layoutAnimationOverrides: configData.layoutAnimationOverrides || null,
      }

      // Log configuration details
      if (customContext.avatars) {
        logger.debug('Avatar configuration received:', {
          enabled: customContext.avatars.enabled,
          shape: customContext.avatars.shape,
          hasMeConfig: !!customContext.avatars.me,
          hasVisitorConfig: !!customContext.avatars.visitor,
        })
      }

      if (customContext.themeOverrides) {
        logger.debug('Theme overrides received for theme:', customContext.activeTheme)
      }

      if (customContext.layoutAnimationOverrides) {
        logger.debug(
          'Layout animation overrides received:',
          JSON.stringify(customContext.layoutAnimationOverrides)
        )
      }

      logger.info('Generating SVG with custom context...')
      logger.debug('Profile:', JSON.stringify(customContext.profile).substring(0, 100) + '...')
      logger.debug('Theme:', customContext.activeTheme)
      logger.debug('Chat messages count:', customContext.chatMessages.length)
      logger.debug('Work start date:', customContext.workStartDate)

      // Generate SVG
      const svgMarkup = await generateChatSVG(customContext)
      logger.info('SVG generated, length:', svgMarkup.length)

      // Send SVG response
      res.statusCode = 200
      res.setHeader('Content-Type', 'image/svg+xml')
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')
      res.setHeader('Surrogate-Control', 'no-store')
      res.end(svgMarkup)
      logger.info('SVG sent successfully')
    } catch (error) {
      logger.error('Error processing request:', error)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: `Error generating SVG: ${error.message}` }))
    }
  },

  /**
   * Save local configuration endpoint - writes UI config to profileChatterConfig.json
   * @async
   */
  async handleSaveLocalConfig(req, res) {
    logger.info('Handling POST request to /api/save-local-config')

    try {
      // Parse the request body
      const configJson = await parseJsonBody(req)
      logger.debug('Received configuration data with keys:', Object.keys(configJson))
      logger.debug('Config json snippet:', JSON.stringify(configJson).slice(0, 120) + '…')

      // Use the consistent path helper
      const configFilePath = getConfigPath()

      // Save the configuration to the file system
      try {
        writeFileSync(configFilePath, JSON.stringify(configJson, null, 2))
        logger.info(`Successfully saved configuration to ${configFilePath}`)

        // Return success response
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(
          JSON.stringify({
            success: true,
            message: 'Local config saved.',
            path: configFilePath,
          })
        )
      } catch (fileError) {
        throw new Error(`Failed to write file: ${fileError.message}`)
      }
    } catch (error) {
      logger.error('Error saving local config:', error)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          success: false,
          error: `Failed to save local config: ${error.message}`,
        })
      )
    }
  },

  // GitHub repository listing endpoint
  async handleGithubUserRepos(req, res) {
    logger.info('Handling GET request to /api/github/user-repos')

    try {
      // Ensure user has a valid GitHub OAuth token
      const githubProvider = oauthRegistry.getProvider('github')
      const accessToken = await githubProvider.getAccessToken()

      // Get the list of repositories the user can write to
      const repositories = await getUserWritableRepositories(accessToken)

      // Return the repository list as JSON
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.end(JSON.stringify(repositories))
      logger.info(`Successfully fetched ${repositories.length} writable repositories`)
    } catch (error) {
      logger.error('Error fetching GitHub repositories:', error)

      // Determine if this is an authentication error
      const isAuthError =
        error.message.includes('No valid GitHub token') || error.message.includes('authentication')

      res.statusCode = isAuthError ? 401 : 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: isAuthError
            ? 'GitHub authentication required'
            : `Error fetching repositories: ${error.message}`,
        })
      )
    }
  },

  // GitHub save config endpoint
  async handleGithubSaveConfig(req, res) {
    logger.info('Handling POST request to /api/github/save-config')

    try {
      // Parse the request body
      const {
        repoFullName,
        filePath,
        commitMessage,
        configContent,
        branch = 'main',
      } = await parseJsonBody(req)

      // Validate required fields
      if (!repoFullName || !filePath || !commitMessage || !configContent) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Missing required fields' }))
        return
      }

      // Parse repository owner and name
      const [owner, repo] = repoFullName.split('/')
      if (!owner || !repo) {
        throw new Error('Invalid repository name format. Expected "owner/repo"')
      }

      // Get GitHub access token
      const githubProvider = oauthRegistry.getProvider('github')
      let accessToken

      try {
        accessToken = await githubProvider.getAccessToken()
      } catch (authError) {
        logger.error('GitHub authentication required:', authError)
        res.statusCode = 401
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'GitHub authentication required' }))
        return
      }

      logger.info(
        `Saving config to GitHub repo: ${owner}/${repo}, path: ${filePath}, branch: ${branch}`
      )

      // Check if the file already exists
      const { exists, sha } = await checkFileExists(accessToken, owner, repo, filePath, branch)

      // Save the file to the repo (create or update)
      const result = await saveFileToRepo(
        accessToken,
        owner,
        repo,
        filePath,
        configContent,
        commitMessage,
        branch,
        exists ? sha : null
      )

      // Return success response
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          success: true,
          commitUrl: result.commitUrl,
          fileUrl: result.content?.html_url || null,
        })
      )

      logger.info(`Successfully saved config to GitHub: ${result.commitUrl}`)
    } catch (error) {
      logger.error('Error saving config to GitHub:', error)

      const isAuthError =
        error.message.includes('authentication') || error.message.includes('token')
      res.statusCode = isAuthError ? 401 : 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: error.message }))
    }
  },

  // Debug cookies endpoint
  async handleDebugCookies(req, res) {
    logger.info('Debugging cookies and state store')
    res.setHeader('Content-Type', 'application/json')

    const cookies = parseCookies(req.headers.cookie)
    const stateCount = stateStore.states.size
    const stateEntries = Array.from(stateStore.states.entries()).map(([state, expires]) => ({
      state: state.substring(0, 10) + '...',
      expiresIn: Math.floor((expires - Date.now()) / 1000) + ' seconds',
    }))

    res.end(
      JSON.stringify(
        {
          rawCookieHeader: req.headers.cookie,
          parsedCookies: cookies,
          stateStore: {
            count: stateCount,
            entries: stateEntries,
          },
          currentTime: new Date().toISOString(),
        },
        null,
        2
      )
    )
  },
}

// Create HTTP server with request handler
const server = http.createServer(async (req, res) => {
  try {
    logRequest(req)

    // Parse URL for path and query parameters
    const parsedUrl = parseUrl(req.url, true)
    const path = parsedUrl.pathname
    const query = parsedUrl.query

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    // Handle preflight request
    if (req.method === 'OPTIONS') {
      logger.info('Handling OPTIONS preflight request')
      res.statusCode = 204
      res.end()
      return
    }

    // Route request to appropriate handler
    if (req.method === 'GET') {
      if (path === '/' || path === '') {
        await routes.handleHomePage(req, res)
      } else if (path.startsWith('/auth/')) {
        await routes.handleOAuthAuthorization(req, res, path)
      } else if (path === '/callback' || path.startsWith('/callback/')) {
        await routes.handleOAuthCallback(req, res, query, path)
      } else if (path === '/oauth-status') {
        await routes.handleOAuthStatus(req, res)
      } else if (path === '/api/initial-config-data') {
        await routes.handleConfigData(req, res)
      } else if (path === '/api/github/user-repos') {
        await routes.handleGithubUserRepos(req, res)
      } else if (path === '/debug-cookies' && isDebugEndpointEnabled(process.env)) {
        await routes.handleDebugCookies(req, res)
      } else {
        // Not found
        logger.info('Invalid endpoint requested:', req.method, path)
        res.statusCode = 404
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Endpoint not found', method: req.method, url: req.url }))
      }
    } else if (req.method === 'POST') {
      if (
        path === '/generate-preview' ||
        path === '/generate-preview/' ||
        path.startsWith('/generate-preview?')
      ) {
        await routes.handleSvgGeneration(req, res)
      } else if (path === '/api/github/save-config') {
        await routes.handleGithubSaveConfig(req, res)
      } else if (path === '/api/save-local-config') {
        await routes.handleSaveLocalConfig(req, res)
      } else {
        // Not found
        logger.info('Invalid endpoint requested:', req.method, path)
        res.statusCode = 404
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Endpoint not found', method: req.method, url: req.url }))
      }
    } else {
      // Method not allowed
      logger.info('Method not allowed:', req.method, path)
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Method not allowed', method: req.method, url: req.url }))
    }
  } catch (serverError) {
    // Catch-all error handler
    logger.error('Unhandled server error:', serverError)
    try {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Internal server error' }))
    } catch (responseError) {
      logger.error('Error sending error response:', responseError)
    }
  }
})

// Server lifecycle management
server.listen(PORT, HOST, () => {
  logger.info(`Preview server running at http://${HOST}:${PORT}`)
  if (isExternalBind(HOST)) {
    logger.warn('================================================================')
    logger.warn(`SECURITY: preview server is bound to ${HOST} and is reachable from your LAN.`)
    logger.warn('Its endpoints are UNAUTHENTICATED and can commit to your GitHub repos')
    logger.warn('using your stored token. Only run this on a fully trusted network.')
    logger.warn('Unset PREVIEW_ALLOW_EXTERNAL / PREVIEW_SERVER_HOST to bind loopback-only.')
    logger.warn('================================================================')
  }
  logger.info(`Serving endpoints:`)
  logger.info(`- GET / - Homepage`)
  logger.info(`- GET /api/initial-config-data - Configuration API`)
  logger.info(`- POST /generate-preview - SVG generation`)
  logger.info(`- POST /api/save-local-config - Save configuration to local filesystem`)
  logger.info(`- GET /auth/{provider} - Initiate OAuth flow for a provider`)
  logger.info(`- GET /callback - Unified OAuth callback`)
  logger.info(`- GET /oauth-status - Check OAuth authentication status`)
  logger.info(`- GET /api/github/user-repos - Get user's writable GitHub repositories`)
  logger.info(`- POST /api/github/save-config - Save configuration to GitHub repository`)
  if (isDebugEndpointEnabled(process.env)) {
    logger.info(`- GET /debug-cookies - Debug state and cookies (DEBUG MODE ENABLED)`)
  }
})

server.on('error', (error) => {
  logger.error('Server error:', error)
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Please choose a different port.`)
  }
  process.exit(1)
})

process.on('SIGINT', () => {
  logger.info('Shutting down preview server...')
  server.close(() => {
    logger.info('Preview server stopped')
    process.exit(0)
  })
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason)
})
