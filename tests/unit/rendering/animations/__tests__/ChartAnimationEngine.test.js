/**
 * Unit tests for ChartAnimationEngine.js
 * Tests static methods that generate SVG animation markup
 */
import { describe, it, expect } from 'vitest';
import ChartAnimationEngine from '../../../../../src/rendering/animations/ChartAnimationEngine.js';

describe('ChartAnimationEngine', () => {
  describe('getDonutSegmentDrawAnimation', () => {
    it('should generate correct SVG animate tags for donut segment drawing', () => {
      const result = ChartAnimationEngine.getDonutSegmentDrawAnimation(
        'segment-1', 
        100, 
        1.0, 
        0.5
      );

      expect(result).toContain('<animate attributeName="stroke-dashoffset"');
      expect(result).toContain('from="100" to="0"');
      expect(result).toContain('dur="0.5s"'); // Capped at 0.5s
      expect(result).toContain('begin="0.5s"');
      expect(result).toContain('calcMode="spline"');
      expect(result).toContain('keySplines="0.215,0.61,0.355,1"');
      expect(result).toContain('fill="freeze"');
      
      // Should also contain opacity animation
      expect(result).toContain('<animate attributeName="opacity"');
      expect(result).toContain('from="0" to="1"');
      expect(result).toContain('dur="0.25s"'); // Half of actualDuration
    });

    it('should cap duration at 0.5 seconds', () => {
      const result = ChartAnimationEngine.getDonutSegmentDrawAnimation(
        'segment-1', 
        100, 
        2.0, // Large duration
        0.0
      );

      expect(result).toContain('dur="0.5s"');
      expect(result).toContain('dur="0.25s"'); // Opacity duration
    });

    it('should handle different begin times', () => {
      const result = ChartAnimationEngine.getDonutSegmentDrawAnimation(
        'segment-1', 
        50, 
        0.3, 
        1.2
      );

      expect(result).toContain('begin="1.2s"');
      expect(result).toContain('from="50" to="0"');
    });

    it('should handle zero duration', () => {
      const result = ChartAnimationEngine.getDonutSegmentDrawAnimation(
        'segment-1', 
        75, 
        0, 
        0
      );

      expect(result).toContain('dur="0s"');
      expect(result).toContain('begin="0s"');
    });
  });

  describe('getBarGrowAnimation', () => {
    it('should generate correct SVG animate tags for bar growth', () => {
      const result = ChartAnimationEngine.getBarGrowAnimation(200, 1.0, 0.3);

      expect(result).toContain('<animate attributeName="width"');
      expect(result).toContain('from="0" to="200"');
      expect(result).toContain('dur="0.7s"'); // Capped at 0.7s
      expect(result).toContain('begin="0.3s"');
      expect(result).toContain('fill="freeze"');
      
      // Should also contain opacity animation
      expect(result).toContain('<animate attributeName="opacity"');
      expect(result).toContain('from="0" to="1"');
      expect(result).toContain('dur="0.7s"');
    });

    it('should cap duration at 0.7 seconds', () => {
      const result = ChartAnimationEngine.getBarGrowAnimation(150, 2.5, 0);

      expect(result).toContain('dur="0.7s"');
    });

    it('should handle different widths and begin times', () => {
      const result = ChartAnimationEngine.getBarGrowAnimation(350, 0.5, 1.8);

      expect(result).toContain('from="0" to="350"');
      expect(result).toContain('begin="1.8s"');
      expect(result).toContain('dur="0.5s"');
    });

    it('should handle zero width', () => {
      const result = ChartAnimationEngine.getBarGrowAnimation(0, 0.4, 0.1);

      expect(result).toContain('from="0" to="0"');
      expect(result).toContain('dur="0.4s"');
      expect(result).toContain('begin="0.1s"');
    });

    it('should handle negative begin time', () => {
      const result = ChartAnimationEngine.getBarGrowAnimation(100, 0.6, -0.2);

      expect(result).toContain('begin="-0.2s"');
    });
  });
});