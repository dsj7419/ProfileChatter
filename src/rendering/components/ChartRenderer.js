/**
 * ChartRenderer – all SVG chart rendering lives here.
 * SRP: isolates chart logic; OCP: add new types via the switch().
 */
import { config } from '../../config/config.js'
import TextProcessor from '../../utils/TextProcessor.js'
import ChartAnimationEngine from '../animations/ChartAnimationEngine.js'

class ChartRenderer {
    /**
     * Calculate dimensions for a chart based on its type and data
     * @param {Object} chartData - Chart data and configuration
     * @param {Object} theme - Theme styles to use for the chart
     * @param {number} availableBubbleWidth - Maximum width available for the chart
     * @returns {Object} - Calculated dimensions { width, height, lineCount }
     */
    calculateDimensions(chartData, theme, availableBubbleWidth) {
      const cs = theme.CHART_STYLES;
      let calculatedContentHeight = 0;
  
      // Top padding for the chart content area
      calculatedContentHeight += cs.CHART_PADDING_Y_PX;
  
      // Title section height
      if (chartData.title) {
        const barTrackW = availableBubbleWidth - (cs.CHART_PADDING_X_PX * 2);
        const titleMaxTextWidth = barTrackW; 
        
        const wrappedTitle = TextProcessor.wrapText(TextProcessor.escapeXML(chartData.title), titleMaxTextWidth);
        const titleLineHeight = cs.TITLE_FONT_SIZE_PX * (cs.TITLE_LINE_HEIGHT_MULTIPLIER ?? 1.2);
        
        // Height of the actual text block for the title
        const titleTextActualHeight = (wrappedTitle.lines.length * titleLineHeight) - (titleLineHeight - cs.TITLE_FONT_SIZE_PX);
        calculatedContentHeight += titleTextActualHeight;
        calculatedContentHeight += (cs.TITLE_BOTTOM_MARGIN_PX ?? 10); // Margin after title
      }
      
      // Handle specific chart types
      if (chartData.type === 'donut') {
        const chartSize = Math.min(availableBubbleWidth - (cs.CHART_PADDING_X_PX * 2), 200); // Cap at 200px
        
        // Add chart size
        calculatedContentHeight += chartSize;
        
        // Add legend height
        const itemCount = chartData.items?.length || 0;
        if (itemCount > 0) {
          const legendItemHeight = cs.DONUT_LEGEND_FONT_SIZE_PX + cs.DONUT_LEGEND_ITEM_SPACING_PX;
          calculatedContentHeight += 30; // Space between chart and legend
          calculatedContentHeight += itemCount * legendItemHeight;
        }
      }
      else if (chartData.type === 'horizontalBar') {
        const itemCount = chartData.items?.length || 0;
        if (itemCount > 0) {
          const labelHeight = cs.LABEL_FONT_SIZE_PX; 
          
          chartData.items.forEach((item, index) => {
            calculatedContentHeight += labelHeight; // Label text height
            calculatedContentHeight += cs.BAR_HEIGHT_PX; 
            if (index < itemCount - 1) {
              calculatedContentHeight += cs.BAR_SPACING_PX;
            }
          });
          // Account for small gaps between label and bar
          calculatedContentHeight += itemCount * 2;
        }
      }
  
      // Bottom padding for the chart content area
      calculatedContentHeight += cs.CHART_PADDING_Y_PX;
      
      return {
        width: availableBubbleWidth,
        height: calculatedContentHeight,
        lineCount: chartData.items?.length || 0
      };
    }
  
