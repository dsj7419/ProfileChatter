/**
 * build-profile.js
 * Build script for generating the profile SVG
 * Single Responsibility: Build automation
 *
 * IMPORTANT: For GitHub README compatibility, avatar images should be:
 * 1. Base64 data URIs (preferred, works everywhere)
 * 2. Local assets (fallback, automatically embedded as Base64)
 * External HTTP/HTTPS URLs will NOT display in GitHub READMEs due to CSP restrictions.
 */
import { generateChatSVG } from './ProfileChatter.js'
import { writeFileSync, appendFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { config } from './config/config.js'
import DataService from './services/DataService.js'
import { emitStatusManifest } from './services/utils/statusManifest.js'

/**
 * Embed local avatar image as a base64 data URI
 * @param {string} sender - 'me' or 'visitor'
 * @param {string} filePath - Path to image file
 * @param {Object} targetAvatarConfig - Config object to modify directly
 * @returns {boolean} - Whether embedding was successful
 */
function embedAvatarLocal(sender, filePath, targetAvatarConfig) {
  try {
    if (!existsSync(filePath)) {
      console.warn(`Local avatar asset not found: ${filePath}`)
      return false
    }

    const abs = path.resolve(filePath)
    const mime =
      filePath.toLowerCase().endsWith('.jpg') || filePath.toLowerCase().endsWith('.jpeg')
        ? 'image/jpeg'
        : 'image/png'
    const b64 = readFileSync(abs).toString('base64')
    targetAvatarConfig[sender].imageUrl = `data:${mime};base64,${b64}`
    console.log(`✅ Embedded local ${sender} avatar from ${filePath}`)
    return true
  } catch (error) {
    console.warn(`Failed to embed local avatar for ${sender}: ${error.message}`)
    targetAvatarConfig[sender].imageUrl = '' // Ensure it's empty on error
    return false
  }
}

/**
 * Check if a URL is an external HTTP/HTTPS URL
 * @param {string} url - URL to check
 * @returns {boolean} - Whether the URL is external
 */
function isExternalUrl(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))
}

/**
 * Check if a URL is a valid data URI
 * @param {string} url - URL to check
 * @returns {boolean} - Whether the URL is a valid data URI
 */
function isDataUri(url) {
  return typeof url === 'string' && url.startsWith('data:image/')
}

// Ensure dist directory exists
mkdirSync('dist', { recursive: true })

// Attempt to load profileChatterConfig.json
let loadedUiConfig = null
const configFilePath = './profileChatterConfig.json'
if (existsSync(configFilePath)) {
  try {
    const configFileContent = readFileSync(configFilePath, 'utf8')
    loadedUiConfig = JSON.parse(configFileContent)
    console.log('✅ Found profileChatterConfig.json. Applying custom UI configuration.')
  } catch (error) {
    console.warn(
      `Failed to load custom configuration: ${error.message}. Proceeding with defaults and local asset fallbacks.`
    )
    loadedUiConfig = null // Ensure it's null on error
  }
}

// Initialize effectiveAvatarConfig, prioritizing loadedUiConfig if available
let effectiveAvatarConfig = {
  enabled: loadedUiConfig?.avatars?.enabled ?? config.avatars.enabled,
  me: {
    imageUrl: '', // Start with empty and fill based on logic below
    fallbackText: loadedUiConfig?.avatars?.me?.fallbackText ?? config.avatars.me.fallbackText,
  },
  visitor: {
    imageUrl: '', // Start with empty and fill based on logic below
    fallbackText:
      loadedUiConfig?.avatars?.visitor?.fallbackText ?? config.avatars.visitor.fallbackText,
  },
  sizePx: loadedUiConfig?.avatars?.sizePx ?? config.avatars.sizePx,
  shape: loadedUiConfig?.avatars?.shape ?? config.avatars.shape,
  xOffsetPx: loadedUiConfig?.avatars?.xOffsetPx ?? config.avatars.xOffsetPx,
  yOffsetPx: loadedUiConfig?.avatars?.yOffsetPx ?? config.avatars.yOffsetPx,
}

// Process avatar URLs in order of preference: Data URI > Local Asset > External URL
// The "me" avatar
if (loadedUiConfig?.avatars?.me?.imageUrl) {
  const meImageUrl = loadedUiConfig.avatars.me.imageUrl

  if (isDataUri(meImageUrl)) {
    // If it's a data URI, use it directly (most preferred)
    effectiveAvatarConfig.me.imageUrl = meImageUrl
    console.log('Using data URI for ME avatar from profileChatterConfig.json')
  } else if (isExternalUrl(meImageUrl)) {
    // If it's an external URL, store it but attempt to use local asset first
    console.log(
      `WARNING: External URL detected for ME avatar: "${meImageUrl}". This may not display in GitHub READMEs due to CSP restrictions.`
    )
    effectiveAvatarConfig.me.externalUrl = meImageUrl
    // Will try local asset embedding below, then fall back to this external URL
  } else {
    console.warn(`Invalid ME avatar URL format: "${meImageUrl}". Will try local asset fallback.`)
  }
}

