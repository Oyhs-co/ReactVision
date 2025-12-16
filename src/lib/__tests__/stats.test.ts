import { expect, test } from 'vitest';
import { median, removeOutliers } from '../stats';

test('median odd length', () => {
  expect(median([3, 1, 2])).toBe(2);
});

test('remove outliers', () => {
  const { filtered } = removeOutliers([100, 110, 120, 300, 400]);
  expect(filtered).toEqual([100, 110, 120]);
});