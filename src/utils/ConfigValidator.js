/**
 * ConfigValidator.js
 * Validates the application configuration to ensure all required properties exist and have correct types.
 * Single Responsibility: Configuration validation.
 */

// ... (all helper functions: isNonEmptyString, isString, ... , validateObjectWithProps, validateAvatarsConfig) ...
// (Keep these exactly as they were in your last confirmed version)
function isNonEmptyString(value, propertyPath) {
  if (typeof value !== 'string') {
    console.error(`Configuration error: ${propertyPath} must be a string, got ${typeof value}.`);
    return false;
  }
  if (value.trim() === '') {
    console.error(`Configuration error: ${propertyPath} cannot be an empty string.`);
    return false;
  }
  return true;
}
function isString(value, propertyPath) {
  if (typeof value !== 'string') {
    console.error(`Configuration error: ${propertyPath} must be a string, got ${typeof value}.`);
    return false;
  }
  return true;
}
function isPositiveNumber(value, propertyPath) {
  if (typeof value !== 'number' || isNaN(value)) {
    console.error(`Configuration error: ${propertyPath} must be a number, got ${typeof value}.`);
    return false;
  }
  if (value <= 0) {
    console.error(`Configuration error: ${propertyPath} must be a positive number, got ${value}.`);
    return false;
  }
  return true;
}
function isNonNegativeNumber(value, propertyPath) {
  if (typeof value !== 'number' || isNaN(value)) {
    console.error(`Configuration error: ${propertyPath} must be a number, got ${typeof value}.`);
    return false;
  }
  if (value < 0) {
    console.error(`Configuration error: ${propertyPath} must be a non-negative number, got ${value}.`);
    return false;
  }
  return true;
}
function isNumber(value, propertyPath) {
  if (typeof value !== 'number' || isNaN(value)) {
    console.error(`Configuration error: ${propertyPath} must be a number, got ${typeof value}.`);
    return false;
  }
  return true;
}
function isBoolean(value, propertyPath) {
  if (typeof value !== 'boolean') {
    console.error(`Configuration error: ${propertyPath} must be a boolean, got ${typeof value}.`);
    return false;
  }
  return true;
}
function isOpacityValue(value, propertyPath) {
  if (typeof value !== 'number' || isNaN(value)) {
    console.error(`Configuration error: ${propertyPath} must be a number, got ${typeof value}.`);
    return false;
  }
  if (value < 0 || value > 1) {
    console.error(`Configuration error: ${propertyPath} must be between 0 and 1, got ${value}.`);
    return false;
  }
  return true;
}
function isValidDate(value, propertyPath) {
  if (!(value instanceof Date)) {
    console.error(`Configuration error: ${propertyPath} must be a Date object.`);
    return false;
  }
  if (isNaN(value.getTime())) {
    console.error(`Configuration error: ${propertyPath} must be a valid Date, but it's invalid.`);
    return false;
  }
  return true;
}
function isStringRepresentingNumber(value, propertyPath) {
  if (!isNonEmptyString(value, propertyPath)) {
    return false;
  }
  if (isNaN(Number(value))) {
    console.error(`Configuration error: ${propertyPath} must be a string representing a number, got '${value}'.`);
    return false;
  }
  return true;
}
function isValidHexColor(value, propertyPath) {
  if (typeof value !== 'string') { 
    console.error(`Configuration error: ${propertyPath} must be a string, got ${typeof value}.`);
    return false;
  }
  if (value === "") return true; 

  const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
  if (!hexColorRegex.test(value)) {
    console.error(`Configuration error: ${propertyPath} must be a valid hex color string (e.g., #RGB, #RRGGBB), got '${value}'.`);
    return false;
  }
  return true;
}
function isOneOf(value, propertyPath, allowedValues) {
  if (!allowedValues.includes(value)) {
    console.error(`Configuration error: ${propertyPath} must be one of: ${allowedValues.join(', ')}, got '${value}'.`);
    return false;
  }
  return true;
}
function validateObjectWithProps(obj, objPath, requiredProps) {
  if (!obj || typeof obj !== 'object' || obj === null) {
    console.error(`Configuration error: ${objPath} must be an object.`);
    return false;
  }
  let isValid = true;
  for (const prop of requiredProps) {
    if (obj[prop] === undefined) {
      console.error(`Configuration error: Missing required property ${objPath}.${prop}.`);
      isValid = false;
    }
  }
  return isValid;
}
function validateAvatarsConfig(avatarsConfig, pathPrefix = 'config.avatars') {
  if (!validateObjectWithProps(avatarsConfig, pathPrefix, ['enabled', 'me', 'visitor', 'sizePx', 'shape', 'xOffsetPx', 'yOffsetPx'])) return false;
  let isValid = true;
  isValid = isBoolean(avatarsConfig.enabled, `${pathPrefix}.enabled`) && isValid;
  if (validateObjectWithProps(avatarsConfig.me, `${pathPrefix}.me`, ['imageUrl', 'fallbackText'])) {
    isValid = isString(avatarsConfig.me.imageUrl, `${pathPrefix}.me.imageUrl`) && isValid; // isString allows empty
    isValid = isNonEmptyString(avatarsConfig.me.fallbackText, `${pathPrefix}.me.fallbackText`) && isValid;
  } else { isValid = false; }
  if (validateObjectWithProps(avatarsConfig.visitor, `${pathPrefix}.visitor`, ['imageUrl', 'fallbackText'])) {
    isValid = isString(avatarsConfig.visitor.imageUrl, `${pathPrefix}.visitor.imageUrl`) && isValid; // isString allows empty
    isValid = isNonEmptyString(avatarsConfig.visitor.fallbackText, `${pathPrefix}.visitor.fallbackText`) && isValid;
  } else { isValid = false; }
  isValid = isPositiveNumber(avatarsConfig.sizePx, `${pathPrefix}.sizePx`) && isValid;
  isValid = isOneOf(avatarsConfig.shape, `${pathPrefix}.shape`, ['circle', 'square']) && isValid;
  isValid = isNonNegativeNumber(avatarsConfig.xOffsetPx, `${pathPrefix}.xOffsetPx`) && isValid;
  isValid = isNumber(avatarsConfig.yOffsetPx, `${pathPrefix}.yOffsetPx`) && isValid;
  return isValid;
}

