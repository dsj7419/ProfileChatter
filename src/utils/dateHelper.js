/**
 * makeDate(year, month, day)
 * Month is 1‑based (January = 1, December = 12)
 *
 *   makeDate(2007, 5, 16)  ➜  Date object for 2007‑05‑16
 */
export function makeDate(year, month, day) {
    return new Date(year, month - 1, day);   // convert to JS zero‑based month
  }
  