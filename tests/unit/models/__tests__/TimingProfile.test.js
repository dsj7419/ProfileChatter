/**
 * Unit tests for TimingProfile.js
 * Tests timing profile data model and calculation methods
 */
import { describe, it, expect } from 'vitest';
import TimingProfile from '../../../../src/models/TimingProfile.js';

describe('TimingProfile', () => {
  describe('constructor', () => {
    it('should correctly assign all properties', () => {
      const perMessage = [
        { typingMs: 1000, readingMs: 2000, senderDelayMs: 500 },
        { typingMs: 1500, readingMs: 1800, senderDelayMs: 300 }
      ];
      
      const timingProfile = new TimingProfile(18, 2.5, 45, perMessage);
      
      expect(timingProfile.scrollPixelsPerSec).toBe(18);
      expect(timingProfile.scrollDurationSec).toBe(2.5);
      expect(timingProfile.scrollDistance).toBe(45);
      expect(timingProfile.perMessage).toEqual(perMessage);
    });

    it('should handle zero values', () => {
      const timingProfile = new TimingProfile(0, 0, 0, []);
      
      expect(timingProfile.scrollPixelsPerSec).toBe(0);
      expect(timingProfile.scrollDurationSec).toBe(0);
      expect(timingProfile.scrollDistance).toBe(0);
      expect(timingProfile.perMessage).toEqual([]);
    });

    it('should handle large values', () => {
      const perMessage = [
        { typingMs: 5000, readingMs: 8000, senderDelayMs: 2000 }
      ];
      
      const timingProfile = new TimingProfile(100, 10.25, 1025, perMessage);
      
      expect(timingProfile.scrollPixelsPerSec).toBe(100);
      expect(timingProfile.scrollDurationSec).toBe(10.25);
      expect(timingProfile.scrollDistance).toBe(1025);
      expect(timingProfile.perMessage).toHaveLength(1);
    });
  });

  describe('getTotalDuration', () => {
    it('should return correct duration with empty perMessage array and zero scroll', () => {
      const timingProfile = new TimingProfile(0, 0, 0, []);
      const result = timingProfile.getTotalDuration();
      expect(result).toBe(0);
    });

    it('should return correct duration with empty perMessage array but non-zero scroll', () => {
      const timingProfile = new TimingProfile(20, 3.0, 60, []);
      const result = timingProfile.getTotalDuration();
      expect(result).toBe(3000); // 3.0 seconds * 1000
    });

    it('should calculate duration with single message and no scroll', () => {
      const perMessage = [
        { typingMs: 1000, readingMs: 2000, senderDelayMs: 500 }
      ];
      const timingProfile = new TimingProfile(0, 0, 0, perMessage);
      const result = timingProfile.getTotalDuration();
      expect(result).toBe(3500); // 1000 + 2000 + 500
    });

    it('should calculate duration with multiple messages and scroll time', () => {
      const perMessage = [
        { typingMs: 1000, readingMs: 2000, senderDelayMs: 500 },
        { typingMs: 1500, readingMs: 1800, senderDelayMs: 300 },
        { typingMs: 800, readingMs: 1200, senderDelayMs: 400 }
      ];
      const timingProfile = new TimingProfile(25, 2.4, 60, perMessage);
      
      // Message times: (1000+2000+500) + (1500+1800+300) + (800+1200+400) = 3500 + 3600 + 2400 = 9500
      // Scroll time: 2.4 * 1000 = 2400
      // Total: 9500 + 2400 = 11900
      const result = timingProfile.getTotalDuration();
      expect(result).toBe(11900);
    });

    it('should include endBufferMs when provided', () => {
      const perMessage = [
        { typingMs: 1000, readingMs: 1000, senderDelayMs: 500 }
      ];
      const timingProfile = new TimingProfile(20, 1.5, 30, perMessage);
      
      // Message time: 1000 + 1000 + 500 = 2500
      // Scroll time: 1.5 * 1000 = 1500
      // End buffer: 2000
      // Total: 2500 + 1500 + 2000 = 6000
      const result = timingProfile.getTotalDuration(2000);
      expect(result).toBe(6000);
    });

    it('should handle zero values in message timings', () => {
      const perMessage = [
        { typingMs: 0, readingMs: 1000, senderDelayMs: 0 },
        { typingMs: 500, readingMs: 0, senderDelayMs: 200 }
      ];
      const timingProfile = new TimingProfile(15, 1.2, 18, perMessage);
      
      // Message times: (0+1000+0) + (500+0+200) = 1000 + 700 = 1700
      // Scroll time: 1.2 * 1000 = 1200
      // Total: 1700 + 1200 = 2900
      const result = timingProfile.getTotalDuration();
      expect(result).toBe(2900);
    });

    it('should handle fractional scroll duration', () => {
      const perMessage = [
        { typingMs: 1000, readingMs: 1000, senderDelayMs: 500 }
      ];
      const timingProfile = new TimingProfile(30, 1.25, 37.5, perMessage);
      
      // Message time: 2500
      // Scroll time: 1.25 * 1000 = 1250
      // Total: 2500 + 1250 = 3750
      const result = timingProfile.getTotalDuration();
      expect(result).toBe(3750);
    });
  });

  describe('getTotalTypingTime', () => {
    it('should return 0 for empty perMessage array', () => {
      const timingProfile = new TimingProfile(20, 2.0, 40, []);
      const result = timingProfile.getTotalTypingTime();
      expect(result).toBe(0);
    });

    it('should sum only typingMs values from single message', () => {
      const perMessage = [
        { typingMs: 1500, readingMs: 2000, senderDelayMs: 500 }
      ];
      const timingProfile = new TimingProfile(20, 2.0, 40, perMessage);
      const result = timingProfile.getTotalTypingTime();
      expect(result).toBe(1500);
    });

    it('should sum only typingMs values from multiple messages', () => {
      const perMessage = [
        { typingMs: 1000, readingMs: 2000, senderDelayMs: 500 },
        { typingMs: 1500, readingMs: 1800, senderDelayMs: 300 },
        { typingMs: 800, readingMs: 1200, senderDelayMs: 400 }
      ];
      const timingProfile = new TimingProfile(25, 2.4, 60, perMessage);
      
      // Only typing times: 1000 + 1500 + 800 = 3300
      const result = timingProfile.getTotalTypingTime();
      expect(result).toBe(3300);
    });

    it('should handle zero typingMs values', () => {
      const perMessage = [
        { typingMs: 0, readingMs: 1000, senderDelayMs: 500 },
        { typingMs: 1200, readingMs: 0, senderDelayMs: 300 },
        { typingMs: 0, readingMs: 1500, senderDelayMs: 0 }
      ];
      const timingProfile = new TimingProfile(15, 1.8, 27, perMessage);
      
      // Only typing times: 0 + 1200 + 0 = 1200
      const result = timingProfile.getTotalTypingTime();
      expect(result).toBe(1200);
    });

    it('should handle all zero typingMs values', () => {
      const perMessage = [
        { typingMs: 0, readingMs: 1000, senderDelayMs: 500 },
        { typingMs: 0, readingMs: 1500, senderDelayMs: 300 }
      ];
      const timingProfile = new TimingProfile(20, 1.5, 30, perMessage);
      
      const result = timingProfile.getTotalTypingTime();
      expect(result).toBe(0);
    });

    it('should not include readingMs or senderDelayMs in calculation', () => {
      const perMessage = [
        { typingMs: 500, readingMs: 9999, senderDelayMs: 8888 },
        { typingMs: 750, readingMs: 7777, senderDelayMs: 6666 }
      ];
      const timingProfile = new TimingProfile(30, 2.5, 75, perMessage);
      
      // Should only sum typingMs: 500 + 750 = 1250
      const result = timingProfile.getTotalTypingTime();
      expect(result).toBe(1250);
    });
  });
});