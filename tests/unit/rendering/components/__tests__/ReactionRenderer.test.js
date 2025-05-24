/**
 * Unit tests for ReactionRenderer.js
 * Tests reaction rendering for message bubbles
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReactionRenderer from '../../../../../src/rendering/components/ReactionRenderer.js';

// Mock dependencies
vi.mock('../../../../../src/config/config.js', () => ({
  config: {
    layout: {
      ANIMATION: {
        BUBBLE_ANIMATION_DURATION: 0.36,
        REACTION_ANIMATION_DELAY_FACTOR_SEC: 1.1
      },
      STATUS_INDICATOR: {
        ANIMATION_DELAY_SEC: 0.2,
        READ_DELAY_SEC: 1.5,
        READ_TRANSITION_SEC: 0.2
      }
    }
  }
}));

vi.mock('../../../../../src/utils/TextProcessor.js', () => ({
  default: {
    escapeXML: vi.fn(text => text)
  }
}));

describe('ReactionRenderer', () => {
  let mockTextProcessor;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockTextProcessor = vi.mocked(await import('../../../../../src/utils/TextProcessor.js')).default;
  });

  const mockTheme = {
    REACTION_FONT_SIZE_PX: 20,
    REACTION_PADDING_X_PX: 8,
    REACTION_PADDING_Y_PX: 4,
    REACTION_BORDER_RADIUS_PX: 14,
    REACTION_OFFSET_X_PX: 0,
    REACTION_OFFSET_Y_PX: -12,
    REACTION_BG_COLOR: '#F1F1F1',
    REACTION_BG_OPACITY: 0.9,
    REACTION_TEXT_COLOR: '#000000'
  };

  describe('render', () => {
    it('should return empty string when no reaction', () => {
      const item = { reaction: null };
      
      const result = ReactionRenderer.render(item, mockTheme, 200, false);
      
      expect(result).toBe('');
    });

    it('should return empty string when reaction is undefined', () => {
      const item = {};
      
      const result = ReactionRenderer.render(item, mockTheme, 200, false);
      
      expect(result).toBe('');
    });

    it('should render reaction for visitor message', () => {
      const item = {
        reaction: '👍',
        startTime: 2000
      };

      const result = ReactionRenderer.render(item, mockTheme, 200, false);

      // Should contain reaction group
      expect(result).toContain('<g class="reaction"');
      expect(result).toContain('</g>');
      
      // Should contain rect for background
      expect(result).toContain('<rect width="36" height="28"'); // 20 + 8*2, 20 + 4*2
      expect(result).toContain('rx="var(--reaction-border-radius-px, 14px)"');
      expect(result).toContain('fill="var(--reaction-bg-color, #F1F1F1)"');
      expect(result).toContain('fill-opacity="var(--reaction-bg-opacity, 0.9)"');
      
      // Should contain text element
      expect(result).toContain('<text x="18" y="14"'); // Center of pill
      expect(result).toContain('text-anchor="middle"');
      expect(result).toContain('dominant-baseline="middle"');
      expect(result).toContain('font-size="var(--reaction-font-size-px, 20px)"');
      expect(result).toContain('fill="var(--reaction-text-color, #000000)"');
      expect(result).toContain('>👍</text>');
      
      // Should call escapeXML
      expect(mockTextProcessor.escapeXML).toHaveBeenCalledWith('👍');
    });

    it('should render reaction for me message', () => {
      const item = {
        reaction: '❤️',
        startTime: 3000
      };

      const result = ReactionRenderer.render(item, mockTheme, 180, true);

      expect(result).toContain('<g class="reaction"');
      expect(result).toContain('>❤️</text>');
      expect(mockTextProcessor.escapeXML).toHaveBeenCalledWith('❤️');
    });

    it('should position reaction correctly for visitor (not me)', () => {
      const item = {
        reaction: '😊',
        startTime: 1000
      };

      const bubbleWidth = 200;
      const result = ReactionRenderer.render(item, mockTheme, bubbleWidth, false);

      // For visitor: rx = bubbleWidth - pillW/2 + offsetX
      // pillW = 20 + 8*2 = 36, so rx = 200 - 18 + 0 = 182
      expect(result).toContain('transform="translate(182,-12)"');
    });

    it('should position reaction correctly for me', () => {
      const item = {
        reaction: '😊',
        startTime: 1000
      };

      const bubbleWidth = 200;
      const result = ReactionRenderer.render(item, mockTheme, bubbleWidth, true);

      // For me: rx = -pillW/2 + offsetX = -18 + 0 = -18
      expect(result).toContain('transform="translate(-18,-12)"');
    });

    it('should handle custom reaction offset', () => {
      const customTheme = {
        ...mockTheme,
        REACTION_OFFSET_X_PX: 10,
        REACTION_OFFSET_Y_PX: -20
      };

      const item = {
        reaction: '🎉',
        startTime: 1000
      };

      const result = ReactionRenderer.render(item, customTheme, 150, false);

      // For visitor with offset: rx = 150 - 18 + 10 = 142
      expect(result).toContain('transform="translate(142,-20)"');
    });

    it('should calculate correct animation delay for visitor', () => {
      const item = {
        reaction: '🔥',
        startTime: 2500
      };

      const result = ReactionRenderer.render(item, mockTheme, 200, false);

      // Should not contain NaN in the animation delay
      expect(result).not.toContain('NaNs');
      expect(result).toContain('animation-delay:');
      expect(result).toContain('style=');
    });

    it('should calculate correct animation delay for me', () => {
      const item = {
        reaction: '💯',
        startTime: 1500
      };

      const result = ReactionRenderer.render(item, mockTheme, 200, true);

      // Should not contain NaN in the animation delay
      expect(result).not.toContain('NaNs');
      expect(result).toContain('animation-delay:');
      expect(result).toContain('style=');
    });

    it('should handle different reaction sizes and padding', () => {
      const customTheme = {
        ...mockTheme,
        REACTION_FONT_SIZE_PX: 16,
        REACTION_PADDING_X_PX: 6,
        REACTION_PADDING_Y_PX: 3
      };

      const item = {
        reaction: '⭐',
        startTime: 1000
      };

      const result = ReactionRenderer.render(item, customTheme, 200, false);

      // pillW = 16 + 6*2 = 28, pillH = 16 + 3*2 = 22
      expect(result).toContain('<rect width="28" height="22"');
      expect(result).toContain('<text x="14" y="11"'); // Center of smaller pill
    });

    it('should escape XML characters in reaction text', () => {
      mockTextProcessor.escapeXML.mockReturnValue('&lt;script&gt;');
      
      const item = {
        reaction: '<script>',
        startTime: 1000
      };

      const result = ReactionRenderer.render(item, mockTheme, 200, false);

      expect(mockTextProcessor.escapeXML).toHaveBeenCalledWith('<script>');
      expect(result).toContain('>&lt;script&gt;</text>');
    });

    it('should handle undefined offset values gracefully', () => {
      const themeWithoutOffset = {
        ...mockTheme,
        REACTION_OFFSET_X_PX: undefined,
        REACTION_OFFSET_Y_PX: undefined
      };

      const item = {
        reaction: '🚀',
        startTime: 1000
      };

      const result = ReactionRenderer.render(item, themeWithoutOffset, 200, false);

      // Should default to 0 for undefined offsets
      expect(result).toContain('transform="translate(182,undefined)"');
    });
  });
});