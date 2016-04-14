/* @flow */

import type {
  Dimension
} from './type';

/**
 * Utility object describing how to measure time
 */
export const TimeDimension: Dimension = {
  name: 'time',
  displayName: 'Elapsed Time',
  units: 'ns',
  startMeasuring: () => process.hrtime(),
  stopMeasuring: startTime => {
    const nanoSecondsPerSecond = 1e9;
    const elapsed = process.hrtime(startTime);
    return elapsed[0] * nanoSecondsPerSecond + elapsed[1];
  }
};
