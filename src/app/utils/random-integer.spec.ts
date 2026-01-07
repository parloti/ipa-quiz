import { describe, expect, it } from 'vitest';
import { randomInteger } from './random-integer';

describe(randomInteger.name, () => {
  it(`should return random between min and max`, () => {
    [
      [1, 2],
      [-1, 0],
      [-1, 1],
    ].forEach(([min, max]) => {
      const result = randomInteger(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThan(max);
    });
  });

  it(`should return max if range is empty`, () => {
    [-2, -1, 0, 1, 2].forEach(max => {
      const result = randomInteger(max, max);
      expect(result).toBe(max);
    });
  });

  it(`should swap range if min is greater than max`, () => {
    [
      [1, 0],
      [2, 1],
      [-1, -2],
      [1, -1],
    ].forEach(([min, max]) => {
      const result = randomInteger(min, max);
      expect(result).toBeGreaterThanOrEqual(max);
      expect(result).toBeLessThan(min);
    });
  });
});
