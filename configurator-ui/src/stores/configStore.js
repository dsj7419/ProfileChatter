import { writable } from 'svelte/store';

// Initial profile configuration that mirrors the structure in config.js
const initialProfileConfig = {
  NAME: "Your Name",
  PROFESSION: "Your Profession",
  LOCATION: "Your City",
  COMPANY: "Your Company",
  CURRENT_PROJECT: "ProfileChatter SVG Generator",
  GITHUB_USERNAME: "your_github",
  WAKATIME_USERNAME: "your_wakatime",
  TWITTER_USERNAME: "",
  CODESTATS_USERNAME: ""
};

// Initial avatar configuration that mirrors the structure in config.js
const initialAvatarsConfig = {
  enabled: true,
  me: { imageUrl: "", fallbackText: "ME" }, // Default to "ME" or user's initials if available
  visitor: { imageUrl: "", fallbackText: "?" },
  sizePx: 32, // Could be configurable later, for now use default
  shape: "circle", // 'circle' or 'square'
  // xOffsetPx and yOffsetPx are layout details, less critical for user UI in MVP
};

// Main configuration store
export const userConfig = writable({
  profile: { ...initialProfileConfig },
  activeTheme: "ios", // Default theme
  avatars: { ...initialAvatarsConfig }, // Add avatar config
  // other config sections will be added later
});

// Separate store for WORK_START_DATE as string components
export const workStartDate = writable({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1, // 1-indexed for UI
  day: new Date().getDate()
});

// Store for chat messages
export const chatMessages = writable([]);