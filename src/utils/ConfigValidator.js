/**
 * ConfigValidator.js
 * Validates the application configuration to ensure all required properties exist and have correct types
 * Single Responsibility: Configuration validation
 */

/**
 * Validates whether a value is a non-empty string
 * @param {any} value - The value to check
 * @param {string} propertyPath - Property path for error reporting
 * @returns {boolean} - true if valid, false otherwise
 */
function isNonEmptyString(value, propertyPath) {
    if (typeof value !== 'string') {
      console.error(`Configuration error: ${propertyPath} must be a string, got ${typeof value}`);
      return false;
    }
    
    if (value.trim() === '') {
      console.error(`Configuration error: ${propertyPath} cannot be an empty string`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Validates whether a value is a positive number
   * @param {any} value - The value to check
   * @param {string} propertyPath - Property path for error reporting
   * @returns {boolean} - true if valid, false otherwise
   */
  function isPositiveNumber(value, propertyPath) {
    if (typeof value !== 'number') {
      console.error(`Configuration error: ${propertyPath} must be a number, got ${typeof value}`);
      return false;
    }
    
    if (value <= 0) {
      console.error(`Configuration error: ${propertyPath} must be a positive number, got ${value}`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Validates whether a value is a valid Date object
   * @param {any} value - The value to check
   * @param {string} propertyPath - Property path for error reporting
   * @returns {boolean} - true if valid, false otherwise
   */
  function isValidDate(value, propertyPath) {
    if (!(value instanceof Date)) {
      console.error(`Configuration error: ${propertyPath} must be a Date object`);
      return false;
    }
    
    if (isNaN(value.getTime())) {
      console.error(`Configuration error: ${propertyPath} must be a valid Date, but it's invalid`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Validates whether a value is a string representing a number
   * @param {any} value - The value to check
   * @param {string} propertyPath - Property path for error reporting
   * @returns {boolean} - true if valid, false otherwise
   */
  function isStringRepresentingNumber(value, propertyPath) {
    if (!isNonEmptyString(value, propertyPath)) {
      return false;
    }
    
    if (isNaN(Number(value))) {
      console.error(`Configuration error: ${propertyPath} must be a string representing a number, got '${value}'`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Validates whether a value is a valid hex color string
   * @param {any} value - The value to check
   * @param {string} propertyPath - Property path for error reporting
   * @returns {boolean} - true if valid, false otherwise
   */
  function isValidHexColor(value, propertyPath) {
    if (!isNonEmptyString(value, propertyPath)) {
      return false;
    }
    
    // Check if it's a hex color (#RGB, #RGBA, #RRGGBB, or #RRGGBBAA)
    const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
    if (!hexColorRegex.test(value)) {
      console.error(`Configuration error: ${propertyPath} must be a valid hex color string (e.g., #RGB, #RGBA, #RRGGBB, or #RRGGBBAA), got '${value}'`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Validates that an object exists and contains required properties
   * @param {any} obj - The object to check
   * @param {string} objPath - Object path for error reporting
   * @param {string[]} requiredProps - Array of required property names
   * @returns {boolean} - true if valid, false otherwise
   */
  function validateObjectWithProps(obj, objPath, requiredProps) {
    if (!obj || typeof obj !== 'object') {
      console.error(`Configuration error: ${objPath} must be an object`);
      return false;
    }
    
    let isValid = true;
    
    for (const prop of requiredProps) {
      if (obj[prop] === undefined) {
        console.error(`Configuration error: Missing required property ${objPath}.${prop}`);
        isValid = false;
      }
    }
    
    return isValid;
  }
  
  /**
   * Validates the configuration object
   * @param {Object} config - The configuration object to validate
   * @returns {boolean} - true if the configuration is valid, false otherwise
   */
  export function validateConfiguration(config) {
    if (!config || typeof config !== 'object') {
      console.error('Configuration error: Config must be an object');
      return false;
    }
    
    let isValid = true;
    
    // Validate profile object
    const profileProps = ['NAME', 'PROFESSION', 'LOCATION', 'COMPANY', 'CURRENT_PROJECT', 'WORK_START_DATE', 'GITHUB_USERNAME'];
    if (!validateObjectWithProps(config.profile, 'config.profile', profileProps)) {
      isValid = false;
    } else {
      // Validate profile properties
      isValid = isNonEmptyString(config.profile.NAME, 'config.profile.NAME') && isValid;
      isValid = isNonEmptyString(config.profile.PROFESSION, 'config.profile.PROFESSION') && isValid;
      isValid = isNonEmptyString(config.profile.LOCATION, 'config.profile.LOCATION') && isValid;
      isValid = isNonEmptyString(config.profile.COMPANY, 'config.profile.COMPANY') && isValid;
      isValid = isNonEmptyString(config.profile.CURRENT_PROJECT, 'config.profile.CURRENT_PROJECT') && isValid;
      isValid = isValidDate(config.profile.WORK_START_DATE, 'config.profile.WORK_START_DATE') && isValid;
      isValid = isNonEmptyString(config.profile.GITHUB_USERNAME, 'config.profile.GITHUB_USERNAME') && isValid;
    }
    
    // Validate apiDefaults object
    const apiDefaultsProps = ['TEMPERATURE', 'WEATHER_DESCRIPTION', 'WEATHER_EMOJI', 'GITHUB_PUBLIC_REPOS', 'GITHUB_FOLLOWERS'];
    if (!validateObjectWithProps(config.apiDefaults, 'config.apiDefaults', apiDefaultsProps)) {
      isValid = false;
    } else {
      // Validate apiDefaults properties
      isValid = isNonEmptyString(config.apiDefaults.TEMPERATURE, 'config.apiDefaults.TEMPERATURE') && isValid;
      isValid = isNonEmptyString(config.apiDefaults.WEATHER_DESCRIPTION, 'config.apiDefaults.WEATHER_DESCRIPTION') && isValid;
      isValid = isNonEmptyString(config.apiDefaults.WEATHER_EMOJI, 'config.apiDefaults.WEATHER_EMOJI') && isValid;
      isValid = isStringRepresentingNumber(config.apiDefaults.GITHUB_PUBLIC_REPOS, 'config.apiDefaults.GITHUB_PUBLIC_REPOS') && isValid;
      isValid = isStringRepresentingNumber(config.apiDefaults.GITHUB_FOLLOWERS, 'config.apiDefaults.GITHUB_FOLLOWERS') && isValid;
    }
    
    // Validate layout object
    const layoutProps = ['FONT_FAMILY', 'FONT_SIZE_PX', 'LINE_HEIGHT_PX', 'CHAT_WIDTH_PX', 'CHAT_HEIGHT_PX', 'COLORS'];
    if (!validateObjectWithProps(config.layout, 'config.layout', layoutProps)) {
      isValid = false;
    } else {
      // Validate layout properties
      isValid = isNonEmptyString(config.layout.FONT_FAMILY, 'config.layout.FONT_FAMILY') && isValid;
      isValid = isPositiveNumber(config.layout.FONT_SIZE_PX, 'config.layout.FONT_SIZE_PX') && isValid;
      isValid = isPositiveNumber(config.layout.LINE_HEIGHT_PX, 'config.layout.LINE_HEIGHT_PX') && isValid;
      isValid = isPositiveNumber(config.layout.CHAT_WIDTH_PX, 'config.layout.CHAT_WIDTH_PX') && isValid;
      isValid = isPositiveNumber(config.layout.CHAT_HEIGHT_PX, 'config.layout.CHAT_HEIGHT_PX') && isValid;
      
      // Validate COLORS object
      const colorProps = ['ME_BUBBLE', 'VISITOR_BUBBLE', 'TEXT', 'VISITOR_TEXT', 'BACKGROUND_LIGHT', 'BACKGROUND_DARK'];
      if (!validateObjectWithProps(config.layout.COLORS, 'config.layout.COLORS', colorProps)) {
        isValid = false;
      } else {
        // Validate each color is a valid hex color
        for (const colorProp of colorProps) {
          isValid = isValidHexColor(config.layout.COLORS[colorProp], `config.layout.COLORS.${colorProp}`) && isValid;
        }
      }
      
      // Validate TIMING object (essential properties only)
      if (config.layout.TIMING) {
        isValid = (typeof config.layout.TIMING === 'object') && isValid;
        if (config.layout.TIMING.MIN_READING_TIME_MS !== undefined) {
          isValid = isPositiveNumber(config.layout.TIMING.MIN_READING_TIME_MS, 'config.layout.TIMING.MIN_READING_TIME_MS') && isValid;
        }
      }
      
      // Validate ANIMATION object (essential properties only)
      if (config.layout.ANIMATION) {
        isValid = (typeof config.layout.ANIMATION === 'object') && isValid;
        if (config.layout.ANIMATION.BUBBLE_ANIMATION_DURATION !== undefined) {
          isValid = isPositiveNumber(config.layout.ANIMATION.BUBBLE_ANIMATION_DURATION, 'config.layout.ANIMATION.BUBBLE_ANIMATION_DURATION') && isValid;
        }
      }
    }
    
    return isValid;
  }