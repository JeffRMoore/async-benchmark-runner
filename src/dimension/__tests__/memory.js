/* @flow */

import {
  MemoryDimension
} from '../memory';

describe('MemoryDimension', () => {
  it('produces consequitive measurements', () => {
    expect(MemoryDimension.stopMeasuring(MemoryDimension.startMeasuring()))
      .toBeGreaterThanOrEqual(0);
  });
});
