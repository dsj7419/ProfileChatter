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
 * Embed avatar image as a base64 data URI
 * @param {string} sender - 'me' or 'visitor'
 * @param {string} filePath - Path to image file
 * @returns {boolean} - Whether embedding was successful
 */
function embedAvatar(sender, filePath) {
  try {
    if (!existsSync(filePath)) {
      console.warn(`Avatar image not found: ${filePath}`);
      return false;
    }
    
    const abs = path.resolve(filePath);
    const mime = filePath.toLowerCase().endsWith('.jpg') || filePath.toLowerCase().endsWith('.jpeg') 
      ? 'image/jpeg' 
      : 'image/png';
    const b64 = readFileSync(abs).toString('base64');
    config.avatars[sender].imageUrl = `data:${mime};base64,${b64}`;
    console.log(`✅ Embedded ${sender} avatar from ${filePath}`);
    return true;
  } catch (error) {
    console.warn(`Failed to embed avatar for ${sender}: ${error.message}`);
    // Fall back to initials-based avatar
    config.avatars[sender].imageUrl = '';
    return false;
  }
}

// Ensure dist directory exists
mkdirSync('dist', { recursive: true });

// Embed avatar images if they exist
if (config.avatars && config.avatars.enabled) {
  // Define avatar paths (adjust as needed)
  const avatarDir = path.join(process.cwd(), 'assets');
  const myAvatarPath = path.join(avatarDir, 'me-avatar.png');
  const visitorAvatarPath = path.join(avatarDir, 'visitor-avatar.png');
  
  // Create assets directory if it doesn't exist
  if (!existsSync(avatarDir)) {
    mkdirSync(avatarDir, { recursive: true });
    console.log('✅ Created assets directory for avatars');
  }
  
  // Embed avatars
  embedAvatar('me', myAvatarPath);
  embedAvatar('visitor', visitorAvatarPath);
}

// Generate SVG with configured data
generateChatSVG()
  .then(svg => {
    // Write SVG to file
    writeFileSync('dist/profile-chat.svg', svg);
    console.log('✅ SVG written to dist/profile-chat.svg');
  })
  .catch(error => {
    console.error('Error generating SVG:', error);
    process.exit(1);
  });