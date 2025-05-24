/**
 * Unit tests for dateHelper.js
 * Tests date creation with proper month adjustment
 */
import { describe, it, expect } from 'vitest';
import { makeDate } from '../../../../src/utils/dateHelper.js';

describe('dateHelper', () => {
  describe('makeDate', () => {
    it('should create a standard date correctly', () => {
      const date = makeDate(2023, 5, 15);
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(4); // May is month 4 in JS (0-indexed)
      expect(date.getDate()).toBe(15);
    });

    it('should handle leap year date correctly', () => {
      const date = makeDate(2024, 2, 29); // Feb 29, 2024 (leap year)
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(1); // February is month 1 in JS
      expect(date.getDate()).toBe(29);
    });

    it('should handle beginning of year correctly', () => {
      const date = makeDate(2023, 1, 1); // January 1, 2023
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(0); // January is month 0 in JS
      expect(date.getDate()).toBe(1);
    });

    it('should handle end of year correctly', () => {
      const date = makeDate(2023, 12, 31); // December 31, 2023
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(11); // December is month 11 in JS
      expect(date.getDate()).toBe(31);
    });

    it('should handle end of month correctly', () => {
      const date = makeDate(2023, 4, 30); // April 30, 2023
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(3); // April is month 3 in JS
      expect(date.getDate()).toBe(30);
    });

    it('should correctly adjust 1-indexed month to 0-indexed', () => {
      const julyDate = makeDate(2023, 7, 15); // July 15, 2023
      expect(julyDate.getMonth()).toBe(6); // July is month 6 in JS
      
      const decemberDate = makeDate(2023, 12, 25); // December 25, 2023
      expect(decemberDate.getMonth()).toBe(11); // December is month 11 in JS
    });
  });
});