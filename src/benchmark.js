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
    startRunning: () => Promise<*>;
  }

/**
 * Supported benchmarking styles
 */
export type Benchmark = SynchronousBenchmark | ASynchronousBenchmark;

/**
 * A set of sample measurements
 */
export type Samples = Array<number>;

/**
 * Result of running one benchmark
 */
export type BenchmarkResult =
  {
    name: string;
    isAsynchronous: boolean;
    opsPerSample: number;
    numSamples: number;
    samples: { [measurementName: string]: Samples };
  }

/**
 * Result of running a suite of benchmarks
 */
export type BenchmarkSuiteResult =
  {
    name: string;
    startTime: number;
    dimensions: Array<string>;
    results: Array<BenchmarkResult>;
  }