function validateChartStyles(chartStyles, themeName) {
  const basePath = `config.themes.${themeName}.CHART_STYLES`;
  const requiredProps = [
    'BAR_DEFAULT_COLOR', 'BAR_TRACK_COLOR', 'BAR_CORNER_RADIUS_PX', 'VALUE_TEXT_INSIDE_COLOR', 
    'BAR_HEIGHT_PX', 'BAR_SPACING_PX', 'LABEL_FONT_FAMILY', 'LABEL_FONT_SIZE_PX', 
    'VALUE_TEXT_FONT_FAMILY', 'VALUE_TEXT_FONT_SIZE_PX', 
    'TITLE_FONT_FAMILY', 'TITLE_FONT_SIZE_PX', 'TITLE_LINE_HEIGHT_MULTIPLIER', 
    'TITLE_BOTTOM_MARGIN_PX', 'CHART_PADDING_X_PX', 'CHART_PADDING_Y_PX', 
    'AXIS_LINE_COLOR', 'GRID_LINE_COLOR',
    // Sender-specific colors
    'ME_TITLE_COLOR', 'ME_LABEL_COLOR', 'ME_VALUE_TEXT_COLOR',
    'VISITOR_TITLE_COLOR', 'VISITOR_LABEL_COLOR', 'VISITOR_VALUE_TEXT_COLOR',
    // Donut chart specific styles
    'DONUT_STROKE_WIDTH_PX', 'DONUT_CENTER_TEXT_FONT_SIZE_PX', 'DONUT_CENTER_TEXT_FONT_FAMILY',
    'ME_DONUT_CENTER_TEXT_COLOR', 'VISITOR_DONUT_CENTER_TEXT_COLOR',
    'ME_DONUT_LEGEND_TEXT_COLOR', 'VISITOR_DONUT_LEGEND_TEXT_COLOR',
    'DONUT_LEGEND_FONT_SIZE_PX', 'DONUT_LEGEND_ITEM_SPACING_PX', 'DONUT_LEGEND_MARKER_SIZE_PX',
    'DONUT_ANIMATION_DURATION_SEC', 'DONUT_SEGMENT_ANIMATION_DELAY_SEC'
  ];

  if (!validateObjectWithProps(chartStyles, basePath, requiredProps)) return false;
  
  let isValid = true;
  isValid = isValidHexColor(chartStyles.BAR_DEFAULT_COLOR, `${basePath}.BAR_DEFAULT_COLOR`) && isValid;
  isValid = isValidHexColor(chartStyles.BAR_TRACK_COLOR, `${basePath}.BAR_TRACK_COLOR`) && isValid;
  isValid = isNonNegativeNumber(chartStyles.BAR_CORNER_RADIUS_PX, `${basePath}.BAR_CORNER_RADIUS_PX`) && isValid;
  isValid = isValidHexColor(chartStyles.VALUE_TEXT_INSIDE_COLOR, `${basePath}.VALUE_TEXT_INSIDE_COLOR`) && isValid;
  isValid = isPositiveNumber(chartStyles.BAR_HEIGHT_PX, `${basePath}.BAR_HEIGHT_PX`) && isValid;
  isValid = isNonNegativeNumber(chartStyles.BAR_SPACING_PX, `${basePath}.BAR_SPACING_PX`) && isValid;
  isValid = isNonEmptyString(chartStyles.LABEL_FONT_FAMILY, `${basePath}.LABEL_FONT_FAMILY`) && isValid;
  isValid = isPositiveNumber(chartStyles.LABEL_FONT_SIZE_PX, `${basePath}.LABEL_FONT_SIZE_PX`) && isValid;
  // LABEL_COLOR removed, now sender specific
  if (chartStyles.LABEL_MAX_WIDTH_PX !== undefined) { // Making it optional for validation
    isValid = isPositiveNumber(chartStyles.LABEL_MAX_WIDTH_PX, `${basePath}.LABEL_MAX_WIDTH_PX`) && isValid;
  }
  isValid = isNonEmptyString(chartStyles.VALUE_TEXT_FONT_FAMILY, `${basePath}.VALUE_TEXT_FONT_FAMILY`) && isValid;
  isValid = isPositiveNumber(chartStyles.VALUE_TEXT_FONT_SIZE_PX, `${basePath}.VALUE_TEXT_FONT_SIZE_PX`) && isValid;
  // VALUE_TEXT_COLOR removed, now sender specific
  isValid = isNonEmptyString(chartStyles.TITLE_FONT_FAMILY, `${basePath}.TITLE_FONT_FAMILY`) && isValid;
  isValid = isPositiveNumber(chartStyles.TITLE_FONT_SIZE_PX, `${basePath}.TITLE_FONT_SIZE_PX`) && isValid;
  isValid = isPositiveNumber(chartStyles.TITLE_LINE_HEIGHT_MULTIPLIER, `${basePath}.TITLE_LINE_HEIGHT_MULTIPLIER`) && isValid;
  // TITLE_COLOR removed, now sender specific
  isValid = isNonNegativeNumber(chartStyles.TITLE_BOTTOM_MARGIN_PX, `${basePath}.TITLE_BOTTOM_MARGIN_PX`) && isValid;
  isValid = isNonNegativeNumber(chartStyles.CHART_PADDING_X_PX, `${basePath}.CHART_PADDING_X_PX`) && isValid;
  isValid = isNonNegativeNumber(chartStyles.CHART_PADDING_Y_PX, `${basePath}.CHART_PADDING_Y_PX`) && isValid;
  isValid = isValidHexColor(chartStyles.AXIS_LINE_COLOR, `${basePath}.AXIS_LINE_COLOR`) && isValid;
  isValid = isValidHexColor(chartStyles.GRID_LINE_COLOR, `${basePath}.GRID_LINE_COLOR`) && isValid;

  // Validate new sender-specific colors
  isValid = isValidHexColor(chartStyles.ME_TITLE_COLOR, `${basePath}.ME_TITLE_COLOR`) && isValid;
  isValid = isValidHexColor(chartStyles.ME_LABEL_COLOR, `${basePath}.ME_LABEL_COLOR`) && isValid;
  isValid = isValidHexColor(chartStyles.ME_VALUE_TEXT_COLOR, `${basePath}.ME_VALUE_TEXT_COLOR`) && isValid;
  isValid = isValidHexColor(chartStyles.VISITOR_TITLE_COLOR, `${basePath}.VISITOR_TITLE_COLOR`) && isValid;
  isValid = isValidHexColor(chartStyles.VISITOR_LABEL_COLOR, `${basePath}.VISITOR_LABEL_COLOR`) && isValid;
  isValid = isValidHexColor(chartStyles.VISITOR_VALUE_TEXT_COLOR, `${basePath}.VISITOR_VALUE_TEXT_COLOR`) && isValid;
  isValid = isPositiveNumber(chartStyles.DONUT_STROKE_WIDTH_PX, `${basePath}.DONUT_STROKE_WIDTH_PX`) && isValid;
  isValid = isPositiveNumber(chartStyles.DONUT_CENTER_TEXT_FONT_SIZE_PX, `${basePath}.DONUT_CENTER_TEXT_FONT_SIZE_PX`) && isValid;
  isValid = isNonEmptyString(chartStyles.DONUT_CENTER_TEXT_FONT_FAMILY, `${basePath}.DONUT_CENTER_TEXT_FONT_FAMILY`) && isValid;
  isValid = isValidHexColor(chartStyles.ME_DONUT_CENTER_TEXT_COLOR, `${basePath}.ME_DONUT_CENTER_TEXT_COLOR`) && isValid;
  isValid = isValidHexColor(chartStyles.VISITOR_DONUT_CENTER_TEXT_COLOR, `${basePath}.VISITOR_DONUT_CENTER_TEXT_COLOR`) && isValid;
  isValid = isValidHexColor(chartStyles.ME_DONUT_LEGEND_TEXT_COLOR, `${basePath}.ME_DONUT_LEGEND_TEXT_COLOR`) && isValid;
  isValid = isValidHexColor(chartStyles.VISITOR_DONUT_LEGEND_TEXT_COLOR, `${basePath}.VISITOR_DONUT_LEGEND_TEXT_COLOR`) && isValid;
  isValid = isPositiveNumber(chartStyles.DONUT_LEGEND_FONT_SIZE_PX, `${basePath}.DONUT_LEGEND_FONT_SIZE_PX`) && isValid;
  isValid = isPositiveNumber(chartStyles.DONUT_LEGEND_ITEM_SPACING_PX, `${basePath}.DONUT_LEGEND_ITEM_SPACING_PX`) && isValid;
  isValid = isPositiveNumber(chartStyles.DONUT_LEGEND_MARKER_SIZE_PX, `${basePath}.DONUT_LEGEND_MARKER_SIZE_PX`) && isValid;
  isValid = isPositiveNumber(chartStyles.DONUT_ANIMATION_DURATION_SEC, `${basePath}.DONUT_ANIMATION_DURATION_SEC`) && isValid;
  isValid = isNonNegativeNumber(chartStyles.DONUT_SEGMENT_ANIMATION_DELAY_SEC, `${basePath}.DONUT_SEGMENT_ANIMATION_DELAY_SEC`) && isValid;

  return isValid;
}

