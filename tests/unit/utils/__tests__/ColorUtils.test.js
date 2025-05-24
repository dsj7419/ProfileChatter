/**
 * Unit tests for ColorUtils.js
 * Tests color manipulation and contrast calculation functions
 */
import { describe, it, expect } from 'vitest';
import { getContrastRatio, darken, lighten } from '../../../../src/utils/ColorUtils.js';

describe('ColorUtils', () => {
  describe('getContrastRatio', () => {
    it('should return maximum contrast ratio for black vs white', () => {
      const ratio = getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should return 1 for identical colors', () => {
      const ratio = getContrastRatio('#ff0000', '#ff0000');
      expect(ratio).toBe(1);
    });

    it('should calculate low contrast between similar colors', () => {
      const ratio = getContrastRatio('#808080', '#888888');
      expect(ratio).toBeLessThan(2);
      expect(ratio).toBeGreaterThan(1);
    });

    it('should calculate high contrast for complementary colors', () => {
      const ratio = getContrastRatio('#0000ff', '#ffff00');
      expect(ratio).toBeGreaterThan(8);
    });

    it('should handle 3-digit hex format', () => {
      const ratio3Digit = getContrastRatio('#000', '#fff');
      const ratio6Digit = getContrastRatio('#000000', '#ffffff');
      expect(ratio3Digit).toBeCloseTo(ratio6Digit, 1);
    });

    it('should handle mixed hex formats', () => {
      const ratio = getContrastRatio('#f00', '#00ff00');
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(21);
    });
  });

  describe('darken', () => {
    it('should darken white by 50%', () => {
      const result = darken('#ffffff', 0.5);
      expect(result).toBe('#7f7f7f'); // 255 * 0.5 = 127.5 -> Math.floor = 127 -> 0x7F
    });

    it('should darken mid-tone color by 20%', () => {
      const result = darken('#808080', 0.2);
      expect(result).toBe('#666666');
    });

    it('should keep black unchanged when darkened', () => {
      const result = darken('#000000', 0.5);
      expect(result).toBe('#000000');
    });

    it('should not change color when amount is 0', () => {
      const result = darken('#ff6600', 0);
      expect(result).toBe('#ff6600');
    });

    it('should make color black when amount is 1', () => {
      const result = darken('#ff6600', 1);
      expect(result).toBe('#000000');
    });
  });

  describe('lighten', () => {
    it('should lighten black by 50%', () => {
      const result = lighten('#000000', 0.5);
      expect(result).toBe('#7f7f7f'); // 0 + (255-0) * 0.5 = 127.5 -> Math.floor = 127 -> 0x7F
    });

    it('should lighten mid-tone color by 20%', () => {
      const result = lighten('#808080', 0.2);
      expect(result).toBe('#999999');
    });

    it('should keep white unchanged when lightened', () => {
      const result = lighten('#ffffff', 0.5);
      expect(result).toBe('#ffffff');
    });

    it('should not change color when amount is 0', () => {
      const result = lighten('#336699', 0);
      expect(result).toBe('#336699');
    });

    it('should make color white when amount is 1', () => {
      const result = lighten('#336699', 1);
      expect(result).toBe('#ffffff');
    });
  });
});