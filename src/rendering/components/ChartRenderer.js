/**
 * ChartRenderer – all SVG chart rendering lives here.
 * SRP: isolates chart logic; OCP: add new types via the switch().
 */
import { config } from '../../config/config.js'
import TextProcessor from '../../utils/TextProcessor.js'
import { getContrastRatio, darken } from '../../utils/ColorUtils.js'

class ChartRenderer {
  render(item, theme, bubbleBg) {
    if (!item?.chartData?.type) return ''
    
    // Force data normalization to ensure consistent rendering
    this.#normalizeChartData(item);
    
    switch (item.chartData.type) {
      case 'horizontalBar':
        return this.#renderHorizontalBar(item, theme, bubbleBg)
      default:
        console.warn(`Unsupported chart type: ${item.chartData.type}`)
        return ''
    }
  }
  
  /**
   * Normalize chart data to ensure consistent rendering
   * This handles any variations in data structure between different sender types
   * @private
   */
  #normalizeChartData(item) {
    const { chartData, sender } = item;
    
    // Ensure we have a maxValue (defaults to 100 if not present)
    if (!chartData.maxValue) {
      chartData.maxValue = 100;
    }
    
    // Ensure all chart items have color properties
    if (chartData.items && Array.isArray(chartData.items)) {
      const themeStyles = config.themes[config.activeTheme] || config.themes.ios;
      const defaultColor = sender === 'me' 
        ? themeStyles.CHART_STYLES.BAR_DEFAULT_COLOR 
        : themeStyles.CHART_STYLES.BAR_DEFAULT_COLOR;
        
      chartData.items.forEach(item => {
        if (!item.color) {
          item.color = defaultColor;
        }
      });
    }
  }

  #renderHorizontalBar(item, theme, bubbleBg) {
    const cs = theme.CHART_STYLES;
    const { chartData, sender } = item; 
    const isMe = sender === 'me';

    // Determine appropriate colors based on bubble background
    // If bubbleBg wasn't provided, fall back to theme constants
    bubbleBg = bubbleBg || (isMe ? theme.ME_BUBBLE_COLOR : theme.VISITOR_BUBBLE_COLOR);
    
    // Check if track color contrasts enough with bubble background
    // If not, adjust it to ensure visibility
    const defaultTrackColor = cs.BAR_TRACK_COLOR;
    const trackColor = getContrastRatio(bubbleBg, defaultTrackColor) < 1.5
      ? darken(bubbleBg, 0.12) // Make track darker than bubble for visibility
      : defaultTrackColor;
      
    // Get text colors based on contrast
    const titleColor = isMe ? cs.ME_TITLE_COLOR : cs.VISITOR_TITLE_COLOR;
    const labelColor = isMe ? cs.ME_LABEL_COLOR : cs.VISITOR_LABEL_COLOR;
    
    // For text colors - always use the appropriate contrast for the bubble background
    // Always dark text for visitor (light background) and white for me (dark background)
    const valueTextColor = isMe 
        ? cs.ME_VALUE_TEXT_COLOR 
        : cs.VISITOR_VALUE_TEXT_COLOR;             // Dark for visitor (light bubble)
    
    const defaultBarColor = isMe ? cs.BAR_DEFAULT_COLOR : cs.BAR_DEFAULT_COLOR;
    
    const padX = cs.CHART_PADDING_X_PX ?? 16;
    const padY = cs.CHART_PADDING_Y_PX ?? 12;
    const barH = cs.BAR_HEIGHT_PX ?? 20;
    const gapItems = cs.BAR_SPACING_PX ?? 8;
    const cornerRadius = cs.BAR_CORNER_RADIUS_PX ?? barH / 2;
    
    const valueTextPaddingFromTrackEnd = 6;
    const contentAreaWidth = item.layout.width; 
    const barTrackW = contentAreaWidth - (padX * 2);

    // Render chart title if present
    let titleSVG = '';
    let titleSectionHeight = 0;
    if (chartData.title) {
        const titleMaxTextWidth = barTrackW;
        const wrappedTitle = TextProcessor.wrapText(TextProcessor.escapeXML(chartData.title), titleMaxTextWidth);
        const titleLineHeight = cs.TITLE_FONT_SIZE_PX * (cs.TITLE_LINE_HEIGHT_MULTIPLIER ?? 1.2);
        let currentTitleY = padY + cs.TITLE_FONT_SIZE_PX;

        wrappedTitle.lines.forEach((line, index) => {
            if (index > 0) currentTitleY += titleLineHeight;
            titleSVG += `
              <text x="${padX}" y="${currentTitleY}"
                    font-family="${cs.TITLE_FONT_FAMILY}"
                    font-size="${cs.TITLE_FONT_SIZE_PX}px"
                    font-weight="bold"
                    fill="${titleColor}"> 
                ${line}
              </text>
            `;
        });
        titleSectionHeight = (wrappedTitle.lines.length * titleLineHeight) - (titleLineHeight - cs.TITLE_FONT_SIZE_PX);
        titleSectionHeight += (cs.TITLE_BOTTOM_MARGIN_PX ?? 10);
    }
    
    // Ensure we always have a valid maxValue, even if not specified in the chart data
    const maxVal = chartData.maxValue ?? Math.max(1, ...chartData.items.map(d => d.value));

    const rows = [];
    let cursorY = padY + titleSectionHeight;

    chartData.items.forEach(d => {
      const labelYBaseline = cursorY + cs.LABEL_FONT_SIZE_PX;
      const barY = labelYBaseline + 2; // Small gap from label baseline to bar top
      const barW = Number(((d.value / maxVal) * barTrackW).toFixed(2));
      const escapedLabel = TextProcessor.escapeXML(d.label);

      // Label
      rows.push(`
        <text x="${padX}" y="${labelYBaseline}"
              font-family="${cs.LABEL_FONT_FAMILY}"
              font-size="${cs.LABEL_FONT_SIZE_PX}px"
              fill="${labelColor}" 
              dominant-baseline="alphabetic">
          ${escapedLabel}
        </text>
      `);

      // Bar Track - always show track for consistent appearance
      rows.push(`
        <rect x="${padX}" y="${barY}" width="${barTrackW}" height="${barH}"
              rx="${cornerRadius}" ry="${cornerRadius}"
              fill="${trackColor}"/>
      `);

      // Bar Value (animated)
      // Use provided color or default to the theme's default color
      const barFillColor = d.color ?? defaultBarColor;
      rows.push(`
        <rect x="${padX}" y="${barY}" width="0" height="${barH}"
              rx="${cornerRadius}" ry="${cornerRadius}"
              fill="${barFillColor}">
          <animate attributeName="width"
                   dur="${config.layout.ANIMATION.CHART_BAR_ANIMATION_DURATION_SEC}s"
                   begin="${(item.startTime / 1000 + config.layout.ANIMATION.CHART_ANIMATION_DELAY_SEC).toFixed(2)}s"
                   from="0" to="${barW}" fill="freeze"/>
        </rect>
      `);

      // Value Text - ALWAYS positioned at the far right of the track
      const valueString = d.value.toString() + (chartData.valueSuffix || (maxVal === 100 && d.value <= 100 ? "%" : ""));
      const valueYBaseline = labelYBaseline;
      
      // Position all values at the far right of the track area
      const trackEndX = padX + barTrackW - valueTextPaddingFromTrackEnd;

      rows.push(`
        <text x="${trackEndX}" y="${valueYBaseline}" 
              text-anchor="end"
              font-family="${cs.VALUE_TEXT_FONT_FAMILY}"
              font-size="${cs.VALUE_TEXT_FONT_SIZE_PX}px"
              fill="${valueTextColor}"
              dominant-baseline="alphabetic">
          ${valueString}
        </text>
      `);
      
      cursorY = barY + barH + gapItems;
    });

    return `${titleSVG}${rows.join('')}`;
  }
}

export default new ChartRenderer();