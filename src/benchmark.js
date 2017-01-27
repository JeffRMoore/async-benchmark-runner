/* @flow */

/**
 * Describe a synchronous benchmark
 */
export type SynchronousBenchmark =
  {
    name: string;
    setUp?: () => void;
    tearDown?: () => void;
    run: () => any;
  }

/**
 * Describe an asynchronous benchmark
 */
export type ASynchronousBenchmark =
  {
    name: string;
    setUp?: () => void;
    tearDown?: () => void;
    startRunning : () => Promise<*>;
  }

/**
 * Supported benchmarking styles
 */
export type Benchmark = SynchronousBenchmark | ASynchronousBenchmark;
