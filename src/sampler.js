/* @flow */

import type {
  ASynchronousBenchmark,
  SynchronousBenchmark,
  Benchmark
} from './benchmark';

import {
  startMeasuring,
  stopMeasuring,
  type Measurements,
  type DimensionList
} from './dimension/list';

/**
 * Callback that is called with a Sample when benchmarking is complete
 */
type completeFn = (sample: Measurements) => void;

/**
 * Callback that is called with an Error when a benchmark cannot be completed
 */
type rejectFn = (err: Error) => void;

/**
 * Put memory into a stable state if we can to avoid triggering gc during a
 * sample run
 */
function cleanUpMemory() {
  if (global.gc) {
    global.gc();
  }
}

/**
 *  Setup benchmark resources before running
 *  @TODO how to wait for an async setup?
 */
export function setUpBenchmark(benchmark: Benchmark): Error | false {
  if (typeof benchmark.setUp === 'function') {
    try {
      benchmark.setUp();
    } catch (e) {
      return e;
    }
  } else if (typeof benchmark.setUp !== 'undefined') {
    return new Error('setUp must be either a function or undefined');
  }
  return false;
}

/**
 *  release benchmark resources after running
 *  @TODO how to wait for an async tearDown?
 */
export function tearDownBenchmark(benchmark: Benchmark): Error | false {
  if (typeof benchmark.tearDown === 'function') {
    try {
      benchmark.tearDown();
    } catch (e) {
      return e;
    }
  } else if (typeof benchmark.tearDown !== 'undefined') {
    return new Error('tearDown must be either a function or undefined');
  }
  return false;
}

/**
 * Run an asynchronous benchmark for the desired number of operations and capture
 * the results
 */
export function collectAsynchronousSample(
  benchmark: ASynchronousBenchmark,
  dimensions: DimensionList,
  opsPerSample: number,
  complete: completeFn,
  reject: rejectFn
): void {
  // Pre-allocate to avoid allocating memory during run
  const promises = new Array(opsPerSample);
  const ending = new Array(dimensions.length);

  const setUpError = setUpBenchmark(benchmark);
  if (setUpError) {
    reject(setUpError);
    return;
  }

  cleanUpMemory();

  const starting = startMeasuring(dimensions);

  try {
    // run the benchmark function and collect promises
    for (let i = 0; i < opsPerSample; i++) {
      promises[i] = benchmark.startRunning();
    }
  } catch (e) {
    reject(e);
    return;
  }

  // take measurements when all promises have been resolved
  Promise.all(promises).then(() => {
    stopMeasuring(dimensions, starting, ending);

    const tearDownError = tearDownBenchmark(benchmark);
    if (tearDownError) {
      reject(tearDownError);
      return;
    }

    complete(ending);
  }).catch((error) => {
    reject(error);
  });
}

/**
 * Run a synchronous benchmark for the desired number of operations and capture
 * the results
 */
export function collectSynchronousSample(
  benchmark: SynchronousBenchmark,
  dimensions: DimensionList,
  opsPerSample: number,
  complete: completeFn,
  reject: rejectFn
) {
  // Pre-allocate to avoid allocating memory during run
  const ending = new Array(dimensions.length);

  const setUpError = setUpBenchmark(benchmark);
  if (setUpError) {
    reject(setUpError);
    return;
  }

  cleanUpMemory();

  const starting = startMeasuring(dimensions);

  try {
    // run the benchmark function
    for (let i = 0; i < opsPerSample; i++) {
      benchmark.run();
    }
  } catch (e) {
    reject(e);
    return;
  }

  stopMeasuring(dimensions, starting, ending);

  const tearDownError = tearDownBenchmark(benchmark);
  if (tearDownError) {
    reject(tearDownError);
    return;
  }

  complete(ending);
}
