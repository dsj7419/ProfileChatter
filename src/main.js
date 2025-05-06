/**
 * main.js
 * Entry point for ProfileChatter
 * Single Responsibility: Provide main application interface
 */
import { generateChatSVG } from './profileChatter.js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Main exported function for external use
 * @param {Object} customContext - Optional data overrides
 * @returns {Promise<string>} - SVG markup
 */
export async function generate(customContext = {}) {
  return await generateChatSVG(customContext);
}

// CLI handler
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    // Get output path from args or use default
    const outputPath = process.argv[2] || 'dist/profile-chat.svg';
    
    // Create directories if needed
    mkdirSync(dirname(outputPath), { recursive: true });
    
    // Generate SVG and write to file
    generateChatSVG()
      .then(svg => {
        writeFileSync(outputPath, svg);
        console.log(`✅ SVG written to ${outputPath}`);
      })
      .catch(error => {
        console.error('Error:', error);
        process.exit(1);
      });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}