// ... (validateTheme, validateProfileConfig, validateCacheConfig, validateApiDefaultsConfig, validateWakatimeConfig, validateLayoutConfig)
// These should remain largely the same as your last confirmed version, 
// ensure validateTheme calls the updated validateChartStyles.
function validateTheme(theme, themeName) {
  const basePath = `config.themes.${themeName}`;
  const requiredProps = [
    'ME_BUBBLE_COLOR', 'VISITOR_BUBBLE_COLOR', 'ME_TEXT_COLOR', 'VISITOR_TEXT_COLOR', 'BACKGROUND_LIGHT', 
    'BACKGROUND_DARK', 'BUBBLE_RADIUS_PX', 'FONT_FAMILY', 'REACTION_FONT_SIZE_PX', 'REACTION_BG_COLOR', 
    'REACTION_BG_OPACITY', 'REACTION_TEXT_COLOR', 'REACTION_PADDING_X_PX', 'REACTION_PADDING_Y_PX', 
    'REACTION_BORDER_RADIUS_PX', 'REACTION_OFFSET_X_PX', 'REACTION_OFFSET_Y_PX', 'CHART_STYLES'
  ];
  if (!validateObjectWithProps(theme, basePath, requiredProps)) return false;

  let isValid = true;
  isValid = isValidHexColor(theme.ME_BUBBLE_COLOR, `${basePath}.ME_BUBBLE_COLOR`) && isValid;
  isValid = isValidHexColor(theme.VISITOR_BUBBLE_COLOR, `${basePath}.VISITOR_BUBBLE_COLOR`) && isValid;
  isValid = isValidHexColor(theme.ME_TEXT_COLOR, `${basePath}.ME_TEXT_COLOR`) && isValid;
  isValid = isValidHexColor(theme.VISITOR_TEXT_COLOR, `${basePath}.VISITOR_TEXT_COLOR`) && isValid;
  isValid = isValidHexColor(theme.BACKGROUND_LIGHT, `${basePath}.BACKGROUND_LIGHT`) && isValid;
  isValid = isValidHexColor(theme.BACKGROUND_DARK, `${basePath}.BACKGROUND_DARK`) && isValid;
  isValid = isPositiveNumber(theme.BUBBLE_RADIUS_PX, `${basePath}.BUBBLE_RADIUS_PX`) && isValid;
  isValid = isNonEmptyString(theme.FONT_FAMILY, `${basePath}.FONT_FAMILY`) && isValid;
  isValid = isPositiveNumber(theme.REACTION_FONT_SIZE_PX, `${basePath}.REACTION_FONT_SIZE_PX`) && isValid;
  isValid = isValidHexColor(theme.REACTION_BG_COLOR, `${basePath}.REACTION_BG_COLOR`) && isValid;
  isValid = isOpacityValue(theme.REACTION_BG_OPACITY, `${basePath}.REACTION_BG_OPACITY`) && isValid;
  isValid = isValidHexColor(theme.REACTION_TEXT_COLOR, `${basePath}.REACTION_TEXT_COLOR`) && isValid;
  isValid = isPositiveNumber(theme.REACTION_PADDING_X_PX, `${basePath}.REACTION_PADDING_X_PX`) && isValid;
  isValid = isPositiveNumber(theme.REACTION_PADDING_Y_PX, `${basePath}.REACTION_PADDING_Y_PX`) && isValid;
  isValid = isPositiveNumber(theme.REACTION_BORDER_RADIUS_PX, `${basePath}.REACTION_BORDER_RADIUS_PX`) && isValid;
  isValid = isNumber(theme.REACTION_OFFSET_X_PX, `${basePath}.REACTION_OFFSET_X_PX`) && isValid;
  isValid = isNumber(theme.REACTION_OFFSET_Y_PX, `${basePath}.REACTION_OFFSET_Y_PX`) && isValid;
  isValid = validateChartStyles(theme.CHART_STYLES, themeName) && isValid; // This call is important
  return isValid;
}