    render(item, theme) {
      if (!item?.chartData?.type) return ''
      
      // Force data normalization to ensure consistent rendering
      this.#normalizeChartData(item);
      
      switch (item.chartData.type) {
        case 'horizontalBar':
          return this.#renderHorizontalBar(item, theme)
        case 'donut':
          return this.#renderDonutChart(item, theme)
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
  
    /**
     * Render horizontal bar chart with labels, tracks, and value indicators
     * @private
     */
    #renderHorizontalBar(item, theme) {
    const cs = theme.CHART_STYLES;
    const { chartData, sender } = item; 
    const isMe = sender === 'me';
    
    // Get track color from theme
    const trackColor = cs.BAR_TRACK_COLOR;
      
    // Get text colors from theme
    const titleColor = isMe ? cs.ME_TITLE_COLOR : cs.VISITOR_TITLE_COLOR;
    const labelColor = isMe ? cs.ME_LABEL_COLOR : cs.VISITOR_LABEL_COLOR;
    const valueTextColor = isMe ? cs.ME_VALUE_TEXT_COLOR : cs.VISITOR_VALUE_TEXT_COLOR;
    
    const defaultBarColor = isMe ? cs.BAR_DEFAULT_COLOR : cs.BAR_DEFAULT_COLOR;
    
    const padX = cs.CHART_PADDING_X_PX || 16;
    const padY = cs.CHART_PADDING_Y_PX || 12;
    const barH = cs.BAR_HEIGHT_PX || 20;
    const gapItems = cs.BAR_SPACING_PX || 8;
    const cornerRadius = cs.BAR_CORNER_RADIUS_PX || barH / 2;
    
    const valueTextPaddingFromTrackEnd = 6;
    const contentAreaWidth = item.layout.width; 
    const barTrackW = contentAreaWidth - (padX * 2);

    // Render chart title if present
    let titleSVG = '';
    let titleSectionHeight = 0;
    if (chartData.title) {
        const titleMaxTextWidth = barTrackW;
        const wrappedTitle = TextProcessor.wrapText(TextProcessor.escapeXML(chartData.title), titleMaxTextWidth);
        const titleLineHeight = cs.TITLE_FONT_SIZE_PX * (cs.TITLE_LINE_HEIGHT_MULTIPLIER || 1.2);
        let currentTitleY = padY + cs.TITLE_FONT_SIZE_PX;

        wrappedTitle.lines.forEach((line, index) => {
            if (index > 0) currentTitleY += titleLineHeight;
            titleSVG += `
              <text x="${padX}" y="${currentTitleY}"
                    font-family="var(--title-font-family, ${cs.TITLE_FONT_FAMILY})"
                    font-size="var(--title-font-size-px, ${cs.TITLE_FONT_SIZE_PX}px)"
                    font-weight="bold"
                    fill="var(--${isMe ? 'me' : 'visitor'}-title-color, ${titleColor})"> 
                ${line}
              </text>
            `;
        });
        titleSectionHeight = (wrappedTitle.lines.length * titleLineHeight) - (titleLineHeight - cs.TITLE_FONT_SIZE_PX);
        titleSectionHeight += (cs.TITLE_BOTTOM_MARGIN_PX || 10);
    }
    
    // Ensure we always have a valid maxValue, even if not specified in the chart data
    const maxVal = chartData.maxValue || Math.max(1, ...chartData.items.map(d => d.value || 0));

    const rows = [];
    let cursorY = padY + titleSectionHeight;

    // Create a group for chart content to isolate it from bubble styling
    rows.push(`<g class="chart-content">`);

    chartData.items.forEach((d, itemIndex) => {
      const labelYBaseline = cursorY + cs.LABEL_FONT_SIZE_PX;
      const barY = labelYBaseline + 2; // Small gap from label baseline to bar top
      
      // Ensure barW is calculated correctly and is positive
      const value = typeof d.value === 'number' ? d.value : 0;
      const barW = Math.max(1, Math.round((value / maxVal) * barTrackW));
      
      const escapedLabel = TextProcessor.escapeXML(d.label || '');

      // Label
      rows.push(`
        <text x="${padX}" y="${labelYBaseline}"
              font-family="var(--label-font-family, ${cs.LABEL_FONT_FAMILY || theme.FONT_FAMILY})"
              font-size="var(--label-font-size-px, ${cs.LABEL_FONT_SIZE_PX || 13}px)"
              fill="var(--${isMe ? 'me' : 'visitor'}-label-color, ${labelColor})" 
              dominant-baseline="alphabetic">
          ${escapedLabel}
        </text>
      `);

      // Bar Track - always show track for consistent appearance
      rows.push(`
        <rect class="chart-track-bar" x="${padX}" y="${barY}" 
              width="${barTrackW}" height="var(--bar-height-px, ${barH}px)"
              rx="var(--bar-corner-radius-px, ${cornerRadius}px)" 
              ry="var(--bar-corner-radius-px, ${cornerRadius}px)"
              fill="var(--bar-track-color, ${trackColor})" stroke="none"/>
      `);

      // Bar Value (animated)
      // Ensure barFillColor is always a valid color
      const barFillColor = d.color || defaultBarColor || '#007AFF';
      
      // Use ChartAnimationEngine for bar animation
      const barAnimDuration = 0.7; // Fixed faster duration
      // Add slightly staggered delay based on item index for cascade effect
      const staggerDelay = 0.03 * itemIndex; // Shorter stagger delay
      const animDelay = (item.startTime / 1000) + (config.layout.ANIMATION.CHART_ANIMATION_DELAY_SEC || 0.3) + staggerDelay;
      
      // Specific class for animated bars to avoid style collisions
      rows.push(`
        <rect class="chart-value-bar animated-bar" 
              x="${padX}" y="${barY}" 
              width="0" 
              height="var(--bar-height-px, ${barH}px)"
              rx="var(--bar-corner-radius-px, ${cornerRadius}px)" 
              ry="var(--bar-corner-radius-px, ${cornerRadius}px)"
              fill="${barFillColor}" 
              stroke="none"
              opacity="0.2">
          ${ChartAnimationEngine.getBarGrowAnimation(barW, barAnimDuration, animDelay.toFixed(2))}
        </rect>
      `);

      // Value Text
      const valueString = value.toString() + (chartData.valueSuffix || (maxVal === 100 && value <= 100 ? "%" : ""));
      const valueYBaseline = labelYBaseline;
      const trackEndX = padX + barTrackW - valueTextPaddingFromTrackEnd;

      rows.push(`
        <text x="${trackEndX}" y="${valueYBaseline}" 
              text-anchor="end"
              font-family="var(--value-text-font-family, ${cs.VALUE_TEXT_FONT_FAMILY || theme.FONT_FAMILY})"
              font-size="var(--value-text-font-size-px, ${cs.VALUE_TEXT_FONT_SIZE_PX || 12}px)"
              fill="var(--${isMe ? 'me' : 'visitor'}-value-text-color, ${valueTextColor})"
              dominant-baseline="alphabetic">
          ${valueString}
        </text>
      `);
      
      cursorY = barY + barH + gapItems;
    });

    // Close the chart content group
    rows.push(`</g>`);

    return `${titleSVG}${rows.join('')}`;
  }
  
  /**
   * Render donut chart with segments, center text, and legend
   * Using stroke-dashoffset animation for segment drawing effect
   * @private
   */
  #renderDonutChart(msg, theme) {
    const cs = theme.CHART_STYLES;
    const { chartData, sender } = msg;
    const isMe = sender === 'me';

    // Get text colors based on sender type
    const titleColor = isMe ? cs.ME_TITLE_COLOR : cs.VISITOR_TITLE_COLOR;
    const centerTextColor = isMe ? cs.ME_DONUT_CENTER_TEXT_COLOR : cs.VISITOR_DONUT_CENTER_TEXT_COLOR;
    const legendTextColor = isMe ? cs.ME_DONUT_LEGEND_TEXT_COLOR : cs.VISITOR_DONUT_LEGEND_TEXT_COLOR;
    
    const padX = cs.CHART_PADDING_X_PX || 16;
    const padY = cs.CHART_PADDING_Y_PX || 12;
    
    // Calculate dimensions
    const contentAreaWidth = msg.layout.width;
    const chartSize = Math.min(contentAreaWidth - padX * 2, 200); // Cap at 200px
    
    // Calculate title offset for chart positioning
    const titleOffset = chartData.title ? (cs.TITLE_FONT_SIZE_PX || 15) + (cs.TITLE_BOTTOM_MARGIN_PX || 10) : 0;
    
    const centerX = padX + chartSize / 2;
    const centerY = padY + titleOffset + chartSize / 2;
    
    // Donut chart parameters
    const radius = chartSize / 2 - 10; // Leave some margin
    const strokeWidth = parseInt(cs.DONUT_STROKE_WIDTH_PX || 30, 10);
    const innerRadius = Math.max(0, radius - strokeWidth); // The inner circle radius, ensure it's not negative
    
    // Calculate total value
    let total = 0;
    chartData.items.forEach(segment => {
      total += (typeof segment.value === 'number' ? segment.value : 0);
    });
    
    // Fallback for zero total
    if (total <= 0) total = 1;
    
    // Render chart title if present
    let titleSVG = '';
    if (chartData.title) {
      const titleMaxTextWidth = contentAreaWidth - padX * 2;
      const wrappedTitle = TextProcessor.wrapText(TextProcessor.escapeXML(chartData.title), titleMaxTextWidth);
      const titleLineHeight = (cs.TITLE_FONT_SIZE_PX || 15) * (cs.TITLE_LINE_HEIGHT_MULTIPLIER || 1.2);
      let currentTitleY = padY + (cs.TITLE_FONT_SIZE_PX || 15);
      
      wrappedTitle.lines.forEach((line, index) => {
        if (index > 0) currentTitleY += titleLineHeight;
        titleSVG += `
          <text x="${padX}" y="${currentTitleY}"
                font-family="var(--title-font-family, ${cs.TITLE_FONT_FAMILY || theme.FONT_FAMILY})"
                font-size="var(--title-font-size-px, ${cs.TITLE_FONT_SIZE_PX || 15}px)"
                font-weight="bold"
                fill="var(--${isMe ? 'me' : 'visitor'}-title-color, ${titleColor})">
            ${line}
          </text>
        `;
      });
    }
    
    // Create a group for chart content
    let chartSVG = `<g class="chart-content">`;
    
    // Create donut segments using stroked paths for animation
    let segments = '';
    let legendItems = '';
    let currentAngle = 0;
    
    // Draw background circle for clean base
    segments += `
      <circle cx="${centerX}" cy="${centerY}" r="${innerRadius}" 
              fill="${isMe ? theme.ME_BUBBLE_COLOR : theme.VISITOR_BUBBLE_COLOR}" 
              stroke="none" />
    `;
    
    chartData.items.forEach((segment, index) => {
      // Ensure value is a number and non-zero
      const value = Math.max(0.1, typeof segment.value === 'number' ? segment.value : 0.1);
      const percentage = value / total;
      const angle = percentage * 360;
      
      // Use segment.color directly for donut segments
      const color = segment.color || cs.BAR_DEFAULT_COLOR || '#007AFF';
      
      // Convert angles to radians for SVG arc drawing
      const startAngleRad = (currentAngle - 90) * (Math.PI / 180);
      const endAngleRad = (currentAngle + angle - 90) * (Math.PI / 180);
      
      // Create SVG path for arc (not wedge)
      const isLargeArc = angle > 180 ? 1 : 0;
      
      // Calculate arc points
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);
      
      // Create a segment ID for potential interactivity
      const segmentId = `donut-segment-${msg.id || 'chart'}-${index}`;
      
      // Create simple arc path (not wedge)
      const arcPath = [
        `M ${x1} ${y1}`, // Move to start of arc
        `A ${radius} ${radius} 0 ${isLargeArc} 1 ${x2} ${y2}` // Draw arc
      ].join(' ');
      
      // Calculate arc length (approximation)
      const arcLength = 2 * Math.PI * radius * (angle / 360);
      
      // Use fixed faster duration for animations
      const donutAnimDuration = 0.5; // Fixed faster duration
      const donutSegmentDelay = 0.05; // Shorter delay between segments
      
      // Calculate animation timing based on theme settings
      const animDelay = ((msg.startTime / 1000) + (config.layout.ANIMATION.CHART_ANIMATION_DELAY_SEC || 0.3) + (index * donutSegmentDelay)).toFixed(2);
      
      // Create segment with stroke animation
      segments += `
        <path id="${segmentId}" d="${arcPath}" 
              fill="none"
              stroke="${color}"
              stroke-width="var(--donut-stroke-width-px, ${strokeWidth}px)"
              stroke-linecap="round"
              stroke-dasharray="${arcLength}"
              stroke-dashoffset="${arcLength}"
              class="donut-segment"
              opacity="0">
          ${ChartAnimationEngine.getDonutSegmentDrawAnimation(segmentId, arcLength, donutAnimDuration, animDelay)}
        </path>
      `;
      
      // Create legend item
      const legendY = centerY + radius + 30 + index * ((cs.DONUT_LEGEND_FONT_SIZE_PX || 12) + (cs.DONUT_LEGEND_ITEM_SPACING_PX || 8));
      const legendMarkerSize = cs.DONUT_LEGEND_MARKER_SIZE_PX || 10;
      
      legendItems += `
        <g class="donut-legend-item" data-segment-id="${segmentId}">
          <rect class="donut-legend-marker" x="${padX}" 
                y="${legendY - legendMarkerSize + 2}" 
                width="${legendMarkerSize}" 
                height="${legendMarkerSize}" 
                fill="${color}" stroke="none" />
          <text x="${padX + legendMarkerSize + 5}" y="${legendY}" 
                font-family="${cs.LABEL_FONT_FAMILY || theme.FONT_FAMILY}"
                font-size="${cs.DONUT_LEGEND_FONT_SIZE_PX || 12}px"
                fill="${legendTextColor}"
                dominant-baseline="middle">
            ${TextProcessor.escapeXML(segment.label || '')} (${Math.round(percentage * 100)}%)
          </text>
        </g>
      `;
      
      currentAngle += angle;
    });
    
    // Center text
    let centerTextSVG = '';
    if (chartData.centerText) {
      centerTextSVG = `
        <text x="${centerX}" y="${centerY}"
              font-family="${cs.DONUT_CENTER_TEXT_FONT_FAMILY || theme.FONT_FAMILY}"
              font-size="${cs.DONUT_CENTER_TEXT_FONT_SIZE_PX || 16}px"
              font-weight="bold"
              text-anchor="middle"
              dominant-baseline="middle"
              fill="${centerTextColor}">
          ${TextProcessor.escapeXML(chartData.centerText)}
        </text>
      `;
    }
    
    // Close the chart content group
    chartSVG += `${segments}${centerTextSVG}${legendItems}</g>`;
    
    return `${titleSVG}${chartSVG}`;
  }
}

export default new ChartRenderer();