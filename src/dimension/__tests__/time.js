/* @flow */

import {
  TimeDimension
} from '../time';

describe('TimeDimension', () => {
  it('produces consequitive measurements', () => {
    expect(TimeDimension.stopMeasuring(TimeDimension.startMeasuring())).toBeGreaterThanOrEqual(0);
  });
});