function validateProfileConfig(profileConfig, pathPrefix = 'config.profile') {
  const requiredProps = ['NAME', 'PROFESSION', 'LOCATION', 'COMPANY', 'CURRENT_PROJECT', 'WORK_START_DATE', 'GITHUB_USERNAME', 'WAKATIME_USERNAME', 'TWITTER_USERNAME'];
  if (!validateObjectWithProps(profileConfig, pathPrefix, requiredProps)) return false;
  let isValid = true;
  isValid = isNonEmptyString(profileConfig.NAME, `${pathPrefix}.NAME`) && isValid;
  isValid = isNonEmptyString(profileConfig.PROFESSION, `${pathPrefix}.PROFESSION`) && isValid;
  isValid = isNonEmptyString(profileConfig.LOCATION, `${pathPrefix}.LOCATION`) && isValid;
  isValid = isNonEmptyString(profileConfig.COMPANY, `${pathPrefix}.COMPANY`) && isValid;
  isValid = isNonEmptyString(profileConfig.CURRENT_PROJECT, `${pathPrefix}.CURRENT_PROJECT`) && isValid;
  isValid = isValidDate(profileConfig.WORK_START_DATE, `${pathPrefix}.WORK_START_DATE`) && isValid;
  isValid = isNonEmptyString(profileConfig.GITHUB_USERNAME, `${pathPrefix}.GITHUB_USERNAME`) && isValid;
  isValid = isNonEmptyString(profileConfig.WAKATIME_USERNAME, `${pathPrefix}.WAKATIME_USERNAME`) && isValid;
  isValid = isNonEmptyString(profileConfig.TWITTER_USERNAME, `${pathPrefix}.TWITTER_USERNAME`) && isValid;
  return isValid;
}

