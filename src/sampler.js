/* @flow */
import type {
  DimensionList
} from './dimension/type';

import type {
  ASynchronousBenchmark,
  SynchronousBenchmark,
  Benchmark
} from './benchmark';

/**
 * A list of measurements corresponding to a list of dimensions
 */
type Measurements = Array<number>;

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
 * Start measuring all requested dimensions in order
 * @param dimensions The dimensions to start measuring
 */
function startMeasuring(dimensions: DimensionList): Measurements {
  const startingMeasurements = new Array(dimensions.length);
  for (let i = 0; i < dimensions.length; i++) {
    startingMeasurements[i] = dimensions[i].startMeasuring();
  }
  return startingMeasurements;
}

/**
 * Take the final measurement of all requested dimensions in the reverse order
 * from which they were started.
 *
 * Receieves a pre-allocated array to prevent need to allocate memory in this
 * function.
 *
 * @param dimensions The dimensions to stop measuring
 * @param startingMeasurements A list of starting measurement for each dimension
 * @param endingMeasurements A pre-allocated Array to record ending measuremsnts into
 * @returns endingMeasurements
 */
function stopMeasuring(
  dimensions: DimensionList,
  startingMeasurements: Measurements,
  endingMeasurements: Measurements
): Measurements {
  for (let i = dimensions.length - 1; i >= 0; i--) {
    /* eslint no-param-reassign:0 */
    endingMeasurements[i] =
      dimensions[i].stopMeasuring(startingMeasurements[i]);
  }
  return endingMeasurements;
}

/**
 *  Setup benchmark resources before running
 *  @TODO how to wait for an async setup?
 */
export function setupBenchmark(benchmark: Benchmark): Error | false {
  if (typeof benchmark.setUp === 'function') {
    try {
      benchmark.setUp();
    } catch (e) {
      return e;
    }
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

  const ErrSetup = setupBenchmark(benchmark);
  if (ErrSetup) {
    reject(ErrSetup);
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
  }

  // take measurements when all promises have been resolved
  Promise.all(promises).then(() => {
    stopMeasuring(dimensions, starting, ending);

    const ErrTearDown = tearDownBenchmark(benchmark);
    if (ErrTearDown) {
      reject(ErrTearDown);
      return;
    }

    complete(ending);
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

  const ErrSetup = setupBenchmark(benchmark);
  if (ErrSetup) {
    reject(ErrSetup);
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
  }

  stopMeasuring(dimensions, starting, ending);

  const ErrTearDown = tearDownBenchmark(benchmark);
  if (ErrTearDown) {
    reject(ErrTearDown);
    return;
  }

  complete(ending);
}
