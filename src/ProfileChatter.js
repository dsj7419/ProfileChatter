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

// Deep merge function for theme objects
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      deepMerge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
  return target;
}

/**
 * ProfileChatter class - Orchestrates the generation of animated chat SVGs
 */
class ProfileChatter {
  /**
   * Generate a complete chat SVG with animations
   * @param {Object} customContext - Optional data overrides including profile, activeTheme, workStartDate, chatMessages, avatars, themeOverrides, and layoutAnimationOverrides
   * @returns {Promise<string>} - SVG markup string
   */
  async generateChatSVG(customContext = {}) {
    try {
      console.log('generateChatSVG called with custom context:', {
        hasProfile: !!customContext.profile,
        activeTheme: customContext.activeTheme,
        hasChatMessages: Array.isArray(customContext.chatMessages),
        messageCount: Array.isArray(customContext.chatMessages) ? customContext.chatMessages.length : 0,
        hasAvatars: !!customContext.avatars,
        hasThemeOverrides: !!customContext.themeOverrides,
        hasLayoutAnimationOverrides: !!customContext.layoutAnimationOverrides
      });
    
      // Apply theme override if provided
      let originalTheme = null;
      if (customContext.activeTheme && config.themes[customContext.activeTheme]) {
        console.log(`Temporarily overriding theme from ${config.activeTheme} to ${customContext.activeTheme}`);
        originalTheme = config.activeTheme;
        config.activeTheme = customContext.activeTheme;
      }
    
      // Apply avatars override if provided
      let originalAvatars = null;
      if (customContext.avatars) {
        console.log(`Temporarily overriding avatar configuration`);
        originalAvatars = JSON.parse(JSON.stringify(config.avatars)); // Deep clone
        // Merge avatar configurations
        config.avatars = {
          ...config.avatars,
          ...customContext.avatars,
          me: {
            ...config.avatars.me,
            ...(customContext.avatars.me || {})
          },
          visitor: {
            ...config.avatars.visitor,
            ...(customContext.avatars.visitor || {})
          }
        };
      }
    
      // Apply theme overrides if provided
      let originalThemeObject = null;
      let themeNameToOverride = customContext.activeTheme || config.activeTheme;
    
      if (customContext.themeOverrides && config.themes[themeNameToOverride]) {
        console.log(`Applying themeOverrides for theme: ${themeNameToOverride}`);
        originalThemeObject = JSON.parse(JSON.stringify(config.themes[themeNameToOverride])); // Deep clone original
      
        // Deep merge customContext.themeOverrides into a copy of the base theme
        const baseTheme = JSON.parse(JSON.stringify(config.themes[themeNameToOverride]));
        config.themes[themeNameToOverride] = deepMerge(baseTheme, customContext.themeOverrides);
      }
      
      // Apply layout animation overrides if provided
      let originalLayoutAnimation = null;
      if (customContext.layoutAnimationOverrides) {
        console.log('Temporarily applying layout animation overrides');
        originalLayoutAnimation = JSON.parse(JSON.stringify(config.layout.ANIMATION));
        
        // Only override the properties that are provided
        Object.keys(customContext.layoutAnimationOverrides).forEach(key => {
          if (Object.prototype.hasOwnProperty.call(config.layout.ANIMATION, key)) {
            config.layout.ANIMATION[key] = customContext.layoutAnimationOverrides[key];
          }
        });
      }
      
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
      console.log('Fetching dynamic data...');
      const dynamicData = await DataService.getDynamicData(customContext);
      
      // Pass layoutAnimationOverrides to dynamic data if present
      if (customContext.layoutAnimationOverrides) {
        dynamicData.layoutAnimationOverrides = customContext.layoutAnimationOverrides;
      }
      
      console.log('Dynamic data fetched successfully');
      
      // 3. Build animation timeline with typing and message events
      console.log('Building timeline...');
      const timelineBuilder = new TimelineBuilder(customContext.chatMessages || null);
      const timelineData = timelineBuilder.buildTimeline(dynamicData);
      console.log('Timeline built successfully');
      
      // 4. Render timeline to SVG markup
      console.log('Rendering SVG...');
      const svgMarkup = SvgRenderer.renderSVG(timelineData);
      console.log(`SVG rendered successfully (${svgMarkup.length} characters)`);
      
      // Restore original theme if it was changed
      if (originalTheme !== null) {
        console.log(`Restoring original theme: ${originalTheme}`);
        config.activeTheme = originalTheme;
      }
      
      // Restore original theme object if it was modified
      if (originalThemeObject !== null) {
        console.log(`Restoring original theme object for: ${themeNameToOverride}`);
        config.themes[themeNameToOverride] = originalThemeObject;
      }
      
      // Restore original avatars if they were changed
      if (originalAvatars !== null) {
        console.log(`Restoring original avatar configuration`);
        config.avatars = originalAvatars;
      }
      
      // Restore original layout animation if it was modified
      if (originalLayoutAnimation !== null) {
        console.log(`Restoring original layout animation configuration`);
        config.layout.ANIMATION = originalLayoutAnimation;
      }
      
      return svgMarkup;
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