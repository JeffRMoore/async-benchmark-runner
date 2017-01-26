/* @flow */

import type {
  Dimension
} from './type';

/**
 * Utility object describing how to measure memory
 */
export const MemoryDimension: Dimension<*> = {
  name: 'memory',
  displayName: 'Memory',
  units: 'b',
  startMeasuring: () => process.memoryUsage(),
  stopMeasuring: startMemory => {
    const memory = process.memoryUsage();
    return memory.heapUsed - startMemory.heapUsed;
  }
};
