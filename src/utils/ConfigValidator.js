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
 * Validates whether a value is a non-negative number
 * @param {any} value - The value to check
 * @param {string} propertyPath - Property path for error reporting
 * @returns {boolean} - true if valid, false otherwise
 */
function isNonNegativeNumber(value, propertyPath) {
  if (typeof value !== 'number') {
    console.error(`Configuration error: ${propertyPath} must be a number, got ${typeof value}`);
    return false;
  }
  
  if (value < 0) {
    console.error(`Configuration error: ${propertyPath} must be a non-negative number, got ${value}`);
    return false;
  }
  
  return true;
}

/**
 * Validates whether a value is a number between 0 and 1
 * @param {any} value - The value to check
 * @param {string} propertyPath - Property path for error reporting
 * @returns {boolean} - true if valid, false otherwise
 */
function isOpacityValue(value, propertyPath) {
  if (typeof value !== 'number') {
    console.error(`Configuration error: ${propertyPath} must be a number, got ${typeof value}`);
    return false;
  }
  
  if (value < 0 || value > 1) {
    console.error(`Configuration error: ${propertyPath} must be between 0 and 1, got ${value}`);
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
 * Validates chart styles configuration
 * @param {Object} chartStyles - The chart styles object to validate
 * @param {string} themeName - Name of the theme for error reporting
 * @returns {boolean} - true if valid, false otherwise
 */
function validateChartStyles(chartStyles, themeName) {
  if (!chartStyles || typeof chartStyles !== 'object') {
    console.error(`Configuration error: themes.${themeName}.CHART_STYLES must be an object`);
    return false;
  }
  
  let isValid = true;
  
  // Required chart style properties
  const chartStyleProps = [
    'BAR_DEFAULT_COLOR',
    'BAR_HEIGHT_PX',
    'BAR_SPACING_PX',
    'LABEL_FONT_FAMILY',
    'LABEL_FONT_SIZE_PX',
    'LABEL_COLOR',
    'LABEL_MAX_WIDTH_PX',
    'VALUE_TEXT_FONT_FAMILY',
    'VALUE_TEXT_FONT_SIZE_PX',
    'VALUE_TEXT_COLOR',
    'TITLE_FONT_FAMILY',
    'TITLE_FONT_SIZE_PX',
    'TITLE_COLOR',
    'CHART_PADDING_X_PX',
    'CHART_PADDING_Y_PX',
    'AXIS_LINE_COLOR',
    'GRID_LINE_COLOR'
  ];
  
  // Check for required properties
  for (const prop of chartStyleProps) {
    if (chartStyles[prop] === undefined) {
      console.error(`Configuration error: Missing required property in themes.${themeName}.CHART_STYLES: ${prop}`);
      isValid = false;
    }
  }
  
  // Validate property types
  if (chartStyles.BAR_DEFAULT_COLOR !== undefined) {
    isValid = isValidHexColor(chartStyles.BAR_DEFAULT_COLOR, `themes.${themeName}.CHART_STYLES.BAR_DEFAULT_COLOR`) && isValid;
  }
  
  if (chartStyles.BAR_HEIGHT_PX !== undefined) {
    isValid = isPositiveNumber(chartStyles.BAR_HEIGHT_PX, `themes.${themeName}.CHART_STYLES.BAR_HEIGHT_PX`) && isValid;
  }
  
  if (chartStyles.BAR_SPACING_PX !== undefined) {
    isValid = isNonNegativeNumber(chartStyles.BAR_SPACING_PX, `themes.${themeName}.CHART_STYLES.BAR_SPACING_PX`) && isValid;
  }
  
  if (chartStyles.LABEL_FONT_FAMILY !== undefined) {
    isValid = isNonEmptyString(chartStyles.LABEL_FONT_FAMILY, `themes.${themeName}.CHART_STYLES.LABEL_FONT_FAMILY`) && isValid;
  }
  
  if (chartStyles.LABEL_FONT_SIZE_PX !== undefined) {
    isValid = isPositiveNumber(chartStyles.LABEL_FONT_SIZE_PX, `themes.${themeName}.CHART_STYLES.LABEL_FONT_SIZE_PX`) && isValid;
  }
  
  if (chartStyles.LABEL_COLOR !== undefined) {
    isValid = isValidHexColor(chartStyles.LABEL_COLOR, `themes.${themeName}.CHART_STYLES.LABEL_COLOR`) && isValid;
  }
  
  if (chartStyles.LABEL_MAX_WIDTH_PX !== undefined) {
    isValid = isPositiveNumber(chartStyles.LABEL_MAX_WIDTH_PX, `themes.${themeName}.CHART_STYLES.LABEL_MAX_WIDTH_PX`) && isValid;
  }
  
  if (chartStyles.VALUE_TEXT_FONT_FAMILY !== undefined) {
    isValid = isNonEmptyString(chartStyles.VALUE_TEXT_FONT_FAMILY, `themes.${themeName}.CHART_STYLES.VALUE_TEXT_FONT_FAMILY`) && isValid;
  }
  
  if (chartStyles.VALUE_TEXT_FONT_SIZE_PX !== undefined) {
    isValid = isPositiveNumber(chartStyles.VALUE_TEXT_FONT_SIZE_PX, `themes.${themeName}.CHART_STYLES.VALUE_TEXT_FONT_SIZE_PX`) && isValid;
  }
  
  if (chartStyles.VALUE_TEXT_COLOR !== undefined) {
    isValid = isValidHexColor(chartStyles.VALUE_TEXT_COLOR, `themes.${themeName}.CHART_STYLES.VALUE_TEXT_COLOR`) && isValid;
  }
  
  if (chartStyles.TITLE_FONT_FAMILY !== undefined) {
    isValid = isNonEmptyString(chartStyles.TITLE_FONT_FAMILY, `themes.${themeName}.CHART_STYLES.TITLE_FONT_FAMILY`) && isValid;
  }
  
  if (chartStyles.TITLE_FONT_SIZE_PX !== undefined) {
    isValid = isPositiveNumber(chartStyles.TITLE_FONT_SIZE_PX, `themes.${themeName}.CHART_STYLES.TITLE_FONT_SIZE_PX`) && isValid;
  }
  
  if (chartStyles.TITLE_COLOR !== undefined) {
    isValid = isValidHexColor(chartStyles.TITLE_COLOR, `themes.${themeName}.CHART_STYLES.TITLE_COLOR`) && isValid;
  }
  
  if (chartStyles.CHART_PADDING_X_PX !== undefined) {
    isValid = isNonNegativeNumber(chartStyles.CHART_PADDING_X_PX, `themes.${themeName}.CHART_STYLES.CHART_PADDING_X_PX`) && isValid;
  }
  
  if (chartStyles.CHART_PADDING_Y_PX !== undefined) {
    isValid = isNonNegativeNumber(chartStyles.CHART_PADDING_Y_PX, `themes.${themeName}.CHART_STYLES.CHART_PADDING_Y_PX`) && isValid;
  }
  
  if (chartStyles.AXIS_LINE_COLOR !== undefined) {
    isValid = isValidHexColor(chartStyles.AXIS_LINE_COLOR, `themes.${themeName}.CHART_STYLES.AXIS_LINE_COLOR`) && isValid;
  }
  
  if (chartStyles.GRID_LINE_COLOR !== undefined) {
    isValid = isValidHexColor(chartStyles.GRID_LINE_COLOR, `themes.${themeName}.CHART_STYLES.GRID_LINE_COLOR`) && isValid;
  }
  
  return isValid;
}

/**
 * Validates a theme object
 * @param {Object} theme - The theme object to validate
 * @param {string} themeName - Name of the theme for error reporting
 * @returns {boolean} - true if the theme is valid, false otherwise
 */
function validateTheme(theme, themeName) {
  if (!theme || typeof theme !== 'object') {
    console.error(`Configuration error: Theme "${themeName}" must be an object`);
    return false;
  }
  
  let isValid = true;
  
  // Required theme properties
  const themeProps = [
    'ME_BUBBLE_COLOR',
    'VISITOR_BUBBLE_COLOR',
    'ME_TEXT_COLOR',
    'VISITOR_TEXT_COLOR',
    'BACKGROUND_LIGHT',
    'BACKGROUND_DARK',
    'BUBBLE_RADIUS_PX',
    'FONT_FAMILY',
    // Required reaction properties
    'REACTION_FONT_SIZE_PX',
    'REACTION_BG_COLOR',
    'REACTION_BG_OPACITY',
    'REACTION_TEXT_COLOR',
    'REACTION_PADDING_X_PX',
    'REACTION_PADDING_Y_PX',
    'REACTION_BORDER_RADIUS_PX',
    'REACTION_OFFSET_X_PX',
    'REACTION_OFFSET_Y_PX',
    // Required chart styles
    'CHART_STYLES'
  ];
  
  // Check for required properties
  for (const prop of themeProps) {
    if (theme[prop] === undefined) {
      console.error(`Configuration error: Missing required property in theme "${themeName}": ${prop}`);
      isValid = false;
    }
  }
  
  // Validate property types
  if (theme.ME_BUBBLE_COLOR !== undefined) {
    isValid = isValidHexColor(theme.ME_BUBBLE_COLOR, `config.themes.${themeName}.ME_BUBBLE_COLOR`) && isValid;
  }
  
  if (theme.VISITOR_BUBBLE_COLOR !== undefined) {
    isValid = isValidHexColor(theme.VISITOR_BUBBLE_COLOR, `config.themes.${themeName}.VISITOR_BUBBLE_COLOR`) && isValid;
  }
  
  if (theme.ME_TEXT_COLOR !== undefined) {
    isValid = isValidHexColor(theme.ME_TEXT_COLOR, `config.themes.${themeName}.ME_TEXT_COLOR`) && isValid;
  }
  
  if (theme.VISITOR_TEXT_COLOR !== undefined) {
    isValid = isValidHexColor(theme.VISITOR_TEXT_COLOR, `config.themes.${themeName}.VISITOR_TEXT_COLOR`) && isValid;
  }
  
  if (theme.BACKGROUND_LIGHT !== undefined) {
    isValid = isValidHexColor(theme.BACKGROUND_LIGHT, `config.themes.${themeName}.BACKGROUND_LIGHT`) && isValid;
  }
  
  if (theme.BACKGROUND_DARK !== undefined) {
    isValid = isValidHexColor(theme.BACKGROUND_DARK, `config.themes.${themeName}.BACKGROUND_DARK`) && isValid;
  }
  
  if (theme.BUBBLE_RADIUS_PX !== undefined) {
    isValid = isPositiveNumber(theme.BUBBLE_RADIUS_PX, `config.themes.${themeName}.BUBBLE_RADIUS_PX`) && isValid;
  }
  
  if (theme.FONT_FAMILY !== undefined) {
    isValid = isNonEmptyString(theme.FONT_FAMILY, `config.themes.${themeName}.FONT_FAMILY`) && isValid;
  }
  
  // Validate reaction properties
  if (theme.REACTION_FONT_SIZE_PX !== undefined) {
    isValid = isPositiveNumber(theme.REACTION_FONT_SIZE_PX, `config.themes.${themeName}.REACTION_FONT_SIZE_PX`) && isValid;
  }
  
  if (theme.REACTION_BG_COLOR !== undefined) {
    isValid = isValidHexColor(theme.REACTION_BG_COLOR, `config.themes.${themeName}.REACTION_BG_COLOR`) && isValid;
  }
  
  if (theme.REACTION_BG_OPACITY !== undefined) {
    isValid = isOpacityValue(theme.REACTION_BG_OPACITY, `config.themes.${themeName}.REACTION_BG_OPACITY`) && isValid;
  }
  
  if (theme.REACTION_TEXT_COLOR !== undefined) {
    isValid = isValidHexColor(theme.REACTION_TEXT_COLOR, `config.themes.${themeName}.REACTION_TEXT_COLOR`) && isValid;
  }
  
  if (theme.REACTION_PADDING_X_PX !== undefined) {
    isValid = isPositiveNumber(theme.REACTION_PADDING_X_PX, `config.themes.${themeName}.REACTION_PADDING_X_PX`) && isValid;
  }
  
  if (theme.REACTION_PADDING_Y_PX !== undefined) {
    isValid = isPositiveNumber(theme.REACTION_PADDING_Y_PX, `config.themes.${themeName}.REACTION_PADDING_Y_PX`) && isValid;
  }
  
  if (theme.REACTION_BORDER_RADIUS_PX !== undefined) {
    isValid = isPositiveNumber(theme.REACTION_BORDER_RADIUS_PX, `config.themes.${themeName}.REACTION_BORDER_RADIUS_PX`) && isValid;
  }
  
  if (theme.REACTION_OFFSET_X_PX !== undefined) {
    isValid = typeof theme.REACTION_OFFSET_X_PX === 'number' && isValid;
  }
  
  if (theme.REACTION_OFFSET_Y_PX !== undefined) {
    isValid = typeof theme.REACTION_OFFSET_Y_PX === 'number' && isValid;
  }
  
  // Validate chart styles
  if (theme.CHART_STYLES !== undefined) {
    isValid = validateChartStyles(theme.CHART_STYLES, themeName) && isValid;
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
  
  // Validate activeTheme
  if (!isNonEmptyString(config.activeTheme, 'config.activeTheme')) {
    isValid = false;
  } else if (config.themes && !config.themes[config.activeTheme]) {
    console.error(`Configuration error: activeTheme "${config.activeTheme}" does not exist in config.themes`);
    isValid = false;
  }
  
  // Validate themes
  if (!validateObjectWithProps(config.themes, 'config.themes', ['ios'])) {
    isValid = false;
  } else {
    // Validate each theme
    for (const [themeName, theme] of Object.entries(config.themes)) {
      isValid = validateTheme(theme, themeName) && isValid;
    }
  }
  
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
  
  // Validate cache object
  const cacheProps = ['WEATHER_CACHE_TTL_MS', 'GITHUB_CACHE_TTL_MS'];
  if (!validateObjectWithProps(config.cache, 'config.cache', cacheProps)) {
    isValid = false;
  } else {
    // Validate cache properties
    isValid = isPositiveNumber(config.cache.WEATHER_CACHE_TTL_MS, 'config.cache.WEATHER_CACHE_TTL_MS') && isValid;
    isValid = isPositiveNumber(config.cache.GITHUB_CACHE_TTL_MS, 'config.cache.GITHUB_CACHE_TTL_MS') && isValid;
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
  const layoutProps = ['FONT_SIZE_PX', 'LINE_HEIGHT_PX', 'CHAT_WIDTH_PX', 'CHAT_HEIGHT_PX', 'STATUS_INDICATOR'];
  if (!validateObjectWithProps(config.layout, 'config.layout', layoutProps)) {
    isValid = false;
  } else {
    // Validate layout properties
    isValid = isPositiveNumber(config.layout.FONT_SIZE_PX, 'config.layout.FONT_SIZE_PX') && isValid;
    isValid = isPositiveNumber(config.layout.LINE_HEIGHT_PX, 'config.layout.LINE_HEIGHT_PX') && isValid;
    isValid = isPositiveNumber(config.layout.CHAT_WIDTH_PX, 'config.layout.CHAT_WIDTH_PX') && isValid;
    isValid = isPositiveNumber(config.layout.CHAT_HEIGHT_PX, 'config.layout.CHAT_HEIGHT_PX') && isValid;
    
    // Validate STATUS_INDICATOR object
    const statusIndicatorProps = ['DELIVERED_TEXT', 'READ_TEXT', 'FONT_SIZE_PX', 'COLOR_ME', 'OFFSET_Y_PX', 'ANIMATION_DELAY_SEC', 'FADE_IN_DURATION_SEC', 'READ_DELAY_SEC', 'READ_TRANSITION_SEC'];
    if (!validateObjectWithProps(config.layout.STATUS_INDICATOR, 'config.layout.STATUS_INDICATOR', statusIndicatorProps)) {
      isValid = false;
    } else {
      // Validate status indicator properties
      isValid = isNonEmptyString(config.layout.STATUS_INDICATOR.DELIVERED_TEXT, 'config.layout.STATUS_INDICATOR.DELIVERED_TEXT') && isValid;
      isValid = isNonEmptyString(config.layout.STATUS_INDICATOR.READ_TEXT, 'config.layout.STATUS_INDICATOR.READ_TEXT') && isValid;
      isValid = isPositiveNumber(config.layout.STATUS_INDICATOR.FONT_SIZE_PX, 'config.layout.STATUS_INDICATOR.FONT_SIZE_PX') && isValid;
      isValid = isValidHexColor(config.layout.STATUS_INDICATOR.COLOR_ME, 'config.layout.STATUS_INDICATOR.COLOR_ME') && isValid;
      isValid = isPositiveNumber(config.layout.STATUS_INDICATOR.OFFSET_Y_PX, 'config.layout.STATUS_INDICATOR.OFFSET_Y_PX') && isValid;
      isValid = isPositiveNumber(config.layout.STATUS_INDICATOR.ANIMATION_DELAY_SEC, 'config.layout.STATUS_INDICATOR.ANIMATION_DELAY_SEC') && isValid;
      isValid = isPositiveNumber(config.layout.STATUS_INDICATOR.FADE_IN_DURATION_SEC, 'config.layout.STATUS_INDICATOR.FADE_IN_DURATION_SEC') && isValid;
      isValid = isPositiveNumber(config.layout.STATUS_INDICATOR.READ_DELAY_SEC, 'config.layout.STATUS_INDICATOR.READ_DELAY_SEC') && isValid;
      isValid = isPositiveNumber(config.layout.STATUS_INDICATOR.READ_TRANSITION_SEC, 'config.layout.STATUS_INDICATOR.READ_TRANSITION_SEC') && isValid;
    }
    
    // Validate TIMING object (essential properties only)
    if (config.layout.TIMING) {
      isValid = (typeof config.layout.TIMING === 'object') && isValid;
      if (config.layout.TIMING.MIN_READING_TIME_MS !== undefined) {
        isValid = isPositiveNumber(config.layout.TIMING.MIN_READING_TIME_MS, 'config.layout.TIMING.MIN_READING_TIME_MS') && isValid;
      }
    }
    
    // Validate ANIMATION object including reaction and chart animation properties
    if (config.layout.ANIMATION) {
      isValid = (typeof config.layout.ANIMATION === 'object') && isValid;
      
      if (config.layout.ANIMATION.BUBBLE_ANIMATION_DURATION !== undefined) {
        isValid = isPositiveNumber(config.layout.ANIMATION.BUBBLE_ANIMATION_DURATION, 'config.layout.ANIMATION.BUBBLE_ANIMATION_DURATION') && isValid;
      }
      
      // Validate reaction animation properties
      if (config.layout.ANIMATION.REACTION_ANIMATION_DURATION_SEC !== undefined) {
        isValid = isPositiveNumber(config.layout.ANIMATION.REACTION_ANIMATION_DURATION_SEC, 'config.layout.ANIMATION.REACTION_ANIMATION_DURATION_SEC') && isValid;
      }
      
      if (config.layout.ANIMATION.REACTION_ANIMATION_DELAY_FACTOR_SEC !== undefined) {
        isValid = isPositiveNumber(config.layout.ANIMATION.REACTION_ANIMATION_DELAY_FACTOR_SEC, 'config.layout.ANIMATION.REACTION_ANIMATION_DELAY_FACTOR_SEC') && isValid;
      }
      
      // Validate chart animation properties
      if (config.layout.ANIMATION.CHART_BAR_ANIMATION_DURATION_SEC !== undefined) {
        isValid = isPositiveNumber(config.layout.ANIMATION.CHART_BAR_ANIMATION_DURATION_SEC, 'config.layout.ANIMATION.CHART_BAR_ANIMATION_DURATION_SEC') && isValid;
      }
      
      if (config.layout.ANIMATION.CHART_ANIMATION_DELAY_SEC !== undefined) {
        isValid = isNonNegativeNumber(config.layout.ANIMATION.CHART_ANIMATION_DELAY_SEC, 'config.layout.ANIMATION.CHART_ANIMATION_DELAY_SEC') && isValid;
      }
      
      // Validate scroll animation parameters
      if (config.layout.ANIMATION.SCROLL_DELAY_BUFFER_SEC !== undefined) {
        isValid = isPositiveNumber(config.layout.ANIMATION.SCROLL_DELAY_BUFFER_SEC, 'config.layout.ANIMATION.SCROLL_DELAY_BUFFER_SEC') && isValid;
      }
      if (config.layout.ANIMATION.MIN_SCROLL_DURATION_SEC !== undefined) {
        isValid = isPositiveNumber(config.layout.ANIMATION.MIN_SCROLL_DURATION_SEC, 'config.layout.ANIMATION.MIN_SCROLL_DURATION_SEC') && isValid;
      }
      if (config.layout.ANIMATION.SCROLL_PIXELS_PER_SEC !== undefined) {
        isValid = isPositiveNumber(config.layout.ANIMATION.SCROLL_PIXELS_PER_SEC, 'config.layout.ANIMATION.SCROLL_PIXELS_PER_SEC') && isValid;
      }
    }
  }
  
  return isValid;
}