// The "visitor" avatar
if (loadedUiConfig?.avatars?.visitor?.imageUrl) {
  const visitorImageUrl = loadedUiConfig.avatars.visitor.imageUrl

  if (isDataUri(visitorImageUrl)) {
    // If it's a data URI, use it directly (most preferred)
    effectiveAvatarConfig.visitor.imageUrl = visitorImageUrl
    console.log('Using data URI for VISITOR avatar from profileChatterConfig.json')
  } else if (isExternalUrl(visitorImageUrl)) {
    // If it's an external URL, store it but attempt to use local asset first
    console.log(
      `WARNING: External URL detected for VISITOR avatar: "${visitorImageUrl}". This may not display in GitHub READMEs due to CSP restrictions.`
    )
    effectiveAvatarConfig.visitor.externalUrl = visitorImageUrl
    // Will try local asset embedding below, then fall back to this external URL
  } else {
    console.warn(
      `Invalid VISITOR avatar URL format: "${visitorImageUrl}". Will try local asset fallback.`
    )
  }
}

// Apply local asset embedding as a fallback if imageUrl is still empty
if (effectiveAvatarConfig.enabled) {
  const avatarDir = path.join(process.cwd(), 'assets')
  if (!existsSync(avatarDir)) {
    mkdirSync(avatarDir, { recursive: true })
    console.log('✅ Created assets directory for avatars')
  }

  // Try local asset for ME avatar if needed
  if (!effectiveAvatarConfig.me.imageUrl) {
    const myAvatarPath = path.join(avatarDir, 'me-avatar.png')
    if (embedAvatarLocal('me', myAvatarPath, effectiveAvatarConfig)) {
      console.log('✅ Applied local asset for ME avatar as fallback.')
    } else if (effectiveAvatarConfig.me.externalUrl) {
      // If local fallback fails, use the original external URL as last resort
      console.log(
        '⚠️ Local ME avatar not found. Using external URL as last resort (will not show on GitHub).'
      )
      effectiveAvatarConfig.me.imageUrl = effectiveAvatarConfig.me.externalUrl
    }
  }

  // Try local asset for VISITOR avatar if needed
  if (!effectiveAvatarConfig.visitor.imageUrl) {
    const visitorAvatarPath = path.join(avatarDir, 'visitor-avatar.png')
    if (embedAvatarLocal('visitor', visitorAvatarPath, effectiveAvatarConfig)) {
      console.log('✅ Applied local asset for VISITOR avatar as fallback.')
    } else if (effectiveAvatarConfig.visitor.externalUrl) {
      // If local fallback fails, use the original external URL as last resort
      console.log(
        '⚠️ Local VISITOR avatar not found. Using external URL as last resort (will not show on GitHub).'
      )
      effectiveAvatarConfig.visitor.imageUrl = effectiveAvatarConfig.visitor.externalUrl
    }
  }
}

// Add a final warning if any external URLs are still being used
if (
  isExternalUrl(effectiveAvatarConfig.me.imageUrl) ||
  isExternalUrl(effectiveAvatarConfig.visitor.imageUrl)
) {
  console.log('\n⚠️ GITHUB COMPATIBILITY WARNING ⚠️')
  console.log('External URLs are being used for avatars. These will NOT display in GitHub READMEs.')
  console.log('For GitHub compatibility, use Base64 data URIs in the Configurator UI,')
  console.log(
    'or place PNG images in the assets/ directory named me-avatar.png and visitor-avatar.png.\n'
  )
}

// Prepare customContext for generateChatSVG
let customContext = {}
if (loadedUiConfig) {
  customContext = {
    profile: loadedUiConfig.profile,
    activeTheme: loadedUiConfig.activeTheme,
    chatMessages: loadedUiConfig.chatMessages,
    themeOverrides: loadedUiConfig.themeOverrides,
  }
}
// Pass the processed effectiveAvatarConfig to generateChatSVG
customContext.avatars = effectiveAvatarConfig

// Generate SVG with configured data
generateChatSVG(customContext)
  .then((svg) => {
    // Write SVG to file
    writeFileSync('dist/profile-chat.svg', svg)
    console.log('✅ SVG written to dist/profile-chat.svg')

    // Emit the per-source status manifest (PR-5b-i observability): machine-readable
    // JSON + a GitHub Actions step summary, so a green build can no longer hide a
    // configured source that quietly fell back. Intentional skips do not alarm.
    const manifest = emitStatusManifest(DataService.lastSourceStatuses, {
      manifestPath: 'dist/status-manifest.json',
      stepSummaryPath: process.env.GITHUB_STEP_SUMMARY,
      writeFile: writeFileSync,
      appendFile: appendFileSync,
    })
    console.log(
      `📊 Status manifest: ${manifest.summary.live} live, ${manifest.summary.skip} skip, ` +
        `${manifest.summary.fallback} fallback, ${manifest.summary.error} error` +
        (manifest.summary.alerting
          ? ` (alerting — ${manifest.summary.highSignal} high-signal)`
          : '')
    )
  })
  .catch((error) => {
    console.error('Error generating SVG:', error)
    process.exit(1)
  })
