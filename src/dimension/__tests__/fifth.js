/* @flow */

import {
  FifthDimension
} from '../fifth';

describe('FifthDimension', () => {
  it('produces positive numerical results', () => {
    expect(FifthDimension.stopMeasuring(FifthDimension.startMeasuring())).toBeGreaterThanOrEqual(0);
  });
});
