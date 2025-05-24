/**
 * Unit tests for SvgRenderer.js
 * Tests main SVG rendering logic and header generation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SvgRenderer from '../../../../src/rendering/SvgRenderer.js';
import { TypingIndicator, ChatMessage } from '../../../../src/models/TimelineItem.js';

// Mock dependencies
vi.mock('../../../../src/config/config.js', () => ({
  config: {
    activeTheme: 'ios',
    themes: {
      ios: {
        ME_BUBBLE_COLOR: '#0B93F6',
        VISITOR_BUBBLE_COLOR: '#E5E5EA',
        ME_TEXT_COLOR: '#FFFFFF',
        VISITOR_TEXT_COLOR: '#000000',
        BACKGROUND_LIGHT: '#FFFFFF',
        BACKGROUND_DARK: '#000000',
        BUBBLE_RADIUS_PX: 18,
        FONT_FAMILY: 'Arial',
        REACTION_FONT_SIZE_PX: 20,
        REACTION_BG_COLOR: '#F1F1F1',
        REACTION_BG_OPACITY: 0.9,
        REACTION_TEXT_COLOR: '#000000',
        REACTION_PADDING_X_PX: 8,
        REACTION_PADDING_Y_PX: 4,
        REACTION_BORDER_RADIUS_PX: 14,
        REACTION_OFFSET_X_PX: 0,
        REACTION_OFFSET_Y_PX: -12,
        CHART_STYLES: {
          BAR_DEFAULT_COLOR: '#007AFF',
          BAR_TRACK_COLOR: '#D3D3D8',
          BAR_CORNER_RADIUS_PX: 8,
          BAR_HEIGHT_PX: 20,
          TITLE_FONT_SIZE_PX: 15,
          CHART_PADDING_X_PX: 16
        }
      }
    },
    layout: {
      CHAT_WIDTH_PX: 320,
      CHAT_HEIGHT_PX: 450,
      FONT_SIZE_PX: 14,
      BUBBLE_PAD_X_PX: 12,
      BUBBLE_PAD_Y_PX: 8,
      MIN_BUBBLE_W_PX: 40,
      MAX_BUBBLE_W_PX: 260,
      LINE_HEIGHT_PX: 20,
      TYPING_DOT_RADIUS_PX: 4,
      ANIMATION: {
        TYPING_BUBBLE_WIDTH: 70,
        TYPING_BUBBLE_HEIGHT: 36,
        DOT_ANIMATION_DURATION: 1.4,
        DOT_DELAY_2: 0.2,
        DOT_DELAY_3: 0.4,
        DOT_MIN_OPACITY: 0.4,
        DOT_MAX_OPACITY: 1.0,
        DOT_MIN_SCALE: 0.8,
        DOT_MAX_SCALE: 1.0,
        BUBBLE_ANIMATION_DURATION: 0.36,
        BUBBLE_ANIMATION_CURVE: 'cubic-bezier(.36,1.64,.36,1)',
        BUBBLE_START_SCALE: 0.8,
        REACTION_ANIMATION_DURATION_SEC: 0.3,
        SHADOW_BLUR: 1,
        SHADOW_OFFSET_X: 0, 
        SHADOW_OFFSET_Y: 1,
        SHADOW_OPACITY: 0.15,
        CHART_BAR_ANIMATION_DURATION_SEC: 0.8,
        CHART_ANIMATION_DELAY_SEC: 0.3
      },
      STATUS_INDICATOR: {
        DELIVERED_TEXT: 'Delivered',
        READ_TEXT: 'Read',
        FONT_SIZE_PX: 10,
        COLOR_ME: '#FFFFFFB3',
        OFFSET_Y_PX: 10,
        ANIMATION_DELAY_SEC: 0.2,
        FADE_IN_DURATION_SEC: 0.3,
        READ_DELAY_SEC: 1.5,
        READ_TRANSITION_SEC: 0.2
      }
    },
    avatars: {
      enabled: true,
      sizePx: 32,
      xOffsetPx: 8,
      yOffsetPx: 0
    }
  }
}));

vi.mock('../../../../src/utils/TextProcessor.js', () => ({
  default: {
    escapeXML: vi.fn(text => text),
    measureTextWidth: vi.fn(text => text.length * 8)
  }
}));

vi.mock('../../../../src/rendering/components/AvatarRenderer.js', () => ({
  default: {
    render: vi.fn().mockReturnValue('<mockedAvatar/>')
  }
}));

vi.mock('../../../../src/rendering/components/ReactionRenderer.js', () => ({
  default: {
    render: vi.fn().mockReturnValue('<mockedReaction/>')
  }
}));

vi.mock('../../../../src/rendering/components/ChartRenderer.js', () => ({
  default: {
    calculateDimensions: vi.fn().mockReturnValue({ width: 280, height: 120, lineCount: 3 }),
    render: vi.fn().mockReturnValue('<mockedChart/>')
  }
}));

vi.mock('../../../../src/rendering/ScrollAnimationEngine.js', () => ({
  default: {
    generateScrollKeyframesCSS: vi.fn().mockReturnValue('@keyframes mockedScrollUp {}')
  }
}));

vi.mock('../../../../src/rendering/fontData.js', () => ({
  INTER_FONT_BASE64: 'mockedBase64FontDataString'
}));

describe('SvgRenderer', () => {
  let mockAvatarRenderer;
  let mockReactionRenderer; 
  let mockChartRenderer;
  let mockScrollAnimationEngine;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    mockAvatarRenderer = vi.mocked(await import('../../../../src/rendering/components/AvatarRenderer.js')).default;
    mockReactionRenderer = vi.mocked(await import('../../../../src/rendering/components/ReactionRenderer.js')).default;
    mockChartRenderer = vi.mocked(await import('../../../../src/rendering/components/ChartRenderer.js')).default;
    mockScrollAnimationEngine = vi.mocked(await import('../../../../src/rendering/ScrollAnimationEngine.js')).default;
  });

  describe('getActiveThemeStyles', () => {
    it('should return active theme styles', () => {
      const result = SvgRenderer.getActiveThemeStyles();
      
      expect(result.ME_BUBBLE_COLOR).toBe('#0B93F6');
      expect(result.VISITOR_BUBBLE_COLOR).toBe('#E5E5EA');
      expect(result.FONT_FAMILY).toBe('Arial');
    });

    it('should fallback to ios theme if activeTheme is invalid', async () => {
      const mockConfig = vi.mocked(await import('../../../../src/config/config.js')).config;
      mockConfig.activeTheme = 'nonExistentTheme';
      
      const result = SvgRenderer.getActiveThemeStyles();
      
      // Should still return ios theme as fallback
      expect(result.ME_BUBBLE_COLOR).toBe('#0B93F6');
    });

    it('should fallback to ios theme if activeTheme is null', async () => {
      const mockConfig = vi.mocked(await import('../../../../src/config/config.js')).config;
      mockConfig.activeTheme = null;
      
      const result = SvgRenderer.getActiveThemeStyles();
      
      expect(result.ME_BUBBLE_COLOR).toBe('#0B93F6');
    });
  });

  describe('_header', () => {
    it('should generate SVG header with styles and keyframes', () => {
      const timelineData = {
        timings: {
          scrollDurationSec: 3.5,
          scrollDistance: 500,
          getTotalDuration: () => 8000
        },
        totalTypingTime: 2000,
        totalMessagingTimeSec: 6.5,
        scrollKeyframeData: [
          { y: 100, startTime: 1000 },
          { y: 200, startTime: 2000 }
        ]
      };

      const result = SvgRenderer._header(timelineData);

      // Should contain SVG opening tag
      expect(result).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
      expect(result).toContain('width="320" height="450"');
      
      // Should contain style tag
      expect(result).toContain('<style>');
      
      // Should contain font-face with mocked font data
      expect(result).toContain('@font-face');
      expect(result).toContain('font-family:\'Inter\'');
      expect(result).toContain('mockedBase64FontDataString');
      
      // Should contain CSS variables
      expect(result).toContain(':root{');
      expect(result).toContain('--me-bubble-color:#0B93F6');
      expect(result).toContain('--visitor-bubble-color:#E5E5EA');
      
      // Should contain keyframe animations
      expect(result).toContain('@keyframes bubbleIn');
      expect(result).toContain('@keyframes typingDot');
      expect(result).toContain('@keyframes reactionIn');
      
      // Should contain scroll animation from engine
      expect(result).toContain('@keyframes mockedScrollUp {}');
      expect(mockScrollAnimationEngine.generateScrollKeyframesCSS).toHaveBeenCalledWith(
        timelineData.scrollKeyframeData,
        6.5, // totalMessagingSec
        'scrollUp',
        500 // scrollDistance
      );
      
      // Should contain CSS classes
      expect(result).toContain('.track{animation:scrollUp');
      expect(result).toContain('.msg{animation:bubbleIn');
      expect(result).toContain('.reaction{animation:reactionIn');
      
      // Should contain defs with filters and clip paths
      expect(result).toContain('<defs>');
      expect(result).toContain('<filter id="shadowEffect"');
      expect(result).toContain('<clipPath id="avatarCircle"');
      expect(result).toContain('<clipPath id="avatarSquare"');
      
      // Should end with track group opening
      expect(result).toContain('<g class="track">');
    });

    it('should handle missing font data gracefully', () => {
      const timelineData = {
        timings: {
          scrollDurationSec: 2.0,
          scrollDistance: 0,
          getTotalDuration: () => 5000
        },
        totalTypingTime: 1000,
        scrollKeyframeData: []
      };

      // Mock the font import to return empty string
      vi.doMock('../../../../src/rendering/fontData.js', () => ({
        INTER_FONT_BASE64: ''
      }));

      const result = SvgRenderer._header(timelineData);
      
      // Should still contain style tag and other content
      expect(result).toContain('<style>');
      expect(result).toContain(':root{');
      expect(result).toContain('@keyframes');
    });
  });

  describe('renderSVG', () => {
    it('should render complete SVG with typing indicator and chat messages', () => {
      const typingItem = new TypingIndicator('visitor', 1000, 50, 2000);
      const textMessage = new ChatMessage(
        'me', 
        3000, 
        100, 
        'Hello world!', 
        { lines: ['Hello world!'], width: 100, height: 30 }, 
        null,
        'text'
      );
      const chartMessage = new ChatMessage(
        'visitor',
        5000,
        150,
        null,
        { width: 280, height: 120 },
        '👍',
        'chart',
        { type: 'horizontalBar', items: [{ label: 'Test', value: 75 }] }
      );

      const timelineData = {
        items: [typingItem, textMessage, chartMessage],
        timings: {
          scrollDurationSec: 3.0,
          scrollDistance: 300,
          getTotalDuration: () => 7000
        },
        totalTypingTime: 2000,
        scrollKeyframeData: []
      };

      const result = SvgRenderer.renderSVG(timelineData);

      // Should include header
      expect(result).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
      expect(result).toContain('<style>');
      
      // Should include typing indicator
      expect(result).toContain('<g class="typing them"');
      expect(result).toContain('<circle'); // Typing dots
      expect(result).toContain('class="typing-dot1"');
      
      // Should include text chat bubble
      expect(result).toContain('<g class="msg me"');
      expect(result).toContain('Hello world!');
      
      // Should include chart chat bubble
      expect(result).toContain('<g class="msg them"');
      expect(result).toContain('<mockedChart/>');
      expect(result).toContain('<mockedReaction/>');
      
      // Should include avatars
      expect(result).toContain('<mockedAvatar/>');
      expect(mockAvatarRenderer.render).toHaveBeenCalledTimes(2); // Only for chat messages, not typing indicators
      
      // Should end properly
      expect(result).toContain('</g></svg>');
      
      // Verify component calls
      expect(mockChartRenderer.render).toHaveBeenCalledWith(chartMessage, expect.any(Object), expect.any(String));
      expect(mockReactionRenderer.render).toHaveBeenCalledWith(chartMessage, expect.any(Object), expect.any(Number), false);
    });

    it('should handle empty timeline', () => {
      const timelineData = {
        items: [],
        timings: {
          scrollDurationSec: 1.0,
          scrollDistance: 0,
          getTotalDuration: () => 1000
        },
        totalTypingTime: 0,
        scrollKeyframeData: []
      };

      const result = SvgRenderer.renderSVG(timelineData);

      expect(result).toContain('<svg');
      expect(result).toContain('</g></svg>');
      expect(mockAvatarRenderer.render).not.toHaveBeenCalled();
    });

    it('should render status indicators for me messages', () => {
      const message = new ChatMessage(
        'me',
        2000,
        100,
        'Test message',
        { lines: ['Test message'], width: 120, height: 25 },
        null,
        'text'
      );

      const timelineData = {
        items: [message],
        timings: {
          scrollDurationSec: 2.0,
          scrollDistance: 0,
          getTotalDuration: () => 4000
        },
        totalTypingTime: 1000,
        scrollKeyframeData: []
      };

      const result = SvgRenderer.renderSVG(timelineData);

      // Should contain status indicators for 'me' messages
      expect(result).toContain('Delivered');
      expect(result).toContain('Read');
      expect(result).toContain('class="status-indicator"');
    });

    it('should not render status indicators for visitor messages', () => {
      const message = new ChatMessage(
        'visitor',
        2000,
        100,
        'Visitor message',
        { lines: ['Visitor message'], width: 120, height: 25 },
        null,
        'text'
      );

      const timelineData = {
        items: [message],
        timings: {
          scrollDurationSec: 2.0,
          scrollDistance: 0,
          getTotalDuration: () => 4000
        },
        totalTypingTime: 1000,
        scrollKeyframeData: []
      };

      const result = SvgRenderer.renderSVG(timelineData);

      // Should not contain status indicators for visitor messages
      expect(result).not.toContain('Delivered');
      expect(result).not.toContain('Read');
    });

    it('should calculate correct bubble positioning', () => {
      const message = new ChatMessage(
        'visitor',
        1500,
        75,
        'Short msg',
        { lines: ['Short msg'], width: 80, height: 25 },
        null,
        'text'
      );

      const timelineData = {
        items: [message],
        timings: {
          scrollDurationSec: 2.0,
          scrollDistance: 0,
          getTotalDuration: () => 3000
        },
        totalTypingTime: 500,
        scrollKeyframeData: []
      };

      const result = SvgRenderer.renderSVG(timelineData);

      // Visitor message should be positioned on left side accounting for avatar
      // bubbleX = avSize + avOff * 2 = 32 + 8*2 = 48
      expect(result).toContain('transform="translate(48,75)"');
    });
  });
});