/* @flow */

import type {
  Dimension
} from './type';

/**
 * Utility object to help debug node optimizations during measurement
 */
export const DebugDimension: Dimension<void> = {
  name: 'debug',
  displayName: 'debugging',
  units: '-',
  startMeasuring: (): void => {
    process.stdout.write('[[[ START measuring --');
  },
  stopMeasuring: (): number => {
    process.stdout.write('-- STOP measuring ]]]\n');
    return 0;
  }
};
