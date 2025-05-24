/**
 * ProfileChatter.test.js
 * Unit tests for the main ProfileChatter orchestrator
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateChatSVG } from '../../../../src/ProfileChatter.js';

// Mock all dependencies
vi.mock('dotenv/config', () => ({}));

vi.mock('../../../../src/services/DataService.js', () => ({
  default: {
    getDynamicData: vi.fn()
  }
}));

vi.mock('../../../../src/services/TimelineBuilder.js', () => ({
  default: vi.fn()
}));

vi.mock('../../../../src/rendering/SvgRenderer.js', () => ({
  default: {
    renderSVG: vi.fn()
  }
}));

vi.mock('../../../../src/utils/ConfigValidator.js', () => ({
  validateConfiguration: vi.fn()
}));

vi.mock('../../../../src/config/config.js', () => ({
  config: {
    activeTheme: 'ios',
    avatars: {
      enabled: true,
      me: { imageUrl: '', fallbackText: 'DJ' },
      visitor: { imageUrl: '', fallbackText: '?' },
      sizePx: 32,
      shape: 'circle'
    },
    themes: {
      ios: {
        ME_BUBBLE_COLOR: '#0B93F6',
        VISITOR_BUBBLE_COLOR: '#E5E5EA'
      },
      android: {
        ME_BUBBLE_COLOR: '#D1E6FF',
        VISITOR_BUBBLE_COLOR: '#F0F0F0'
      }
    },
    layout: {
      ANIMATION: {
        BUBBLE_ANIMATION_DURATION: 0.36
      }
    }
  }
}));

// Import mocked modules
import DataService from '../../../../src/services/DataService.js';
import TimelineBuilder from '../../../../src/services/TimelineBuilder.js';
import SvgRenderer from '../../../../src/rendering/SvgRenderer.js';
import { validateConfiguration } from '../../../../src/utils/ConfigValidator.js';
import { config } from '../../../../src/config/config.js';

describe('ProfileChatter', () => {
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('generateChatSVG', () => {
    it('should generate SVG successfully with no custom context', async () => {
      // Arrange
      const mockDynamicData = { temperature: '72°F', location: 'San Diego' };
      const mockTimelineData = { items: [], timings: {} };
      const mockSvgOutput = '<svg>Mock SVG</svg>';

      validateConfiguration.mockReturnValue(true);
      DataService.getDynamicData.mockResolvedValue(mockDynamicData);
      
      const mockTimelineBuilder = {
        buildTimeline: vi.fn().mockReturnValue(mockTimelineData)
      };
      TimelineBuilder.mockImplementation(() => mockTimelineBuilder);
      
      SvgRenderer.renderSVG.mockReturnValue(mockSvgOutput);

      // Act
      const result = await generateChatSVG();

      // Assert
      expect(result).toBe('<svg>Mock SVG</svg>');
      expect(validateConfiguration).toHaveBeenCalledWith(config);
      expect(DataService.getDynamicData).toHaveBeenCalledWith({});
      expect(TimelineBuilder).toHaveBeenCalledWith(null);
      expect(mockTimelineBuilder.buildTimeline).toHaveBeenCalledWith(mockDynamicData);
      expect(SvgRenderer.renderSVG).toHaveBeenCalledWith(mockTimelineData);
    });

    it('should generate SVG successfully with custom context', async () => {
      // Arrange
      const customContext = {
        profile: { NAME: 'Test User', LOCATION: 'Test City' },
        activeTheme: 'android',
        chatMessages: [{ id: '1', sender: 'me', text: 'Hello' }],
        avatars: {
          me: { imageUrl: 'data:image/png;base64,test', fallbackText: 'TU' }
        },
        themeOverrides: {
          ME_BUBBLE_COLOR: '#FF0000'
        },
        layoutAnimationOverrides: {
          BUBBLE_ANIMATION_DURATION: 0.5
        }
      };

      const mockDynamicData = { temperature: '75°F', location: 'Test City' };
      const mockTimelineData = { items: [], timings: {} };
      const mockSvgOutput = '<svg>Custom SVG</svg>';

      validateConfiguration.mockReturnValue(true);
      DataService.getDynamicData.mockResolvedValue(mockDynamicData);
      
      const mockTimelineBuilder = {
        buildTimeline: vi.fn().mockReturnValue(mockTimelineData)
      };
      TimelineBuilder.mockImplementation(() => mockTimelineBuilder);
      
      SvgRenderer.renderSVG.mockReturnValue(mockSvgOutput);

      // Act
      const result = await generateChatSVG(customContext);

      // Assert
      expect(result).toBe('<svg>Custom SVG</svg>');
      expect(validateConfiguration).toHaveBeenCalledWith(config);
      expect(DataService.getDynamicData).toHaveBeenCalledWith(customContext);
      expect(TimelineBuilder).toHaveBeenCalledWith(customContext.chatMessages);
      expect(mockTimelineBuilder.buildTimeline).toHaveBeenCalledWith({
        ...mockDynamicData,
        layoutAnimationOverrides: customContext.layoutAnimationOverrides
      });
      expect(SvgRenderer.renderSVG).toHaveBeenCalledWith(mockTimelineData);
    });

    it('should return error SVG when validation fails', async () => {
      // Arrange
      validateConfiguration.mockReturnValue(false);

      // Act
      const result = await generateChatSVG();

      // Assert
      expect(result).toContain('Configuration Error!');
      expect(result).toContain('Please check console logs');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Critical configuration errors found. SVG generation aborted. Please check the errors above.'
      );
      expect(DataService.getDynamicData).not.toHaveBeenCalled();
    });

    it('should return error SVG when DataService fails', async () => {
      // Arrange
      const errorMessage = 'DataService Error';
      validateConfiguration.mockReturnValue(true);
      DataService.getDynamicData.mockRejectedValue(new Error(errorMessage));

      // Act
      const result = await generateChatSVG();

      // Assert
      expect(result).toContain(`Error generating chat: ${errorMessage}`);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error generating SVG:',
        expect.any(Error)
      );
    });

    it('should return error SVG when TimelineBuilder fails', async () => {
      // Arrange
      const errorMessage = 'TimelineBuilder Error';
      validateConfiguration.mockReturnValue(true);
      DataService.getDynamicData.mockResolvedValue({});
      
      const mockTimelineBuilder = {
        buildTimeline: vi.fn().mockImplementation(() => {
          throw new Error(errorMessage);
        })
      };
      TimelineBuilder.mockImplementation(() => mockTimelineBuilder);

      // Act
      const result = await generateChatSVG();

      // Assert
      expect(result).toContain(`Error generating chat: ${errorMessage}`);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error generating SVG:',
        expect.any(Error)
      );
    });

    it('should return error SVG when SvgRenderer fails', async () => {
      // Arrange
      const errorMessage = 'SvgRenderer Error';
      validateConfiguration.mockReturnValue(true);
      DataService.getDynamicData.mockResolvedValue({});
      
      const mockTimelineBuilder = {
        buildTimeline: vi.fn().mockReturnValue({})
      };
      TimelineBuilder.mockImplementation(() => mockTimelineBuilder);
      
      SvgRenderer.renderSVG.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      // Act
      const result = await generateChatSVG();

      // Assert
      expect(result).toContain(`Error generating chat: ${errorMessage}`);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error generating SVG:',
        expect.any(Error)
      );
    });

    it('should handle theme override correctly', async () => {
      // Arrange
      const customContext = {
        activeTheme: 'android',
        themeOverrides: {
          ME_BUBBLE_COLOR: '#FF0000',
          CHART_STYLES: {
            BAR_DEFAULT_COLOR: '#00FF00'
          }
        }
      };

      validateConfiguration.mockReturnValue(true);
      DataService.getDynamicData.mockResolvedValue({});
      
      const mockTimelineBuilder = {
        buildTimeline: vi.fn().mockReturnValue({})
      };
      TimelineBuilder.mockImplementation(() => mockTimelineBuilder);
      
      SvgRenderer.renderSVG.mockReturnValue('<svg>Test</svg>');

      // Act
      await generateChatSVG(customContext);

      // Assert
      expect(config.activeTheme).toBe('ios'); // Should be restored
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Temporarily overriding theme from ios to android')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Restoring original theme: ios')
      );
    });

    it('should handle avatar override correctly', async () => {
      // Arrange
      const customContext = {
        avatars: {
          me: { imageUrl: 'data:image/png;base64,test', fallbackText: 'TU' },
          visitor: { imageUrl: 'https://example.com/avatar.png', fallbackText: 'V' }
        }
      };

      validateConfiguration.mockReturnValue(true);
      DataService.getDynamicData.mockResolvedValue({});
      
      const mockTimelineBuilder = {
        buildTimeline: vi.fn().mockReturnValue({})
      };
      TimelineBuilder.mockImplementation(() => mockTimelineBuilder);
      
      SvgRenderer.renderSVG.mockReturnValue('<svg>Test</svg>');

      // Act
      await generateChatSVG(customContext);

      // Assert
      expect(config.avatars.me.imageUrl).toBe(''); // Should be restored
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Temporarily overriding avatar configuration')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Restoring original avatar configuration')
      );
    });

    it('should handle layout animation override correctly', async () => {
      // Arrange
      const customContext = {
        layoutAnimationOverrides: {
          BUBBLE_ANIMATION_DURATION: 0.5,
          SCROLL_PIXELS_PER_SEC: 25
        }
      };

      validateConfiguration.mockReturnValue(true);
      DataService.getDynamicData.mockResolvedValue({});
      
      const mockTimelineBuilder = {
        buildTimeline: vi.fn().mockReturnValue({})
      };
      TimelineBuilder.mockImplementation(() => mockTimelineBuilder);
      
      SvgRenderer.renderSVG.mockReturnValue('<svg>Test</svg>');

      // Act
      await generateChatSVG(customContext);

      // Assert
      expect(config.layout.ANIMATION.BUBBLE_ANIMATION_DURATION).toBe(0.36); // Should be restored
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Temporarily applying layout animation overrides')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Restoring original layout animation configuration')
      );
    });
  });
});