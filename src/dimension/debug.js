/* @flow */

import type {
  Dimension
} from './type';

/**
 * Utility object to help debug node optimizations during measurement
 */
export const DebugDimension: Dimension<*> = {
  name: 'debug',
  displayName: 'debugging',
  units: '-',
  startMeasuring: () => {
    process.stdout.write('[[[ START measuring --');
    return 0;
  },
  stopMeasuring: () => {
    process.stdout.write('-- STOP measuring ]]]\n');
    return 0;
  }
};
