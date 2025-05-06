/**
 * build-profile.js
 * Build script for generating the profile SVG
 * Single Responsibility: Build automation
 */
import { generateChatSVG } from './profileChatter.js';
import { writeFileSync, mkdirSync } from 'node:fs';

// Ensure dist directory exists
mkdirSync('dist', { recursive: true });

// Generate SVG with default data
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