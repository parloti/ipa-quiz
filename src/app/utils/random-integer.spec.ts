import { describe, expect, it } from 'vitest';
import { randomInteger } from './random-integer';

describe(randomInteger.name, () => {
  it(`should return random between`, () => {
    [
      [0, 0],
      [1, 1],
      [1, 0],
      [1, 2],
      [-1, 0],
      [-1, 1],
    ].forEach(([min, max]) => {
      const result = randomInteger(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThan(max);
    });
  });
});
