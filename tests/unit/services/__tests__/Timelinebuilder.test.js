/**
 * Unit tests for TimelineBuilder.js
 * Tests timeline construction with extensive mocking of dependencies
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock node:fs BEFORE importing TimelineBuilder
vi.mock('node:fs', async (importOriginal) => {
  const actualFs = await importOriginal();
  return {
    ...actualFs,
    readFileSync: vi.fn(),
  };
});

// Mock config - FIXED PATH
vi.mock('../../../../src/config/config.js', () => ({
  config: {
    activeTheme: 'ios',
    themes: {
      ios: {
        CHART_STYLES: {
          BAR_DEFAULT_COLOR: '#007AFF',
          TITLE_FONT_SIZE_PX: 15,
          TITLE_LINE_HEIGHT_MULTIPLIER: 1.3,
          TITLE_BOTTOM_MARGIN_PX: 10
        }
      }
    },
    layout: {
      TYPING_CHAR_MS: 40,
      TYPING_MIN_MS: 1600,
      TYPING_MAX_MS: 3000,
      MAX_BUBBLE_W_PX: 260,
      BUBBLE_PAD_Y_PX: 8,
      TIMING: {
        MIN_READING_TIME_MS: 1000,
        MS_PER_WORD: 250,
        READING_RANDOMNESS_MS: 1000,
        SAME_SENDER_DELAY_MS: 600,
        SENDER_CHANGE_DELAY_MS: 1800,
        MESSAGE_VERTICAL_SPACING: 32,
        BOTTOM_MARGIN: 40,
        ANIMATION_END_BUFFER_MS: 2000
      },
      ANIMATION: {
        SCROLL_PIXELS_PER_SEC: 18,
        MIN_SCROLL_DURATION_SEC: 1.2,
        SCROLL_SPEED_MULTIPLIER: 1.0
      },
      CHAT_HEIGHT_PX: 450
    },
    avatars: {
      enabled: true,
      sizePx: 32,
      xOffsetPx: 8
    }
  }
}));

// Mock TextProcessor - FIXED PATH
vi.mock('../../../../src/utils/TextProcessor.js', () => ({
  default: {
    wrapText: vi.fn((text, maxWidth) => ({
      lines: [text || ''],
      width: Math.min(100, maxWidth || 100),
      height: 20,
      lineCount: 1
    })),
    measureTextWidth: vi.fn(text => (text || '').length * 5)
  }
}));

// Mock ChartRenderer - FIXED PATH
vi.mock('../../../../src/rendering/components/ChartRenderer.js', () => ({
  default: {
    calculateDimensions: vi.fn().mockReturnValue({
      width: 200,
      height: 150,
      lineCount: 5
    })
  }
}));

// Import after mocks are set up
import { readFileSync } from 'node:fs';
import TimelineBuilder from '../../../../src/services/TimelineBuilder.js';
import { TypingIndicator, ChatMessage } from '../../../../src/models/TimelineItem.js';
import TimingProfile from '../../../../src/models/TimingProfile.js';
import TextProcessor from '../../../../src/utils/TextProcessor.js';
import ChartRenderer from '../../../../src/rendering/components/ChartRenderer.js';

describe('TimelineBuilder', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock Math.random to return consistent values for predictable tests
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // Always return 0.5
  });
  
  // Add this to your test's afterEach section
  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    Math.random.mockRestore(); // Restore Math.random
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('constructor', () => {
    it('should use custom chat data when provided', () => {
      const customChatData = [
        { id: 'msg1', sender: 'me', text: 'Hello' },
        { id: 'msg2', sender: 'visitor', text: 'Hi there' }
      ];

      const builder = new TimelineBuilder(customChatData);

      expect(builder.chatData).toEqual(customChatData);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Using custom chat data (2 messages)'
      );
    });

    it('should load chat data from file when no custom data provided', () => {
      const mockFileData = JSON.stringify([
        { id: 'file-msg1', sender: 'me', text: 'From file' }
      ]);
      
      readFileSync.mockReturnValue(mockFileData);

      const builder = new TimelineBuilder();

      expect(readFileSync).toHaveBeenCalled();
      expect(builder.chatData).toEqual([
        { id: 'file-msg1', sender: 'me', text: 'From file' }
      ]);
    });

    it('should handle file read error gracefully', () => {
      readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const builder = new TimelineBuilder();

      expect(builder.chatData).toEqual([
        { id: "error-1", sender: "me", text: "Error loading chat data. Please check your configuration." }
      ]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading chat data:',
        expect.any(Error)
      );
    });

    it('should handle null custom chat data by loading from file', () => {
      const mockFileData = JSON.stringify([
        { id: 'null-test', sender: 'visitor', text: 'Loaded from file' }
      ]);
      
      readFileSync.mockReturnValue(mockFileData);

      const builder = new TimelineBuilder(null);

      expect(readFileSync).toHaveBeenCalled();
      expect(builder.chatData[0].text).toBe('Loaded from file');
    });
  });

  describe('calculateTypingTime', () => {
    it('should calculate typing time based on text length', () => {
      const builder = new TimelineBuilder([]);
      
      const shortText = 'Hi';
      const result = builder.calculateTypingTime(shortText);
      
      // shortText.length (2) * TYPING_CHAR_MS (40) = 80, but min is 1600
      expect(result).toBe(1600); // Should use minimum
    });

    it('should respect maximum typing time', () => {
      const builder = new TimelineBuilder([]);
      
      const longText = 'a'.repeat(100); // 100 characters
      const result = builder.calculateTypingTime(longText);
      
      // 100 * 40 = 4000, but max is 3000
      expect(result).toBe(3000); // Should use maximum
    });

    it('should calculate normal typing time for medium text', () => {
      const builder = new TimelineBuilder([]);
      
      const mediumText = 'a'.repeat(50); // 50 characters
      const result = builder.calculateTypingTime(mediumText);
      
      // 50 * 40 = 2000 (between min and max)
      expect(result).toBe(2000);
    });
  });

  describe('calculateReadingTime', () => {
    it('should calculate reading time for text content', () => {
      const builder = new TimelineBuilder([]);
      
      const dimensions = { lineCount: 3 };
      const result = builder.calculateReadingTime('text', dimensions);
      
      // Should be at least MIN_READING_TIME_MS (1000) + some randomness
      expect(result).toBeGreaterThanOrEqual(1000);
      expect(result).toBeLessThanOrEqual(4000); // With randomness factor
    });

    it('should calculate different reading time for chart content', () => {
      const builder = new TimelineBuilder([]);
      
      const dimensions = { lineCount: 2, height: 200 };
      const chartResult = builder.calculateReadingTime('chart', dimensions);
      const textResult = builder.calculateReadingTime('text', dimensions);
      
      // With mocked Math.random(0.5):
      // Chart: 2500 + (0.5 * 1000) = 3000ms
      // Text: 2000 + (0.5 * 1000) = 2500ms
      expect(chartResult).toBeGreaterThan(textResult);
      expect(chartResult).toBe(3000); // Exact value due to mocked randomness
      expect(textResult).toBe(2500);
    });

    it('should handle missing lineCount', () => {
      const builder = new TimelineBuilder([]);
      
      const dimensions = {}; // No lineCount
      const result = builder.calculateReadingTime('text', dimensions);
      
      expect(result).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('calculateSenderTransitionDelay', () => {
    it('should return same sender delay when sender unchanged', () => {
      const builder = new TimelineBuilder([]);
      
      const result = builder.calculateSenderTransitionDelay('me', 'me');
      
      expect(result).toBe(600); // SAME_SENDER_DELAY_MS
    });

    it('should return sender change delay when sender changes', () => {
      const builder = new TimelineBuilder([]);
      
      const result = builder.calculateSenderTransitionDelay('visitor', 'me');
      
      expect(result).toBe(1800); // SENDER_CHANGE_DELAY_MS
    });

    it('should return same sender delay when no previous sender', () => {
      const builder = new TimelineBuilder([]);
      
      const result = builder.calculateSenderTransitionDelay('me', null);
      
      expect(result).toBe(600); // SAME_SENDER_DELAY_MS
    });
  });

  describe('calculateAvailableBubbleWidth', () => {
    it('should calculate width with avatars enabled', () => {
      const builder = new TimelineBuilder([]);
      
      const result = builder.calculateAvailableBubbleWidth();
      
      // MAX_BUBBLE_W_PX (260) - (sizePx (32) + xOffsetPx * 2 (8*2)) = 260 - 48 = 212
      expect(result).toBe(212);
    });
  });

  describe('_calculateChartDimensions', () => {
    it('should call ChartRenderer.calculateDimensions', () => {
      const builder = new TimelineBuilder([]);
      
      const chartData = { type: 'bar', items: [] };
      const result = builder._calculateChartDimensions(chartData);
      
      expect(ChartRenderer.calculateDimensions).toHaveBeenCalledWith(
        chartData,
        expect.any(Object), // theme styles
        212 // available bubble width
      );
      expect(result).toEqual({ width: 200, height: 150, lineCount: 5 });
    });
  });

  describe('buildTimeline', () => {
    it('should build timeline with text messages', () => {
      const chatData = [
        { id: 'msg1', sender: 'me', text: 'Hello {name}!' },
        { id: 'msg2', sender: 'visitor', text: 'Hi there', reaction: '👋' }
      ];

      const builder = new TimelineBuilder(chatData);
      const dynamicData = { name: 'John' };

      const result = builder.buildTimeline(dynamicData);

      // Check structure
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('timings');
      expect(result).toHaveProperty('totalDuration');
      expect(result).toHaveProperty('totalTypingTime');
      expect(result).toHaveProperty('scrollKeyframeData');

      // Check items array has typing indicators and messages
      expect(result.items).toHaveLength(4); // 2 typing + 2 messages
      expect(result.items[0]).toBeInstanceOf(TypingIndicator);
      expect(result.items[1]).toBeInstanceOf(ChatMessage);
      expect(result.items[2]).toBeInstanceOf(TypingIndicator);
      expect(result.items[3]).toBeInstanceOf(ChatMessage);

      // Check text replacement worked
      expect(result.items[1].text).toBe('Hello John!');
      expect(result.items[3].reaction).toBe('👋');

      // Check timings
      expect(result.timings).toBeInstanceOf(TimingProfile);
      expect(result.totalDuration).toBeGreaterThan(0);
      expect(result.totalTypingTime).toBeGreaterThan(0);
    });

    it('should handle chart messages with wakatime data replacement', () => {
      const chatData = [
        {
          id: 'chart1',
          sender: 'me',
          contentType: 'chart',
          chartData: {
            type: 'bar',
            title: 'My coding stats: {wakatime_summary}',
            items: '{wakatime_chart_data}'
          }
        }
      ];

      const builder = new TimelineBuilder(chatData);
      const dynamicData = {
        wakatime_summary: 'Coded for 8 hours',
        wakatime_chart_data: [
          { label: 'JavaScript', value: 60 },
          { label: 'Python', value: 40 }
        ]
      };

      const result = builder.buildTimeline(dynamicData);

      expect(result.items).toHaveLength(2); // 1 typing + 1 chart message
      
      const chartMessage = result.items[1];
      expect(chartMessage).toBeInstanceOf(ChatMessage);
      expect(chartMessage.contentType).toBe('chart');
      expect(chartMessage.chartData.title).toBe('My coding stats: Coded for 8 hours');
      expect(chartMessage.chartData.items).toEqual([
        { label: 'JavaScript', value: 60 },
        { label: 'Python', value: 40 }
      ]);

      // Verify ChartRenderer was called for dimensions
      expect(ChartRenderer.calculateDimensions).toHaveBeenCalled();
    });

    it('should handle timeline positioning and timing correctly', () => {
      const chatData = [
        { id: 'msg1', sender: 'me', text: 'First message' },
        { id: 'msg2', sender: 'visitor', text: 'Second message' }
      ];

      const builder = new TimelineBuilder(chatData);
      const result = builder.buildTimeline({});

      // Check that timing progresses correctly
      expect(result.items[0].startTime).toBe(600); // Initial sender delay
      expect(result.items[1].startTime).toBeGreaterThan(result.items[0].startTime);
      expect(result.items[2].startTime).toBeGreaterThan(result.items[1].startTime);
      expect(result.items[3].startTime).toBeGreaterThan(result.items[2].startTime);

      // Check Y positioning
      expect(result.items[0].y).toBe(10); // Initial Y
      expect(result.items[1].y).toBe(10); // Same as typing indicator
      expect(result.items[2].y).toBeGreaterThan(10); // Next message lower
      expect(result.items[3].y).toBe(result.items[2].y); // Same as its typing indicator
    });

    it('should generate scroll keyframe data', () => {
      const chatData = [
        { id: 'msg1', sender: 'me', text: 'Message 1' },
        { id: 'msg2', sender: 'visitor', text: 'Message 2' }
      ];

      const builder = new TimelineBuilder(chatData);
      const result = builder.buildTimeline({});

      expect(result.scrollKeyframeData).toHaveLength(2);
      expect(result.scrollKeyframeData[0]).toHaveProperty('y');
      expect(result.scrollKeyframeData[0]).toHaveProperty('startTime');
      expect(result.scrollKeyframeData[1].y).toBeGreaterThan(result.scrollKeyframeData[0].y);
    });

    it('should handle chart messages in scroll keyframes', () => {
      const chatData = [
        {
          id: 'chart1',
          sender: 'me',
          contentType: 'chart',
          chartData: { type: 'bar', items: [] }
        }
      ];

      const builder = new TimelineBuilder(chatData);
      const result = builder.buildTimeline({});

      // Chart messages should generate extra scroll keyframes
      expect(result.scrollKeyframeData.length).toBeGreaterThanOrEqual(2);
    });

    it('should calculate scroll metrics correctly', () => {
      const chatData = [
        { id: 'msg1', sender: 'me', text: 'Test message' }
      ];

      const builder = new TimelineBuilder(chatData);
      const result = builder.buildTimeline({});

      // Check that timing profile has scroll data
      expect(result.timings.scrollPixelsPerSec).toBeGreaterThan(0);
      expect(result.timings.scrollDurationSec).toBeGreaterThanOrEqual(0);
      expect(result.timings.scrollDistance).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty chat data', () => {
      const builder = new TimelineBuilder([]);
      const result = builder.buildTimeline({});

      expect(result.items).toHaveLength(0);
      expect(result.timings.perMessage).toHaveLength(0);
      expect(result.totalTypingTime).toBe(0);
      expect(result.scrollKeyframeData).toHaveLength(0);
    });

    it('should ensure TextProcessor.wrapText is called correctly', () => {
      const chatData = [
        { id: 'msg1', sender: 'me', text: 'Test message' }
      ];

      const builder = new TimelineBuilder(chatData);
      builder.buildTimeline({});

      expect(TextProcessor.wrapText).toHaveBeenCalledWith('Test message', 212);
    });
  });
});