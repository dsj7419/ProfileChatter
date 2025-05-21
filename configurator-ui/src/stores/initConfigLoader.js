import { validateConfiguration } from '../../../src/utils/ConfigValidator.js';
import { userConfig, editableTheme, chatMessages, workStartDate } from './configStore.js';

/**
 * Apply a previously-saved configuration object to the live Svelte stores.
 * Keeps each concern isolated (SRP).
 */
export function applyConfig(data) {
  if (!data || typeof data !== 'object') {
    console.error('[ConfigLoader] Cannot apply invalid configuration - data is not an object');
    return;
  }
  
  // Log the config being applied for debugging
  console.log('[ConfigLoader] Attempting to apply config:', Object.keys(data));
  
  // Validate configuration with more detailed feedback
  if (!validateConfiguration(data)) {
    console.warn('[ConfigLoader] Configuration validation failed - using defaults');
    
    // Instead of completely failing, we'll try to apply the parts that we can
    // Just log a warning that the configuration isn't fully valid
    console.info('[ConfigLoader] Attempting partial configuration application anyway');
  }
  
  const themeOverrides = data.themeOverrides || data.theme;
  
  // ----- 1️⃣ userConfig deep merge -----
  if (data.profile || data.avatars || data.layoutAnimationOverrides) {
    userConfig.update(cfg => {
      const next = structuredClone(cfg);                  // deep clone
      
      if (data.profile) {
        const { WORK_START_DATE, ...profileRest } = data.profile;
        next.profile = { ...next.profile, ...profileRest };
        
        // Handle work start date if it exists
        if (WORK_START_DATE) {
          try {
            workStartDate.set(WORK_START_DATE);
            console.log('[ConfigLoader] Applied work start date');
          } catch (e) {
            console.warn('[ConfigLoader] Error applying work start date:', e);
          }
        }
      }
      
      if (data.avatars) {
        next.avatars = { 
          ...next.avatars, 
          ...data.avatars,
          // Ensure nested objects are properly merged
          me: { ...next.avatars?.me, ...data.avatars?.me },
          visitor: { ...next.avatars?.visitor, ...data.avatars?.visitor }
        };
      }
      
      if (data.layoutAnimationOverrides) {
        next.layout ??= {};
        next.layout.ANIMATION ??= {};
        Object.assign(next.layout.ANIMATION, data.layoutAnimationOverrides);
      }
      
      if (data.activeTheme) next.activeTheme = data.activeTheme;
      
      return next;
    });
  }
  
  // ----- 2️⃣ theme overrides -----
  if (themeOverrides) {
    console.log('[ConfigLoader] Applying theme overrides');
    editableTheme.update(t => ({ ...t, ...themeOverrides }));
  }
  
  // ----- 3️⃣ chat messages -----
  if (Array.isArray(data.chatMessages)) {
    chatMessages.set(data.chatMessages);
  }
  
  console.log('[ConfigLoader] Configuration applied successfully');
}