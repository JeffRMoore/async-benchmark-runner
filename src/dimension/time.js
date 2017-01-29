/* @flow */

import type {
  Dimension
} from './type';

export type NodeHighResolutionTime = [number, number];

/**
 * Utility object describing how to measure time
 */
export const TimeDimension: Dimension<NodeHighResolutionTime> = {
  name: 'time',
  displayName: 'Elapsed Time',
  units: 'ns',
  startMeasuring: (): NodeHighResolutionTime => process.hrtime(),
  stopMeasuring: (startTime: NodeHighResolutionTime): number => {
    const nanoSecondsPerSecond = 1e9;
    const elapsed = process.hrtime(startTime);
    return (elapsed[0] * nanoSecondsPerSecond) + elapsed[1];
  }
};
