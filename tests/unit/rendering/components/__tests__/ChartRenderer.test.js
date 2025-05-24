/**
 * Unit tests for ChartRenderer.js
 * Tests chart rendering logic including dimensions calculation and SVG output
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChartRenderer from '../../../../../src/rendering/components/ChartRenderer.js';

// Mock dependencies
vi.mock('../../../../../src/config/config.js', () => ({
  config: {
    themes: {
      ios: {
        CHART_STYLES: {
          BAR_DEFAULT_COLOR: '#007AFF',
          BAR_TRACK_COLOR: '#D3D3D8'
        }
      }
    },
    activeTheme: 'ios',
    layout: {
      ANIMATION: {
        CHART_ANIMATION_DELAY_SEC: 0.3
      }
    }
  }
}));

vi.mock('../../../../../src/utils/TextProcessor.js', () => ({
  default: {
    wrapText: vi.fn(),
    escapeXML: vi.fn(text => text)
  }
}));

vi.mock('../../../../../src/rendering/animations/ChartAnimationEngine.js', () => ({
  default: {
    getBarGrowAnimation: vi.fn().mockReturnValue('<mockedBarAnimation/>'),
    getDonutSegmentDrawAnimation: vi.fn().mockReturnValue('<mockedDonutSegmentAnimation/>')
  }
}));

describe('ChartRenderer', () => {
  let mockTextProcessor;
  let mockChartAnimationEngine;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    mockTextProcessor = vi.mocked(await import('../../../../../src/utils/TextProcessor.js')).default;
    mockChartAnimationEngine = vi.mocked(await import('../../../../../src/rendering/animations/ChartAnimationEngine.js')).default;
    
    // Default mock implementations
    mockTextProcessor.wrapText.mockReturnValue({
      lines: ['Sample Title'],
      width: 100,
      height: 20,
      lineCount: 1
    });
  });

  describe('calculateDimensions', () => {
    const mockTheme = {
      CHART_STYLES: {
        CHART_PADDING_X_PX: 16,
        CHART_PADDING_Y_PX: 12,
        TITLE_FONT_SIZE_PX: 15,
        TITLE_LINE_HEIGHT_MULTIPLIER: 1.2,
        TITLE_BOTTOM_MARGIN_PX: 10,
        BAR_HEIGHT_PX: 20,
        BAR_SPACING_PX: 8,
        LABEL_FONT_SIZE_PX: 13,
        DONUT_LEGEND_FONT_SIZE_PX: 12,
        DONUT_LEGEND_ITEM_SPACING_PX: 8
      }
    };

    it('should calculate dimensions for horizontal bar chart without title', () => {
      const chartData = {
        type: 'horizontalBar',
        items: [
          { label: 'Item 1', value: 50 },
          { label: 'Item 2', value: 75 }
        ]
      };

      const result = ChartRenderer.calculateDimensions(chartData, mockTheme, 300);

      expect(result.width).toBe(300);
      expect(result.lineCount).toBe(2);
      // Height should include padding, items, and spacing
      expect(result.height).toBeGreaterThan(50); // Basic sanity check
    });

    it('should calculate dimensions for horizontal bar chart with title', () => {
      const chartData = {
        type: 'horizontalBar',
        title: 'Chart Title',
        items: [
          { label: 'Item 1', value: 50 }
        ]
      };

      mockTextProcessor.wrapText.mockReturnValue({
        lines: ['Chart Title'],
        width: 120,
        height: 18,
        lineCount: 1
      });

      const result = ChartRenderer.calculateDimensions(chartData, mockTheme, 300);

      expect(mockTextProcessor.wrapText).toHaveBeenCalledWith('Chart Title', 268); // 300 - 16*2
      expect(result.width).toBe(300);
      expect(result.height).toBeGreaterThan(40); // Should include title height
    });

    it('should calculate dimensions for donut chart', () => {
      const chartData = {
        type: 'donut',
        items: [
          { label: 'Segment 1', value: 30 },
          { label: 'Segment 2', value: 70 }
        ]
      };

      const result = ChartRenderer.calculateDimensions(chartData, mockTheme, 250);

      expect(result.width).toBe(250);
      expect(result.lineCount).toBe(2);
      // Should include chart size (capped at 200) + legend
      expect(result.height).toBeGreaterThan(200);
    });

    it('should handle empty items array', () => {
      const chartData = {
        type: 'horizontalBar',
        items: []
      };

      const result = ChartRenderer.calculateDimensions(chartData, mockTheme, 300);

      expect(result.lineCount).toBe(0);
      expect(result.height).toBe(24); // Just padding
    });
  });

  describe('render', () => {
    const mockTheme = {
      FONT_FAMILY: 'Arial',
      ME_BUBBLE_COLOR: '#0B93F6',
      VISITOR_BUBBLE_COLOR: '#E5E5EA',
      CHART_STYLES: {
        BAR_DEFAULT_COLOR: '#007AFF',
        BAR_TRACK_COLOR: '#D3D3D8',
        BAR_HEIGHT_PX: 20,
        BAR_SPACING_PX: 8,
        BAR_CORNER_RADIUS_PX: 8,
        CHART_PADDING_X_PX: 16,
        CHART_PADDING_Y_PX: 12,
        LABEL_FONT_SIZE_PX: 13,
        VALUE_TEXT_FONT_SIZE_PX: 12,
        TITLE_FONT_SIZE_PX: 15,
        TITLE_FONT_FAMILY: 'Arial Bold',
        ME_TITLE_COLOR: '#FFFFFF',
        ME_LABEL_COLOR: '#E2F0FF',
        ME_VALUE_TEXT_COLOR: '#FFFFFF',
        VISITOR_TITLE_COLOR: '#000000',
        VISITOR_LABEL_COLOR: '#444444',
        VISITOR_VALUE_TEXT_COLOR: '#000000',
        DONUT_STROKE_WIDTH_PX: 30,
        DONUT_CENTER_TEXT_FONT_SIZE_PX: 16,
        DONUT_CENTER_TEXT_FONT_FAMILY: 'Arial',
        ME_DONUT_CENTER_TEXT_COLOR: '#FFFFFF',
        VISITOR_DONUT_CENTER_TEXT_COLOR: '#000000',
        ME_DONUT_LEGEND_TEXT_COLOR: '#FFFFFF',
        VISITOR_DONUT_LEGEND_TEXT_COLOR: '#000000',
        DONUT_LEGEND_FONT_SIZE_PX: 12,
        DONUT_LEGEND_ITEM_SPACING_PX: 8,
        DONUT_LEGEND_MARKER_SIZE_PX: 10
      }
    };

    it('should return empty string for invalid chart data', () => {
      const item = { chartData: null };
      
      const result = ChartRenderer.render(item, mockTheme);
      
      expect(result).toBe('');
    });

    it('should return empty string for missing chart type', () => {
      const item = { chartData: {} };
      
      const result = ChartRenderer.render(item, mockTheme);
      
      expect(result).toBe('');
    });

    it('should render horizontal bar chart', () => {
      const item = {
        chartData: {
          type: 'horizontalBar',
          title: 'Test Chart',
          maxValue: 100,
          items: [
            { label: 'Item 1', value: 75, color: '#FF0000' }
          ]
        },
        layout: { width: 280 },
        startTime: 1000,
        sender: 'me'
      };

      mockTextProcessor.wrapText.mockReturnValue({
        lines: ['Test Chart'],
        width: 100,
        height: 20,
        lineCount: 1
      });

      const result = ChartRenderer.render(item, mockTheme);

      // Should contain chart content wrapper
      expect(result).toContain('<g class="chart-content">');
      expect(result).toContain('</g>');
      
      // Should contain title
      expect(result).toContain('<text');
      expect(result).toContain('Test Chart');
      expect(result).toContain('font-weight="bold"');
      
      // Should contain bar elements
      expect(result).toContain('class="chart-track-bar"');
      expect(result).toContain('class="chart-value-bar"');
      
      // Should call animation engine
      expect(mockChartAnimationEngine.getBarGrowAnimation).toHaveBeenCalled();
      expect(result).toContain('<mockedBarAnimation/>');
      
      // Should contain label and value text
      expect(result).toContain('Item 1');
      expect(result).toContain('75%'); // Default suffix for maxValue 100
    });

    it('should render donut chart', () => {
      const item = {
        chartData: {
          type: 'donut',
          title: 'Donut Chart',
          items: [
            { label: 'Segment 1', value: 30, color: '#FF0000' },
            { label: 'Segment 2', value: 70, color: '#00FF00' }
          ]
        },
        layout: { width: 280 },
        startTime: 1500,
        sender: 'visitor',
        id: 'chart-1'
      };

      mockTextProcessor.wrapText.mockReturnValue({
        lines: ['Donut Chart'],
        width: 100,
        height: 20,
        lineCount: 1
      });

      const result = ChartRenderer.render(item, mockTheme);

      // Should contain chart content wrapper
      expect(result).toContain('<g class="chart-content">');
      
      // Should contain title
      expect(result).toContain('Donut Chart');
      
      // Should contain donut segments (paths)
      expect(result).toContain('<path');
      expect(result).toContain('stroke="#FF0000"');
      expect(result).toContain('stroke="#00FF00"');
      
      // Should call donut animation engine
      expect(mockChartAnimationEngine.getDonutSegmentDrawAnimation).toHaveBeenCalledTimes(2);
      expect(result).toContain('<mockedDonutSegmentAnimation/>');
      
      // Should contain legend
      expect(result).toContain('class="donut-legend-item"');
      expect(result).toContain('Segment 1 (30%)');
      expect(result).toContain('Segment 2 (70%)');
    });

    // NEW TEST: Donut chart with centerText defined (targets lines 440-451)
    it('should render donut chart with center text', () => {
      const item = {
        chartData: {
          type: 'donut',
          title: 'Usage Chart',
          centerText: 'Total: 100%',
          items: [
            { label: 'Used', value: 75, color: '#FF0000' },
            { label: 'Free', value: 25, color: '#00FF00' }
          ]
        },
        layout: { width: 280 },
        startTime: 1000,
        sender: 'me',
        id: 'chart-center'
      };

      mockTextProcessor.wrapText.mockReturnValue({
        lines: ['Usage Chart'],
        width: 100,
        height: 20,
        lineCount: 1
      });

      const result = ChartRenderer.render(item, mockTheme);

      // Should contain the center text
      expect(result).toContain('Total: 100%');
      expect(result).toContain('text-anchor="middle"');
      expect(result).toContain('dominant-baseline="middle"');
      
      // Should call TextProcessor.escapeXML for center text
      expect(mockTextProcessor.escapeXML).toHaveBeenCalledWith('Total: 100%');
      
      // Should still contain donut segments
      expect(mockChartAnimationEngine.getDonutSegmentDrawAnimation).toHaveBeenCalledTimes(2);
    });

    // NEW TEST: Donut chart with zero items but centerText defined
    it('should render donut chart with zero items but center text', () => {
      const item = {
        chartData: {
          type: 'donut',
          title: 'Empty Chart',
          centerText: 'No Data',
          items: []
        },
        layout: { width: 280 },
        startTime: 1000,
        sender: 'visitor',
        id: 'empty-chart'
      };

      mockTextProcessor.wrapText.mockReturnValue({
        lines: ['Empty Chart'],
        width: 100,
        height: 20,
        lineCount: 1
      });

      const result = ChartRenderer.render(item, mockTheme);

      // Should contain the center text even with no items
      expect(result).toContain('No Data');
      expect(result).toContain('text-anchor="middle"');
      
      // Should not call donut animation engine for items
      expect(mockChartAnimationEngine.getDonutSegmentDrawAnimation).not.toHaveBeenCalled();
      
      // Should still contain chart content wrapper
      expect(result).toContain('<g class="chart-content">');
    });

    // NEW TEST: Donut chart with multiple items to ensure forEach loop is fully exercised
    it('should render donut chart with multiple items and handle animation calls correctly', () => {
      const item = {
        chartData: {
          type: 'donut',
          centerText: 'Survey Results',
          items: [
            { label: 'Option A', value: 40, color: '#FF0000' },
            { label: 'Option B', value: 35, color: '#00FF00' },
            { label: 'Option C', value: 25, color: '#0000FF' }
          ]
        },
        layout: { width: 280 },
        startTime: 2000,
        sender: 'me',
        id: 'multi-segment'
      };

      const result = ChartRenderer.render(item, mockTheme);

      // Should call animation engine for each segment
      expect(mockChartAnimationEngine.getDonutSegmentDrawAnimation).toHaveBeenCalledTimes(3);
      
      // Should contain all segments in the output
      expect(result).toContain('stroke="#FF0000"');
      expect(result).toContain('stroke="#00FF00"');
      expect(result).toContain('stroke="#0000FF"');
      
      // Should contain all legend items with percentages
      expect(result).toContain('Option A (40%)');
      expect(result).toContain('Option B (35%)');
      expect(result).toContain('Option C (25%)');
      
      // Should contain center text
      expect(result).toContain('Survey Results');
    });

    it('should handle unsupported chart type', () => {
      const item = {
        chartData: {
          type: 'unsupportedType'
        }
      };

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = ChartRenderer.render(item, mockTheme);
      
      expect(result).toBe('');
      expect(consoleSpy).toHaveBeenCalledWith('Unsupported chart type: unsupportedType');
      
      consoleSpy.mockRestore();
    });

    it('should normalize chart data and apply default colors', () => {
      const item = {
        chartData: {
          type: 'horizontalBar',
          items: [
            { label: 'Item 1', value: 50 } // No color specified
          ]
        },
        layout: { width: 280 },
        startTime: 1000,
        sender: 'me'
      };

      const result = ChartRenderer.render(item, mockTheme);

      // Should have applied default color
      expect(result).toContain('#007AFF'); // BAR_DEFAULT_COLOR
    });

    it('should use correct theme colors for different senders', () => {
      const baseItem = {
        chartData: {
          type: 'horizontalBar',
          title: 'Test',
          items: [{ label: 'Item', value: 50 }]
        },
        layout: { width: 280 },
        startTime: 1000
      };

      mockTextProcessor.wrapText.mockReturnValue({
        lines: ['Test'],
        width: 50,
        height: 15,
        lineCount: 1
      });

      // Test 'me' sender
      let result = ChartRenderer.render({ ...baseItem, sender: 'me' }, mockTheme);
      expect(result).toContain(mockTheme.CHART_STYLES.ME_TITLE_COLOR);
      expect(result).toContain('--me-title-color');

      // Test 'visitor' sender  
      result = ChartRenderer.render({ ...baseItem, sender: 'visitor' }, mockTheme);
      expect(result).toContain(mockTheme.CHART_STYLES.VISITOR_TITLE_COLOR);
      expect(result).toContain('--visitor-title-color');
    });
  });
});