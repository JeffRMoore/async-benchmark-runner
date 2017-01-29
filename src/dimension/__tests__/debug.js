/* @flow */

import {
  DebugDimension
} from '../debug';

describe('DebugDimension', () => {
  /* @TODO How do you expect() console output during a test? */
  it('produces consequitive measurements', () => {
    expect(DebugDimension.stopMeasuring(DebugDimension.startMeasuring())).toBeGreaterThanOrEqual(0);
  });
});
