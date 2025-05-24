/**
 * Unit tests for ScrollAnimationEngine.js
 * Tests scroll animation keyframes generation
 */
import { describe, it, expect } from 'vitest';
import ScrollAnimationEngine from '../../../../src/rendering/ScrollAnimationEngine.js';

describe('ScrollAnimationEngine', () => {
  describe('generateScrollKeyframesCSS', () => {
    it('should return basic no-op animation for empty scrollSteps', () => {
      const result = ScrollAnimationEngine.generateScrollKeyframesCSS(
        [],
        10,
        'testAnimation',
        0
      );

      expect(result).toBe('@keyframes testAnimation{0%{transform:translateY(0)}100%{transform:translateY(0)}}');
    });

    it('should return basic no-op animation for null scrollSteps', () => {
      const result = ScrollAnimationEngine.generateScrollKeyframesCSS(
        null,
        5,
        'scrollUp',
        100
      );

      expect(result).toBe('@keyframes scrollUp{0%{transform:translateY(0)}100%{transform:translateY(0)}}');
    });

    it('should generate keyframes with single scroll step', () => {
      const scrollSteps = [
        { y: 100, startTime: 2000 }
      ];

      const result = ScrollAnimationEngine.generateScrollKeyframesCSS(
        scrollSteps,
        10, // 10 seconds total
        'scrollUp',
        0
      );

      expect(result).toContain('@keyframes scrollUp');
      expect(result).toContain('0% { transform: translateY(0px); }');
      expect(result).toContain('20%'); // Should contain the correct percentage
      expect(result).toContain('100%'); // Should have final keyframe
    });

    it('should generate keyframes with multiple scroll steps', () => {
      const scrollSteps = [
        { y: 50, startTime: 1000 },
        { y: 150, startTime: 3000 },
        { y: 200, startTime: 4000 }
      ];

      const result = ScrollAnimationEngine.generateScrollKeyframesCSS(
        scrollSteps,
        5, // 5 seconds total
        'scrollUp',
        0
      );

      expect(result).toContain('0% { transform: translateY(0px); }');
      expect(result).toContain('20%'); // 1000ms / 5000ms = 20%
      expect(result).toContain('60%'); // 3000ms / 5000ms = 60%
      expect(result).toContain('80%'); // 4000ms / 5000ms = 80%
      expect(result).toContain('100%');
    });

    it('should add intermediate keyframes for smooth transitions', () => {
      const scrollSteps = [
        { y: 0, startTime: 0 },
        { y: 300, startTime: 5000 } // Large gap and movement
      ];

      const result = ScrollAnimationEngine.generateScrollKeyframesCSS(
        scrollSteps,
        10, // 10 seconds total
        'scrollUp',
        0
      );

      // Should have basic keyframes
      expect(result).toContain('0% { transform: translateY(0px); }');
      expect(result).toContain('50%'); // Should have the 50% keyframe
      
      // Should contain multiple keyframes for smooth animation
      const percentMatches = result.match(/(\d+)% \{/g);
      expect(percentMatches.length).toBeGreaterThan(2); // More than just start and end
    });

    it('should not add intermediate keyframes for small gaps', () => {
      const scrollSteps = [
        { y: 50, startTime: 1000 },
        { y: 100, startTime: 1200 } // Only 200ms gap, 2% difference
      ];

      const result = ScrollAnimationEngine.generateScrollKeyframesCSS(
        scrollSteps,
        10, // 10 seconds total
        'scrollUp',
        0
      );

      // Should contain the basic keyframes without intermediate ones for small gaps
      expect(result).toContain('10%'); // 1000ms / 10000ms = 10%
      expect(result).toContain('12%'); // 1200ms / 10000ms = 12%
      
      // Should not have intermediate percentages like 11%
      expect(result).not.toContain('11%');
    });

    it('should cap translateY values at minimum', () => {
      const scrollSteps = [
        { y: 100, startTime: 1000 },
        { y: 500, startTime: 2000 } // Large Y value
      ];

      const result = ScrollAnimationEngine.generateScrollKeyframesCSS(
        scrollSteps,
        5,
        'scrollUp',
        0
      );

      // All translateY values should be 0 or negative (upward scroll)
      const translateYMatches = result.match(/translateY\(([-\d.]+)px\)/g);
      translateYMatches.forEach(match => {
        const value = parseFloat(match.match(/([-\d.]+)/)[1]);
        expect(value).toBeLessThanOrEqual(0);
      });
    });

    it('should use scrollDistance for final position when provided', () => {
      const scrollSteps = [
        { y: 200, startTime: 2000 }
      ];

      const result = ScrollAnimationEngine.generateScrollKeyframesCSS(
        scrollSteps,
        5,
        'scrollUp',
        400 // scrollDistance
      );

      expect(result).toContain('100% { transform: translateY(-400px); }');
    });

    it('should use calculated final position when scrollDistance is 0', () => {
      const scrollSteps = [
        { y: 800, startTime: 2000 }
      ];

      const result = ScrollAnimationEngine.generateScrollKeyframesCSS(
        scrollSteps,
        5,
        'scrollUp',
        0
      );

      // Should use -max(0, lastStep.y - 300) = -(800 - 300) = -500
      expect(result).toContain('100% { transform: translateY(-500px); }');
    });

    it('should handle custom animation name', () => {
      const scrollSteps = [
        { y: 100, startTime: 1000 }
      ];

      const result = ScrollAnimationEngine.generateScrollKeyframesCSS(
        scrollSteps,
        5,
        'customScrollAnimation',
        0
      );

      expect(result).toContain('@keyframes customScrollAnimation');
    });

    it('should default to scrollUp animation name', () => {
      const scrollSteps = [
        { y: 100, startTime: 1000 }
      ];

      const result = ScrollAnimationEngine.generateScrollKeyframesCSS(
        scrollSteps,
        5
      );

      expect(result).toContain('@keyframes scrollUp');
    });

    it('should handle zero duration gracefully', () => {
      const scrollSteps = [
        { y: 100, startTime: 0 }
      ];

      const result = ScrollAnimationEngine.generateScrollKeyframesCSS(
        scrollSteps,
        0,
        'scrollUp',
        0
      );

      // Should not crash and should contain valid CSS
      expect(result).toContain('@keyframes scrollUp');
      expect(result).toContain('transform: translateY');
    });

    it('should fix overshooting keyframes', () => {
      const scrollSteps = [
        { y: 100, startTime: 1000 },
        { y: 50, startTime: 2000 } // Y goes backwards, could cause overshoot
      ];

      const result = ScrollAnimationEngine.generateScrollKeyframesCSS(
        scrollSteps,
        5,
        'scrollUp',
        200 // Final scroll distance
      );

      // All translateY values should not be more negative than -200px
      const translateYMatches = result.match(/translateY\(([-\d.]+)px\)/g);
      translateYMatches.forEach(match => {
        const value = parseFloat(match.match(/([-\d.]+)/)[1]);
        expect(value).toBeGreaterThanOrEqual(-200);
      });
    });

    it('should round percentages to integers', () => {
      const scrollSteps = [
        { y: 100, startTime: 1333 } // Should result in 26.66% -> 27%
      ];

      const result = ScrollAnimationEngine.generateScrollKeyframesCSS(
        scrollSteps,
        5,
        'scrollUp',
        0
      );

      // Should contain rounded percentage
      expect(result).toContain('27%'); // Rounded from 26.66%
      expect(result).not.toContain('26.66%');
    });
  });
});