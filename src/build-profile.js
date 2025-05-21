/**
 * build-profile.js
 * Build script for generating the profile SVG
 * Single Responsibility: Build automation
 */
import { generateChatSVG } from './ProfileChatter.js';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { config } from './config/config.js';

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
      // console.warn(`Local avatar asset not found: ${filePath}`); // Optional: less noisy
      return false;
    }
    
    const abs = path.resolve(filePath);
    const mime = filePath.toLowerCase().endsWith('.jpg') || filePath.toLowerCase().endsWith('.jpeg') 
      ? 'image/jpeg' 
      : 'image/png';
    const b64 = readFileSync(abs).toString('base64');
    targetAvatarConfig[sender].imageUrl = `data:${mime};base64,${b64}`;
    console.log(`✅ Embedded local ${sender} avatar from ${filePath}`);
    return true;
  } catch (error) {
    console.warn(`Failed to embed local avatar for ${sender}: ${error.message}`);
    targetAvatarConfig[sender].imageUrl = ''; // Ensure it's empty on error
    return false;
  }
}

// Ensure dist directory exists
mkdirSync('dist', { recursive: true });

// Attempt to load profileChatterConfig.json
let loadedUiConfig = null;
const configFilePath = './profileChatterConfig.json';
if (existsSync(configFilePath)) {
  try {
    const configFileContent = readFileSync(configFilePath, 'utf8');
    loadedUiConfig = JSON.parse(configFileContent);
    console.log('✅ Found profileChatterConfig.json. Applying custom UI configuration.');
  } catch (error) {
    console.warn(`Failed to load custom configuration: ${error.message}. Proceeding with defaults and local asset fallbacks.`);
    loadedUiConfig = null; // Ensure it's null on error
  }
}

// Initialize effectiveAvatarConfig, prioritizing loadedUiConfig if available
let effectiveAvatarConfig = { 
  enabled: loadedUiConfig?.avatars?.enabled ?? config.avatars.enabled,
  me: { 
    imageUrl: loadedUiConfig?.avatars?.me?.imageUrl ?? '', 
    fallbackText: loadedUiConfig?.avatars?.me?.fallbackText ?? config.avatars.me.fallbackText
  },
  visitor: { 
    imageUrl: loadedUiConfig?.avatars?.visitor?.imageUrl ?? '',
    fallbackText: loadedUiConfig?.avatars?.visitor?.fallbackText ?? config.avatars.visitor.fallbackText
  },
  sizePx: loadedUiConfig?.avatars?.sizePx ?? config.avatars.sizePx,
  shape: loadedUiConfig?.avatars?.shape ?? config.avatars.shape,
  xOffsetPx: loadedUiConfig?.avatars?.xOffsetPx ?? config.avatars.xOffsetPx,
  yOffsetPx: loadedUiConfig?.avatars?.yOffsetPx ?? config.avatars.yOffsetPx
};

// Apply local asset embedding as a fallback if imageUrl is still empty
if (effectiveAvatarConfig.enabled) {
  const avatarDir = path.join(process.cwd(), 'assets');
  if (!existsSync(avatarDir)) {
    mkdirSync(avatarDir, { recursive: true });
    console.log('✅ Created assets directory for avatars');
  }

  if (!effectiveAvatarConfig.me.imageUrl) {
    const myAvatarPath = path.join(avatarDir, 'me-avatar.png');
    if (embedAvatarLocal('me', myAvatarPath, effectiveAvatarConfig)) {
      console.log('Applied local asset for ME avatar as fallback.');
    }
  }
  if (!effectiveAvatarConfig.visitor.imageUrl) {
    const visitorAvatarPath = path.join(avatarDir, 'visitor-avatar.png');
    if (embedAvatarLocal('visitor', visitorAvatarPath, effectiveAvatarConfig)) {
      console.log('Applied local asset for VISITOR avatar as fallback.');
    }
  }
}

// Prepare customContext for generateChatSVG
let customContext = {};
if (loadedUiConfig) {
  customContext = {
    profile: loadedUiConfig.profile,
    activeTheme: loadedUiConfig.activeTheme,
    chatMessages: loadedUiConfig.chatMessages,
    themeOverrides: loadedUiConfig.themeOverrides
  };
}
// Crucially, pass the processed effectiveAvatarConfig to generateChatSVG
customContext.avatars = effectiveAvatarConfig; 

// Generate SVG with configured data
generateChatSVG(customContext)
  .then(svg => {
    // Write SVG to file
    writeFileSync('dist/profile-chat.svg', svg);
    console.log('✅ SVG written to dist/profile-chat.svg');
  })
  .catch(error => {
    console.error('Error generating SVG:', error);
    process.exit(1);
  });