function validateCacheConfig(cacheConfig, pathPrefix = 'config.cache') {
  const requiredProps = ['WEATHER_CACHE_TTL_MS', 'GITHUB_CACHE_TTL_MS', 'TWITTER_CACHE_TTL_MS'];
  if (!validateObjectWithProps(cacheConfig, pathPrefix, requiredProps)) return false;
  let isValid = true;
  isValid = isPositiveNumber(cacheConfig.WEATHER_CACHE_TTL_MS, `${pathPrefix}.WEATHER_CACHE_TTL_MS`) && isValid;
  isValid = isPositiveNumber(cacheConfig.GITHUB_CACHE_TTL_MS, `${pathPrefix}.GITHUB_CACHE_TTL_MS`) && isValid;
  isValid = isPositiveNumber(cacheConfig.TWITTER_CACHE_TTL_MS, `${pathPrefix}.TWITTER_CACHE_TTL_MS`) && isValid;
  return isValid;
}

function validateApiDefaultsConfig(apiDefaultsConfig, pathPrefix = 'config.apiDefaults') {
  const requiredProps = ['TEMPERATURE', 'WEATHER_DESCRIPTION', 'WEATHER_EMOJI', 'GITHUB_PUBLIC_REPOS', 'GITHUB_FOLLOWERS', 'TWITTER_FOLLOWERS'];
  if (!validateObjectWithProps(apiDefaultsConfig, pathPrefix, requiredProps)) return false;
  let isValid = true;
  isValid = isNonEmptyString(apiDefaultsConfig.TEMPERATURE, `${pathPrefix}.TEMPERATURE`) && isValid;
  isValid = isNonEmptyString(apiDefaultsConfig.WEATHER_DESCRIPTION, `${pathPrefix}.WEATHER_DESCRIPTION`) && isValid;
  isValid = isNonEmptyString(apiDefaultsConfig.WEATHER_EMOJI, `${pathPrefix}.WEATHER_EMOJI`) && isValid;
  isValid = isStringRepresentingNumber(apiDefaultsConfig.GITHUB_PUBLIC_REPOS, `${pathPrefix}.GITHUB_PUBLIC_REPOS`) && isValid;
  isValid = isStringRepresentingNumber(apiDefaultsConfig.GITHUB_FOLLOWERS, `${pathPrefix}.GITHUB_FOLLOWERS`) && isValid;
  isValid = isStringRepresentingNumber(apiDefaultsConfig.TWITTER_FOLLOWERS, `${pathPrefix}.TWITTER_FOLLOWERS`) && isValid;
  return isValid;
}

function validateWakatimeConfig(wakatimeConfig, pathPrefix = 'config.wakatime') {
    const requiredProps = ['enabled', 'defaults', 'cacheTtlMs'];
    if (!validateObjectWithProps(wakatimeConfig, pathPrefix, requiredProps)) return false;
    let isValid = true;
    isValid = isBoolean(wakatimeConfig.enabled, `${pathPrefix}.enabled`) && isValid;
    isValid = isPositiveNumber(wakatimeConfig.cacheTtlMs, `${pathPrefix}.cacheTtlMs`) && isValid;
    const defaultProps = ['wakatime_summary', 'wakatime_top_language', 'wakatime_top_language_percent'];
    if (!validateObjectWithProps(wakatimeConfig.defaults, `${pathPrefix}.defaults`, defaultProps)) {
        isValid = false;
    } else {
        isValid = isNonEmptyString(wakatimeConfig.defaults.wakatime_summary, `${pathPrefix}.defaults.wakatime_summary`) && isValid;
        isValid = isNonEmptyString(wakatimeConfig.defaults.wakatime_top_language, `${pathPrefix}.defaults.wakatime_top_language`) && isValid;
        isValid = isStringRepresentingNumber(wakatimeConfig.defaults.wakatime_top_language_percent, `${pathPrefix}.defaults.wakatime_top_language_percent`) && isValid;
    }
    return isValid;
}

