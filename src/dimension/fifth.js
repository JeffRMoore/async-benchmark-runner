/* @flow */

import type {
  Dimension
} from './type';

/**
 * The FifthDimension returns a constant measurement, 5, and is used for testing
 */
export const FifthDimension: Dimension<*> = {
  name: 'fifth',
  displayName: 'fifth',
  units: '-',
  startMeasuring: () => 3,
  stopMeasuring: start => start + 2
};
