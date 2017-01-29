/* @flow */

import type {
  Dimension
} from './type';

/**
 * The FifthDimension returns a constant measurement, 5, and is used for testing
 */
export const FifthDimension: Dimension<number> = {
  name: 'fifth',
  displayName: 'fifth',
  units: '-',
  startMeasuring: (): number => 3,
  stopMeasuring: (start: number): number => start + 2
};
