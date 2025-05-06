/**
 * ProfileConstants.js
 * Contains user-specific profile data that can be customized
 * Single Responsibility: Store user profile configuration
 */

/**
 * User profile information - customize these values
 */
export const PROFILE = {
    // Personal information
    NAME: "Dan Johnson",
    PROFESSION: "Software Developer",
    LOCATION: "San Diego",
    COMPANY: "Encore",
    CURRENT_PROJECT: "ProfileChatter SVG Generator",
    
    // Work information
    WORK_START_DATE: new Date(2022, 0, 1), // January 1, 2022
    
    // GitHub username for stats
    GITHUB_USERNAME: "dsj7419"
  };
  
  /**
   * Default values used when APIs fail
   */
  export const DEFAULTS = {
    // Weather defaults
    TEMPERATURE: "72°F (22°C)",
    WEATHER_DESCRIPTION: "partly cloudy",
    WEATHER_EMOJI: "⛅",
    
    // GitHub defaults
    GITHUB_PUBLIC_REPOS: "12",
    GITHUB_FOLLOWERS: "48"
  };