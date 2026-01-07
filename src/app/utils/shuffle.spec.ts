import { describe, expect, it } from 'vitest';
import { shuffle } from './shuffle';

describe('shuffle', () => {
  it('should shuffle the array in place', () => {
    const array = [1, 2, 3, 4, 5];
    const original = [...array];
    shuffle(array);
    expect(array).toHaveLength(5);
    expect(array).toEqual(expect.arrayContaining(original));
    // Since it's random, hard to test more, but at least it doesn't crash
  });

  it('should handle empty array', () => {
    const array: number[] = [];
    shuffle(array);
    expect(array).toEqual([]);
  });

  it('should handle single element', () => {
    const array = [1];
    shuffle(array);
    expect(array).toEqual([1]);
  });
});
