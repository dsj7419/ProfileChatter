/**
 * profileChatter.js
 * Main entry point for the application
 * Single Responsibility: Orchestrate the components to generate the SVG
 */
import 'dotenv/config';

import DataService from './services/DataService.js';
import TimelineBuilder from './services/TimelineBuilder.js';
import SvgRenderer from './rendering/SvgRenderer.js';
import { validateConfiguration } from './utils/ConfigValidator.js';
import { config } from './config/config.js';

/**
 * ProfileChatter class - Orchestrates the generation of animated chat SVGs
 */
class ProfileChatter {
  /**
   * Generate a complete chat SVG with animations
   * @param {Object} customContext - Optional data overrides
   * @returns {Promise<string>} - SVG markup string
   */
  async generateChatSVG(customContext = {}) {
    try {
      // 1. Validate configuration
      if (!validateConfiguration(config)) {
        console.error('Critical configuration errors found. SVG generation aborted. Please check the errors above.');
        return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="100">
          <style>text { font-family: sans-serif; font-size: 12px; }</style>
          <text x="10" y="20" fill="red">Configuration Error!</text>
          <text x="10" y="40" fill="black">Please check console logs</text>
          <text x="10" y="55" fill="black">for details.</text>
        </svg>`;
      }
      
      // 2. Get dynamic data for chat messages
      const dynamicData = await DataService.getDynamicData(customContext);
      
      // 3. Build animation timeline with typing and message events
      const timelineData = TimelineBuilder.buildTimeline(dynamicData);
      
      // 4. Render timeline to SVG markup
      return SvgRenderer.renderSVG(timelineData);
    } catch (error) {
      console.error('Error generating SVG:', error);
      
      // Return simple error SVG
      return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="100">
        <text x="10" y="30" fill="red">Error generating chat: ${error.message}</text>
      </svg>`;
    }
  }
}

// Create singleton instance
const profileChatter = new ProfileChatter();

// Export main function for use in main.js
export async function generateChatSVG(customContext = {}) {
  return await profileChatter.generateChatSVG(customContext);
}

// Optional: Direct CLI usage
if (typeof process !== 'undefined' && 
    import.meta.url === `file://${process.argv[1]}`) {
  generateChatSVG().then(console.log);
}