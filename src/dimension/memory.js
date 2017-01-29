/* @flow */

import type {
  Dimension
} from './type';

export type NodeProcessMemoryUsage = {
  rss: number,
  heapTotal: number,
  heapUsed: number
  /*
  Not defined in flow/lib/node.js
  but is defined at https://nodejs.org/api/process.html#process_process_memoryusage
  external: number
  */
};

/**
 * Utility object describing how to measure memory
 */
export const MemoryDimension: Dimension<NodeProcessMemoryUsage> = {
  name: 'memory',
  displayName: 'Memory',
  units: 'b',
  startMeasuring: (): NodeProcessMemoryUsage => process.memoryUsage(),
  stopMeasuring: (startMemory: NodeProcessMemoryUsage): number => {
    const memory = process.memoryUsage();
    return memory.heapUsed - startMemory.heapUsed;
  }
};
