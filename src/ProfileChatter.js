/**
 * profileChatter.js
 * Main entry point for the application
 * Single Responsibility: Orchestrate the components to generate the SVG
 */
import DataService from './services/DataService.js';
import TimelineBuilder from './services/TimelineBuilder.js';
import SvgRenderer from './rendering/SvgRenderer.js';

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
      // 1. Get dynamic data for chat messages
      const dynamicData = await DataService.getDynamicData(customContext);
      
      // 2. Build animation timeline with typing and message events
      const timelineData = TimelineBuilder.buildTimeline(dynamicData);
      
      // 3. Render timeline to SVG markup
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