function validateLayoutConfig(layoutConfig, pathPrefix = 'config.layout') {
    const requiredProps = ['FONT_SIZE_PX', 'LINE_HEIGHT_PX', 'CHAT_WIDTH_PX', 'CHAT_HEIGHT_PX', 'STATUS_INDICATOR', 'TIMING', 'ANIMATION',
                           'BUBBLE_PAD_X_PX', 'BUBBLE_PAD_Y_PX', 'MIN_BUBBLE_W_PX', 'MAX_BUBBLE_W_PX', 'BUBBLE_TAIL_HEIGHT_PX',
                           'BUBBLE_TAIL_WIDTH_PX', 'BUBBLE_TAIL_EXT_WIDTH_PX', 'BUBBLE_TAIL_RADIUS_X', 'BUBBLE_TAIL_RADIUS_Y',
                           'TYPING_DOT_RADIUS_PX', 'TYPING_CHAR_MS', 'TYPING_MIN_MS', 'TYPING_MAX_MS', 'VISIBLE_MESSAGES'];
    if (!validateObjectWithProps(layoutConfig, pathPrefix, requiredProps)) return false;
    
    let isValid = true;
    isValid = isPositiveNumber(layoutConfig.FONT_SIZE_PX, `${pathPrefix}.FONT_SIZE_PX`) && isValid;
    isValid = isPositiveNumber(layoutConfig.LINE_HEIGHT_PX, `${pathPrefix}.LINE_HEIGHT_PX`) && isValid;
    isValid = isPositiveNumber(layoutConfig.CHAT_WIDTH_PX, `${pathPrefix}.CHAT_WIDTH_PX`) && isValid;
    isValid = isPositiveNumber(layoutConfig.CHAT_HEIGHT_PX, `${pathPrefix}.CHAT_HEIGHT_PX`) && isValid;
    isValid = isPositiveNumber(layoutConfig.BUBBLE_PAD_X_PX, `${pathPrefix}.BUBBLE_PAD_X_PX`) && isValid;
    isValid = isPositiveNumber(layoutConfig.BUBBLE_PAD_Y_PX, `${pathPrefix}.BUBBLE_PAD_Y_PX`) && isValid;
    isValid = isPositiveNumber(layoutConfig.MIN_BUBBLE_W_PX, `${pathPrefix}.MIN_BUBBLE_W_PX`) && isValid;
    isValid = isPositiveNumber(layoutConfig.MAX_BUBBLE_W_PX, `${pathPrefix}.MAX_BUBBLE_W_PX`) && isValid;
    isValid = isPositiveNumber(layoutConfig.BUBBLE_TAIL_HEIGHT_PX, `${pathPrefix}.BUBBLE_TAIL_HEIGHT_PX`) && isValid;
    isValid = isPositiveNumber(layoutConfig.BUBBLE_TAIL_WIDTH_PX, `${pathPrefix}.BUBBLE_TAIL_WIDTH_PX`) && isValid;
    isValid = isPositiveNumber(layoutConfig.BUBBLE_TAIL_EXT_WIDTH_PX, `${pathPrefix}.BUBBLE_TAIL_EXT_WIDTH_PX`) && isValid;
    isValid = isPositiveNumber(layoutConfig.BUBBLE_TAIL_RADIUS_X, `${pathPrefix}.BUBBLE_TAIL_RADIUS_X`) && isValid;
    isValid = isPositiveNumber(layoutConfig.BUBBLE_TAIL_RADIUS_Y, `${pathPrefix}.BUBBLE_TAIL_RADIUS_Y`) && isValid;
    isValid = isPositiveNumber(layoutConfig.TYPING_DOT_RADIUS_PX, `${pathPrefix}.TYPING_DOT_RADIUS_PX`) && isValid;
    isValid = isPositiveNumber(layoutConfig.TYPING_CHAR_MS, `${pathPrefix}.TYPING_CHAR_MS`) && isValid;
    isValid = isPositiveNumber(layoutConfig.TYPING_MIN_MS, `${pathPrefix}.TYPING_MIN_MS`) && isValid;
    isValid = isPositiveNumber(layoutConfig.TYPING_MAX_MS, `${pathPrefix}.TYPING_MAX_MS`) && isValid;
    isValid = isPositiveNumber(layoutConfig.VISIBLE_MESSAGES, `${pathPrefix}.VISIBLE_MESSAGES`) && isValid;

    const statusPath = `${pathPrefix}.STATUS_INDICATOR`;
    const statusProps = ['DELIVERED_TEXT', 'READ_TEXT', 'FONT_SIZE_PX', 'COLOR_ME', 'OFFSET_Y_PX', 'ANIMATION_DELAY_SEC', 'FADE_IN_DURATION_SEC', 'READ_DELAY_SEC', 'READ_TRANSITION_SEC'];
    if (!validateObjectWithProps(layoutConfig.STATUS_INDICATOR, statusPath, statusProps)) {
        isValid = false;
    } else {
        isValid = isNonEmptyString(layoutConfig.STATUS_INDICATOR.DELIVERED_TEXT, `${statusPath}.DELIVERED_TEXT`) && isValid;
        isValid = isNonEmptyString(layoutConfig.STATUS_INDICATOR.READ_TEXT, `${statusPath}.READ_TEXT`) && isValid;
        isValid = isPositiveNumber(layoutConfig.STATUS_INDICATOR.FONT_SIZE_PX, `${statusPath}.FONT_SIZE_PX`) && isValid;
        isValid = isValidHexColor(layoutConfig.STATUS_INDICATOR.COLOR_ME, `${statusPath}.COLOR_ME`) && isValid;
        isValid = isPositiveNumber(layoutConfig.STATUS_INDICATOR.OFFSET_Y_PX, `${statusPath}.OFFSET_Y_PX`) && isValid;
        isValid = isNonNegativeNumber(layoutConfig.STATUS_INDICATOR.ANIMATION_DELAY_SEC, `${statusPath}.ANIMATION_DELAY_SEC`) && isValid;
        isValid = isPositiveNumber(layoutConfig.STATUS_INDICATOR.FADE_IN_DURATION_SEC, `${statusPath}.FADE_IN_DURATION_SEC`) && isValid;
        isValid = isPositiveNumber(layoutConfig.STATUS_INDICATOR.READ_DELAY_SEC, `${statusPath}.READ_DELAY_SEC`) && isValid;
        isValid = isPositiveNumber(layoutConfig.STATUS_INDICATOR.READ_TRANSITION_SEC, `${statusPath}.READ_TRANSITION_SEC`) && isValid;
    }

    const timingPath = `${pathPrefix}.TIMING`;
    const timingProps = ['MIN_READING_TIME_MS', 'MS_PER_WORD', 'READING_RANDOMNESS_MS', 'SAME_SENDER_DELAY_MS', 'SENDER_CHANGE_DELAY_MS', 'MESSAGE_VERTICAL_SPACING', 'BOTTOM_MARGIN', 'ANIMATION_END_BUFFER_MS'];
    if(!validateObjectWithProps(layoutConfig.TIMING, timingPath, timingProps)) {
        isValid = false;
    } else {
        isValid = isPositiveNumber(layoutConfig.TIMING.MIN_READING_TIME_MS, `${timingPath}.MIN_READING_TIME_MS`) && isValid;
        isValid = isPositiveNumber(layoutConfig.TIMING.MS_PER_WORD, `${timingPath}.MS_PER_WORD`) && isValid;
        isValid = isNonNegativeNumber(layoutConfig.TIMING.READING_RANDOMNESS_MS, `${timingPath}.READING_RANDOMNESS_MS`) && isValid;
        isValid = isPositiveNumber(layoutConfig.TIMING.SAME_SENDER_DELAY_MS, `${timingPath}.SAME_SENDER_DELAY_MS`) && isValid;
        isValid = isPositiveNumber(layoutConfig.TIMING.SENDER_CHANGE_DELAY_MS, `${timingPath}.SENDER_CHANGE_DELAY_MS`) && isValid;
        isValid = isPositiveNumber(layoutConfig.TIMING.MESSAGE_VERTICAL_SPACING, `${timingPath}.MESSAGE_VERTICAL_SPACING`) && isValid;
        isValid = isPositiveNumber(layoutConfig.TIMING.BOTTOM_MARGIN, `${timingPath}.BOTTOM_MARGIN`) && isValid;
        isValid = isPositiveNumber(layoutConfig.TIMING.ANIMATION_END_BUFFER_MS, `${timingPath}.ANIMATION_END_BUFFER_MS`) && isValid;
    }

    const animPath = `${pathPrefix}.ANIMATION`;
    const animProps = ['TYPING_BUBBLE_WIDTH', 'TYPING_BUBBLE_HEIGHT', 'DOT_ANIMATION_DURATION', 'DOT_DELAY_2', 'DOT_DELAY_3', 'DOT_MIN_OPACITY', 'DOT_MAX_OPACITY', 'DOT_MIN_SCALE', 'DOT_MAX_SCALE', 'BUBBLE_ANIMATION_DURATION', 'BUBBLE_ANIMATION_CURVE', 'BUBBLE_START_SCALE', 'REACTION_ANIMATION_DURATION_SEC', 'REACTION_ANIMATION_DELAY_FACTOR_SEC', 'CHART_BAR_ANIMATION_DURATION_SEC', 'CHART_ANIMATION_DELAY_SEC', 'SHADOW_BLUR', 'SHADOW_OFFSET_X', 'SHADOW_OFFSET_Y', 'SHADOW_OPACITY', 'SCROLL_DELAY_BUFFER_SEC', 'MIN_SCROLL_DURATION_SEC', 'SCROLL_PIXELS_PER_SEC'];
    if(!validateObjectWithProps(layoutConfig.ANIMATION, animPath, animProps)) {
        isValid = false;
    } else {
        isValid = isPositiveNumber(layoutConfig.ANIMATION.TYPING_BUBBLE_WIDTH, `${animPath}.TYPING_BUBBLE_WIDTH`) && isValid;
        isValid = isPositiveNumber(layoutConfig.ANIMATION.TYPING_BUBBLE_HEIGHT, `${animPath}.TYPING_BUBBLE_HEIGHT`) && isValid;
        isValid = isPositiveNumber(layoutConfig.ANIMATION.DOT_ANIMATION_DURATION, `${animPath}.DOT_ANIMATION_DURATION`) && isValid;
        isValid = isNonNegativeNumber(layoutConfig.ANIMATION.DOT_DELAY_2, `${animPath}.DOT_DELAY_2`) && isValid;
        isValid = isNonNegativeNumber(layoutConfig.ANIMATION.DOT_DELAY_3, `${animPath}.DOT_DELAY_3`) && isValid;
        isValid = isOpacityValue(layoutConfig.ANIMATION.DOT_MIN_OPACITY, `${animPath}.DOT_MIN_OPACITY`) && isValid;
        isValid = isOpacityValue(layoutConfig.ANIMATION.DOT_MAX_OPACITY, `${animPath}.DOT_MAX_OPACITY`) && isValid;
        isValid = isPositiveNumber(layoutConfig.ANIMATION.DOT_MIN_SCALE, `${animPath}.DOT_MIN_SCALE`) && isValid;
        isValid = isPositiveNumber(layoutConfig.ANIMATION.DOT_MAX_SCALE, `${animPath}.DOT_MAX_SCALE`) && isValid;
        isValid = isPositiveNumber(layoutConfig.ANIMATION.BUBBLE_ANIMATION_DURATION, `${animPath}.BUBBLE_ANIMATION_DURATION`) && isValid;
        isValid = isNonEmptyString(layoutConfig.ANIMATION.BUBBLE_ANIMATION_CURVE, `${animPath}.BUBBLE_ANIMATION_CURVE`) && isValid;
        isValid = isPositiveNumber(layoutConfig.ANIMATION.BUBBLE_START_SCALE, `${animPath}.BUBBLE_START_SCALE`) && isValid;
        isValid = isPositiveNumber(layoutConfig.ANIMATION.REACTION_ANIMATION_DURATION_SEC, `${animPath}.REACTION_ANIMATION_DURATION_SEC`) && isValid;
        isValid = isPositiveNumber(layoutConfig.ANIMATION.REACTION_ANIMATION_DELAY_FACTOR_SEC, `${animPath}.REACTION_ANIMATION_DELAY_FACTOR_SEC`) && isValid;
        isValid = isPositiveNumber(layoutConfig.ANIMATION.CHART_BAR_ANIMATION_DURATION_SEC, `${animPath}.CHART_BAR_ANIMATION_DURATION_SEC`) && isValid;
        isValid = isNonNegativeNumber(layoutConfig.ANIMATION.CHART_ANIMATION_DELAY_SEC, `${animPath}.CHART_ANIMATION_DELAY_SEC`) && isValid;
        isValid = isNonNegativeNumber(layoutConfig.ANIMATION.SHADOW_BLUR, `${animPath}.SHADOW_BLUR`) && isValid;
        isValid = isNumber(layoutConfig.ANIMATION.SHADOW_OFFSET_X, `${animPath}.SHADOW_OFFSET_X`) && isValid;
        isValid = isNumber(layoutConfig.ANIMATION.SHADOW_OFFSET_Y, `${animPath}.SHADOW_OFFSET_Y`) && isValid;
        isValid = isOpacityValue(layoutConfig.ANIMATION.SHADOW_OPACITY, `${animPath}.SHADOW_OPACITY`) && isValid;
        isValid = isPositiveNumber(layoutConfig.ANIMATION.SCROLL_DELAY_BUFFER_SEC, `${animPath}.SCROLL_DELAY_BUFFER_SEC`) && isValid;
        isValid = isPositiveNumber(layoutConfig.ANIMATION.MIN_SCROLL_DURATION_SEC, `${animPath}.MIN_SCROLL_DURATION_SEC`) && isValid;
        isValid = isPositiveNumber(layoutConfig.ANIMATION.SCROLL_PIXELS_PER_SEC, `${animPath}.SCROLL_PIXELS_PER_SEC`) && isValid;
    }
    return isValid;
}

export function validateConfiguration(config) {
  if (!config || typeof config !== 'object' || config === null) {
    console.error('Configuration error: Root config must be an object.');
    return false;
  }

  let overallIsValid = true;

  const rootProps = ['activeTheme', 'avatars', 'themes', 'profile', 'cache', 'apiDefaults', 'layout', 'wakatime'];
  if (!validateObjectWithProps(config, 'config', rootProps)) {
    overallIsValid = false; 
  }

  if (overallIsValid) {
    overallIsValid = isNonEmptyString(config.activeTheme, 'config.activeTheme') && overallIsValid;
    if (config.themes && !config.themes[config.activeTheme]) {
        console.error(`Configuration error: activeTheme "${config.activeTheme}" does not exist in config.themes.`);
        overallIsValid = false;
    }

    if (config.themes) {
        for (const themeName in config.themes) {
            if (Object.hasOwnProperty.call(config.themes, themeName)) {
                overallIsValid = validateTheme(config.themes[themeName], themeName) && overallIsValid;
            }
        }
    } else {
        overallIsValid = false;
    }
    
    overallIsValid = validateAvatarsConfig(config.avatars) && overallIsValid;
    overallIsValid = validateProfileConfig(config.profile) && overallIsValid;
    overallIsValid = validateCacheConfig(config.cache) && overallIsValid;
    overallIsValid = validateApiDefaultsConfig(config.apiDefaults) && overallIsValid;
    overallIsValid = validateWakatimeConfig(config.wakatime) && overallIsValid;
    overallIsValid = validateLayoutConfig(config.layout) && overallIsValid;
  }
  
  return overallIsValid;
}